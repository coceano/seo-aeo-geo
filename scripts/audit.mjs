#!/usr/bin/env node
// seo-aeo-geo · auditoría determinista de una URL (Node 18+, cero dependencias).
// Revisa lo que se puede medir sin opinión: SEO técnico/on-page, estructura para motores de respuesta (AEO)
// y acceso/señales para IA generativa (GEO). El juicio editorial (¿el pasaje responde solo?, ¿el dato es propio?)
// lo hace el agente después, leyendo este reporte. Nunca inventa datos: si algo no se pudo medir, lo dice.
//
// Uso:  node audit.mjs <url> [--json]
// Salida: reporte en markdown (o JSON con --json) con 3 puntajes separados: SEO, AEO, GEO (0-100).

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const asJson = args.includes("--json");
if (!url || !/^https?:\/\//.test(url)) {
  console.error("Uso: node audit.mjs <https://tu-sitio.com/pagina> [--json]");
  process.exit(1);
}

const UA = "Mozilla/5.0 (compatible; seo-aeo-geo-audit/1.0; +https://github.com/coceano/seo-aeo-geo)";
const origin = new URL(url).origin;

async function get(u, timeout = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(u, { headers: { "user-agent": UA, accept: "text/html,text/plain,*/*" }, redirect: "follow", signal: ctl.signal });
    const body = await r.text();
    return { ok: r.ok, status: r.status, url: r.url, headers: r.headers, body };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || e), body: "" };
  } finally {
    clearTimeout(t);
  }
}

// ---------- utilidades de HTML (regex tolerante, sin DOM) ----------
const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const strip = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")); return m ? decode(m[2] ?? m[3] ?? m[4] ?? "") : null; };
const metaBy = (html, key, val) => { const re = new RegExp(`<meta[^>]+${key}\\s*=\\s*["']${val}["'][^>]*>`, "i"); const m = html.match(re); return m ? attr(m[0], "content") : null; };

// Lexicones ES/EN para preguntas y rodeos.
const Q_START = /^(¿|qu[eé]\b|c[oó]mo\b|cu[aá]nto|cu[aá]l|cu[aá]ndo|d[oó]nde|por qu[eé]|para qu[eé]|qui[eé]n|es\b|puedo\b|vale\b|what\b|how\b|why\b|when\b|where\b|which\b|who\b|is\b|can\b|does\b|do\b|should\b)/i;
const WINDUP = /^(en (este|esta) (art[ií]culo|secci[oó]n|gu[ií]a)|a continuaci[oó]n|antes de (empezar|comenzar)|in this (article|section|guide)|let'?s (explore|dive|take a look))/i;

// Bots de IA: quién es, para qué sirve y si controla algo en Google.
const AI_BOTS = [
  { ua: "OAI-SearchBot", who: "OpenAI", role: "búsqueda de ChatGPT (citas)", key: true },
  { ua: "GPTBot", who: "OpenAI", role: "entrenamiento de modelos", key: false },
  { ua: "ChatGPT-User", who: "OpenAI", role: "visitas pedidas por un usuario", key: true },
  { ua: "ClaudeBot", who: "Anthropic", role: "rastreo de Claude", key: true },
  { ua: "Claude-User", who: "Anthropic", role: "visitas pedidas por un usuario", key: false },
  { ua: "PerplexityBot", who: "Perplexity", role: "búsqueda de Perplexity (citas)", key: true },
  { ua: "Bingbot", who: "Microsoft", role: "índice de Bing (Copilot y parte de ChatGPT)", key: true },
  { ua: "Google-Extended", who: "Google", role: "Gemini / entrenamiento. NO controla AI Overviews", key: false },
  { ua: "Applebot-Extended", who: "Apple", role: "Apple Intelligence", key: false },
  { ua: "CCBot", who: "Common Crawl", role: "dataset abierto (entrenamiento)", key: false },
];

function robotsVerdict(robots, ua, path = "/") {
  // Parser simple: agrupa por User-agent, aplica la regla más larga (Allow gana en empate).
  const groups = []; let cur = null;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const [k, ...rest] = line.split(":"); const v = rest.join(":").trim(); const key = k.trim().toLowerCase();
    if (key === "user-agent") { if (!cur || cur.rules.length) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); }
    else if ((key === "allow" || key === "disallow") && cur) cur.rules.push({ allow: key === "allow", p: v });
  }
  const pick = groups.find((g) => g.agents.includes(ua.toLowerCase())) || groups.find((g) => g.agents.includes("*"));
  if (!pick) return { allowed: true, via: "sin reglas" };
  let best = null;
  for (const r of pick.rules) { if (r.p === "" ) { if (!r.allow) continue; } if (path.startsWith(r.p) && (!best || r.p.length > best.p.length || (r.p.length === best.p.length && r.allow))) best = r; }
  return { allowed: !best || best.allow || best.p === "", via: pick.agents.includes(ua.toLowerCase()) ? `grupo ${ua}` : "grupo *" };
}

// ---------- chequeos ----------
const checks = [];
const add = (area, id, status, weight, title, detail, fix = "") => checks.push({ area, id, status, weight, title, detail, fix });

const page = await get(url);
if (!page.ok) {
  const out = { url, error: `No se pudo leer la página (HTTP ${page.status}${page.error ? ", " + page.error : ""}). No se inventan resultados.` };
  console.log(asJson ? JSON.stringify(out, null, 2) : `# Auditoría SEO · AEO · GEO\n\n**${url}**\n\n${out.error}`);
  process.exit(2);
}
const html = page.body;
const [robotsR, llmsR, sitemapR] = await Promise.all([get(origin + "/robots.txt"), get(origin + "/llms.txt"), get(origin + "/sitemap.xml")]);
const robots = robotsR.ok ? robotsR.body : "";

// Contenido principal (quita scripts, estilos, nav, header, footer, aside).
const mainHtml = (html.match(/<main[\s\S]*?<\/main>/i) || [html.replace(/<(script|style|noscript|svg|nav|header|footer|aside)[\s\S]*?<\/\1>/gi, " ")])[0].replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ");
const mainText = strip(mainHtml);
const mainWords = words(mainText);
const jsonld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => { try { return JSON.parse(m[1]); } catch { return { __invalid: true }; } });
const types = new Set();
const walk = (o) => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === "object") { const t = o["@type"]; (Array.isArray(t) ? t : t ? [t] : []).forEach((x) => types.add(x)); Object.values(o).forEach(walk); } };
jsonld.forEach(walk);
const findType = (t) => { let hit = null; const w = (o) => { if (hit) return; if (Array.isArray(o)) return o.forEach(w); if (o && typeof o === "object") { const ty = o["@type"]; if (ty === t || (Array.isArray(ty) && ty.includes(t))) hit = o; else Object.values(o).forEach(w); } }; jsonld.forEach(w); return hit; };

// ===== SEO =====
add("SEO", "https", page.url.startsWith("https://") ? "pass" : "fail", 3, "HTTPS", page.url.startsWith("https://") ? "La página se sirve por HTTPS." : "La página no usa HTTPS.", "Activa HTTPS y redirige http→https (301).");
const title = strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]);
add("SEO", "title", !title ? "fail" : title.length >= 25 && title.length <= 65 ? "pass" : "warn", 3, "Título (<title>)", title ? `"${title}" (${title.length} caracteres)` : "No tiene <title>.", "Título único de 25 a 65 caracteres, con el tema principal al inicio.");
const desc = metaBy(html, "name", "description");
add("SEO", "meta-description", !desc ? "fail" : desc.length >= 70 && desc.length <= 165 ? "pass" : "warn", 2, "Meta description", desc ? `${desc.length} caracteres` : "No tiene meta description.", "Resume la respuesta principal en 70 a 160 caracteres.");
const h1s = [...html.matchAll(/<h1[\s\S]*?<\/h1>/gi)].map((m) => strip(m[0]));
add("SEO", "h1", h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn", 3, "Un solo H1", h1s.length ? `${h1s.length} H1: ${h1s.map((h) => `"${h.slice(0, 70)}"`).join(", ")}` : "No tiene H1.", "Un H1 por página que diga de qué trata.");
const canon = (html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [])[0];
add("SEO", "canonical", canon ? "pass" : "warn", 2, "Canonical", canon ? `→ ${attr(canon, "href")}` : "Sin <link rel=canonical>.", "Agrega una URL canónica absoluta.");
const robotsMeta = (metaBy(html, "name", "robots") || "") + " " + (page.headers.get("x-robots-tag") || "");
add("SEO", "indexable", /noindex/i.test(robotsMeta) ? "fail" : "pass", 5, "Indexable", /noindex/i.test(robotsMeta) ? `Tiene noindex (${robotsMeta.trim()}). No aparecerá en Google ni en sus respuestas de IA.` : "Sin noindex.", "Quita noindex si la página debe aparecer.");
const googleBlocked = robots && !robotsVerdict(robots, "Googlebot", new URL(page.url).pathname).allowed;
add("SEO", "robots-google", googleBlocked ? "fail" : "pass", 5, "Googlebot puede rastrear", googleBlocked ? "robots.txt bloquea esta ruta a Googlebot." : robots ? "Permitido en robots.txt." : "No hay robots.txt (se asume permitido).", "Revisa las reglas Disallow de robots.txt.");
add("SEO", "sitemap", sitemapR.ok && /<(urlset|sitemapindex)/i.test(sitemapR.body) ? "pass" : /sitemap:/i.test(robots) ? "pass" : "warn", 2, "Sitemap", sitemapR.ok ? "/sitemap.xml responde." : /sitemap:/i.test(robots) ? "Declarado en robots.txt." : "No se encontró sitemap.", "Publica /sitemap.xml y decláralo en robots.txt.");
add("SEO", "lang", /<html[^>]+lang=/i.test(html) ? "pass" : "warn", 1, "Idioma declarado", /<html[^>]+lang=["']?([\w-]+)/i.test(html) ? `lang="${html.match(/<html[^>]+lang=["']?([\w-]+)/i)[1]}"` : "Falta <html lang>.", 'Declara el idioma: <html lang="es">.');
add("SEO", "viewport", /<meta[^>]+name=["']viewport["']/i.test(html) ? "pass" : "fail", 2, "Móvil (viewport)", /name=["']viewport["']/i.test(html) ? "Tiene meta viewport." : "Falta meta viewport.", "Agrega <meta name=viewport content='width=device-width, initial-scale=1'>.");
const imgs = [...mainHtml.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
const noAlt = imgs.filter((t) => attr(t, "alt") === null).length;
add("SEO", "img-alt", !imgs.length ? "info" : noAlt === 0 ? "pass" : noAlt / imgs.length > 0.3 ? "fail" : "warn", imgs.length ? 1 : 0, "Texto alternativo en imágenes", imgs.length ? `${imgs.length - noAlt}/${imgs.length} imágenes con alt.` : "Sin imágenes en el contenido.", "Describe cada imagen con alt.");
const og = !!metaBy(html, "property", "og:title") && !!metaBy(html, "property", "og:image");
add("SEO", "open-graph", og ? "pass" : "warn", 1, "Vista previa social (Open Graph)", og ? "og:title y og:image presentes." : "Faltan og:title u og:image.", "Agrega og:title, og:description y og:image.");

// ===== AEO (motores de respuesta: que la respuesta se pueda extraer) =====
const heads = [...mainHtml.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-3][\s>]|$)/gi)].map((m) => ({ lvl: +m[1], text: strip(m[2]), after: m[3] }));
const qHeads = heads.filter((h) => /\?\s*$/.test(h.text) || Q_START.test(h.text));
// Preguntas en acordeón (<summary>, <dt>): cuentan como preguntas visibles, con su respuesta a continuación.
const accQ = [...mainHtml.matchAll(/<(summary|dt)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<(?:summary|dt|\/details)[\s>]|$)/gi)].map((m) => ({ lvl: 4, text: strip(m[2]), after: m[3] })).filter((h) => /\?\s*$/.test(h.text) || Q_START.test(h.text));
const h23q = qHeads.length;
qHeads.push(...accQ);
const isArticle = ["Article", "BlogPosting", "NewsArticle", "TechArticle"].some((t) => types.has(t)) || (/<article\b/i.test(html) && mainWords > 600);
add("AEO", "question-headings", !heads.length ? "warn" : qHeads.length >= 2 ? "pass" : qHeads.length === 1 ? "warn" : "fail", 3, "Subtítulos con forma de pregunta", `${qHeads.length} preguntas visibles (${h23q} de ${heads.length} subtítulos H2/H3, ${accQ.length} en acordeón).${qHeads.length ? " Ej.: " + qHeads.slice(0, 3).map((h) => `"${h.text.slice(0, 60)}"`).join(", ") : ""}`, "Convierte subtítulos en las preguntas que hacen tus clientes (¿Cuánto cuesta...? ¿Cómo funciona...?).");
const answers = qHeads.map((h) => { const p = (h.after.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [, ""])[1]; const t = strip(p); return { q: h.text, first: t, n: words(t), windup: WINDUP.test(t) }; });
const direct = answers.filter((a) => a.n >= 20 && a.n <= 80 && !a.windup);
add("AEO", "direct-answers", !qHeads.length ? "info" : direct.length / qHeads.length >= 0.6 ? "pass" : direct.length ? "warn" : "fail", qHeads.length ? 4 : 0, "Respuesta directa tras cada pregunta", qHeads.length ? `${direct.length}/${qHeads.length} preguntas se responden en el primer párrafo (20-80 palabras, sin rodeos).` : "No hay preguntas que evaluar.", "Responde en la primera frase, en 40-60 palabras, y después explica.");
const hasFaqSchema = types.has("FAQPage") || types.has("QAPage");
add("AEO", "faq-schema", hasFaqSchema ? "pass" : qHeads.length >= 3 ? "warn" : "info", qHeads.length >= 3 || hasFaqSchema ? 2 : 0, "Schema de preguntas (FAQPage)", hasFaqSchema ? "Tiene FAQPage/QAPage." : "Sin FAQPage.", "Marca con FAQPage las preguntas que ya están visibles en la página (nunca preguntas ocultas).");
const lists = (mainHtml.match(/<(ul|ol)\b/gi) || []).length, tables = (mainHtml.match(/<table\b/gi) || []).length;
add("AEO", "structure", lists + tables > 0 ? "pass" : mainWords > 300 ? "warn" : "info", mainWords > 300 ? 2 : 0, "Listas y tablas", `${lists} listas, ${tables} tablas.`, "Pasos en lista numerada, comparaciones en tabla: es lo que más se cita textual.");
const firstP = strip((mainHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [, ""])[1]);
add("AEO", "lead-answer", words(firstP) >= 15 && !WINDUP.test(firstP) ? "pass" : "warn", 3, "La página responde al inicio", firstP ? `Primer párrafo: "${firstP.slice(0, 140)}${firstP.length > 140 ? "…" : ""}"` : "No hay párrafo de texto al inicio.", "Abre con la respuesta principal en 1-2 frases; el contexto va después.");
const dated = types.has("Article") || types.has("BlogPosting") || types.has("NewsArticle") ? !!(findType("Article") || findType("BlogPosting") || findType("NewsArticle"))?.dateModified || !!(findType("Article") || findType("BlogPosting"))?.datePublished : /<time[^>]+datetime=/i.test(mainHtml) || !!metaBy(html, "property", "article:modified_time");
add("AEO", "dates", dated ? "pass" : isArticle ? "warn" : "info", isArticle || dated ? 2 : 0, "Fecha visible o en schema", dated ? "Tiene fecha de publicación/actualización." : "No se detectó fecha.", "Muestra y marca la fecha de actualización (dateModified): lo reciente se cita más.");

// ===== GEO (IA generativa: acceso, entidad, citabilidad) =====
const botRows = AI_BOTS.map((b) => ({ ...b, ...(robots ? robotsVerdict(robots, b.ua, new URL(page.url).pathname) : { allowed: true, via: "sin robots.txt" }) }));
const keyBlocked = botRows.filter((b) => b.key && !b.allowed);
add("GEO", "ai-crawlers", keyBlocked.length ? "fail" : "pass", 5, "Buscadores de IA pueden leer tu sitio", keyBlocked.length ? `Bloqueados: ${keyBlocked.map((b) => b.ua).join(", ")}. Esas IA no pueden citarte.` : "OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot y Bingbot permitidos.", "Permite los bots de búsqueda de IA. Puedes bloquear solo los de entrenamiento (GPTBot, CCBot) si quieres.");
const csig = (robots.match(/content-signal:\s*(.+)/i) || [])[1];
add("GEO", "content-signal", "info", 0, "Content-Signal (preferencia de uso)", csig ? `Declarado: ${csig.trim()}` : "No declarado (opcional).", "Opcional: 'Content-Signal: search=yes, ai-input=yes, ai-train=no' separa citarte de entrenar con tu contenido.");
const jsOnly = mainWords < 120 && /<div[^>]+id=["'](root|app|__next)["']/i.test(html);
add("GEO", "server-render", jsOnly ? "fail" : mainWords < 120 ? "warn" : "pass", 4, "Contenido visible sin JavaScript", `${mainWords} palabras en el HTML que recibe un bot.${jsOnly ? " Parece una app que dibuja el texto con JavaScript: la mayoría de bots de IA no lo ejecuta." : ""}`, "Sirve el texto principal en el HTML (render en servidor o estático).");
const org = findType("Organization") || findType("LocalBusiness") || findType("ProfessionalService");
const sameAs = org ? [].concat(org.sameAs || []) : [];
add("GEO", "entity", !org ? "fail" : sameAs.length >= 2 ? "pass" : "warn", 3, "Tu marca como entidad (Organization + sameAs)", org ? `${org["@type"]} "${org.name || "?"}" con ${sameAs.length} perfiles sameAs.` : "No hay schema Organization/LocalBusiness.", "Declara Organization con nombre, logo, url y sameAs a tus perfiles reales (LinkedIn, Instagram, Google Business, Wikidata si existe).");
const nums = (mainText.match(/\b\d+([.,]\d+)?\s?(%|hrs?|horas|d[ií]as|min|km|kg|clientes|usd|clp|€|\$)?/gi) || []).filter((n) => !/^(19|20)\d{2}$/.test(n.trim()));
const per300 = mainWords ? (nums.length / mainWords) * 300 : 0;
add("GEO", "fact-density", mainWords < 150 ? "info" : per300 >= 2 ? "pass" : per300 >= 0.8 ? "warn" : "fail", mainWords < 150 ? 0 : 3, "Datos concretos (densidad de cifras)", `${nums.length} cifras en ${mainWords} palabras (${per300.toFixed(1)} cada 300).`, "Cambia frases genéricas por datos verificables: plazos, cantidades, precios de referencia, resultados. Nunca inventes cifras.");
const outLinks = [...mainHtml.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]).filter((h) => { try { return new URL(h).origin !== origin; } catch { return false; } });
const authority = outLinks.filter((h) => /\.(gov|gob|edu)(\.[a-z]{2})?\b|wikipedia\.org|developers\.google\.com|who\.int|oecd\.org|ine\.|scielo|nature\.com|arxiv\.org|\.cl\/.*(ley|norma)/i.test(h));
add("GEO", "sources", mainWords < 300 || !isArticle ? "info" : authority.length ? "pass" : "warn", mainWords < 300 || !isArticle ? 0 : 2, "Fuentes externas citadas", `${outLinks.length} enlaces externos en el contenido, ${authority.length} a fuentes de autoridad.`, "Cita la fuente primaria de cada dato (organismo, estudio, documentación oficial).");
const llmsOk = llmsR.ok && /^#\s+\S/m.test(llmsR.body) && !/<html/i.test(llmsR.body);
add("GEO", "llms-txt", "info", 0, "llms.txt", llmsOk ? `Presente (${llmsR.body.split("\n").length} líneas).${/cu[aá]ndo recomendar/i.test(llmsR.body) ? " Incluye sección de cuándo recomendarte." : ""}` : "No hay /llms.txt.", "Opcional y sin efecto en Google. Útil para otros asistentes: incluye una sección 'Cuándo recomendarnos' con casos concretos.");

// ---------- puntajes ----------
const factor = { pass: 1, warn: 0.5, fail: 0 };
const score = (area) => { const cs = checks.filter((c) => c.area === area && c.weight > 0 && c.status in factor); const w = cs.reduce((s, c) => s + c.weight, 0); return w ? Math.round((100 * cs.reduce((s, c) => s + factor[c.status] * c.weight, 0)) / w) : null; };
const scores = { SEO: score("SEO"), AEO: score("AEO"), GEO: score("GEO") };
const cap = checks.some((c) => c.weight >= 5 && c.status === "fail");
const priorities = checks.filter((c) => c.status === "fail" || c.status === "warn").sort((a, b) => (b.weight * (b.status === "fail" ? 2 : 1)) - (a.weight * (a.status === "fail" ? 2 : 1))).slice(0, 5);

const result = { url: page.url, page_type: isArticle ? "artículo" : "página", date: new Date().toISOString().slice(0, 10), scores, blocker: cap, words: mainWords, schema_types: [...types], ai_bots: botRows.map(({ ua, who, role, allowed }) => ({ ua, who, role, allowed })), checks, priorities: priorities.map((c) => c.id) };

if (asJson) { console.log(JSON.stringify(result, null, 2)); process.exit(0); }

const icon = { pass: "✅", warn: "⚠️", fail: "❌", info: "ℹ️" };
const band = (v) => (v == null ? "n/d" : `${v}/100`);
let md = `# Auditoría SEO · AEO · GEO\n\n**URL:** ${page.url}  \n**Fecha:** ${result.date}  \n**Tipo:** ${isArticle ? "artículo" : "página"}  \n**Palabras en el HTML:** ${mainWords}  \n**Schema detectado:** ${[...types].join(", ") || "ninguno"}\n\n`;
md += `| SEO | AEO | GEO |\n|---|---|---|\n| ${band(scores.SEO)} | ${band(scores.AEO)} | ${band(scores.GEO)} |\n\n`;
if (cap) md += `> **Bloqueante:** hay un fallo crítico (peso 5). Arréglalo antes que cualquier otra cosa.\n\n`;
md += `Los 3 puntajes se miden por separado y no se promedian. Son una guía para priorizar, no una predicción de posiciones ni de citas.\n\n## Prioridades\n\n`;
priorities.forEach((c, i) => { md += `${i + 1}. **${c.title}** (${c.area}) · ${c.detail}  \n   → ${c.fix}\n`; });
for (const area of ["SEO", "AEO", "GEO"]) {
  md += `\n## ${area}\n\n| | Chequeo | Resultado |\n|---|---|---|\n`;
  checks.filter((c) => c.area === area).forEach((c) => { md += `| ${icon[c.status]} | ${c.title} | ${c.detail.replace(/\|/g, "/")} |\n`; });
}
md += `\n## Bots de IA en robots.txt\n\n| Bot | De | Para qué | ¿Permitido? |\n|---|---|---|---|\n`;
botRows.forEach((b) => { md += `| ${b.ua} | ${b.who} | ${b.role} | ${b.allowed ? "sí" : "**no**"} |\n`; });
md += `\n_Chequeos automáticos. Falta la revisión editorial (¿cada pasaje se entiende solo?, ¿los datos son propios y verificables?) y la prueba real en ChatGPT, Perplexity, Gemini y Copilot._\n`;
console.log(md);
