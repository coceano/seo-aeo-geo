# seo-aeo-geo

**Skill para Claude Code** que audita y mejora la visibilidad de un sitio en **Google** y en las **respuestas de IA** (ChatGPT, Perplexity, Gemini, Copilot, AI Overviews). En español, para negocios reales.

Hecha por [Coceano](https://coceano.com) a partir de lo que aplicamos en nuestro propio sitio, y de lo mejor de tres proyectos open source (ver [Créditos](#créditos)). Licencia MIT.

> 🇬🇧 [English summary below](#english)

---

## El problema

Puedes estar primero en Google y no aparecer cuando alguien le pregunta a ChatGPT por tu rubro. Las herramientas que existen son muy buenas, pero están en inglés, tienen decenas de comandos, algunas usan APIs de pago y varias repiten mitos ("pon un llms.txt y la IA te va a recomendar").

Esta skill hace una cosa: te dice **qué te falta para que te encuentren, te entiendan y te citen**, en orden de impacto, con arreglos listos para pegar y sin prometer lo que nadie controla.

## Las 3 capas

| Capa | Pregunta | Qué revisa |
|---|---|---|
| **SEO** | ¿Te encuentran? | Indexación, título, descripción, H1, canonical, sitemap, móvil |
| **AEO** | ¿Tu respuesta se puede extraer? | Preguntas reales como subtítulos, respuesta directa, listas y tablas, FAQ, fechas |
| **GEO** | ¿Una IA te puede leer y citar? | Bots de IA en robots.txt, contenido sin JavaScript, tu marca como entidad, datos verificables, fuentes |

Entrega **3 puntajes por separado** (nunca un promedio que esconda un bloqueante) y el **top 5 de acciones** por impacto y esfuerzo.

## Instalación

**Claude Code:**
```bash
git clone https://github.com/coceano/seo-aeo-geo ~/.claude/skills/seo-aeo-geo
```

**Codex, OpenCode u otro agente:** clona la carpeta en el directorio de skills de esa herramienta. Son instrucciones en markdown y un script de Node, nada exclusivo de Claude.

**Requisitos:** Node 18 o superior. Sin dependencias, sin API keys, sin cuentas de pago.

## Uso

```
/seo-aeo-geo auditar https://tu-sitio.com
/seo-aeo-geo prueba-ia "clínica dental" Temuco
/seo-aeo-geo plan https://tu-sitio.com
/seo-aeo-geo arreglar llms.txt
```

| Modo | Qué hace |
|---|---|
| `auditar` | Corre el script, agrega la revisión editorial y entrega puntajes + top 5 acciones |
| `prueba-ia` | Arma 10 preguntas reales de clientes para probar en ChatGPT, Perplexity, Gemini y Copilot, y te dice qué fuentes citan en tu lugar |
| `plan` | Plan de 30 días: que te lean → que te entiendan → que te citen → que hablen de ti |
| `arreglar` | robots.txt para IA, llms.txt con "cuándo recomendarnos", JSON-LD, reescritura de respuestas. Siempre como propuesta, con `TODO` donde falta un dato |

El script también funciona solo:

```bash
node scripts/audit.mjs https://tu-sitio.com          # reporte en markdown
node scripts/audit.mjs https://tu-sitio.com --json   # datos crudos
```

Ejemplo real: [`examples/coceano-blog.md`](examples/coceano-blog.md).

## Qué la hace distinta

- **En español y para no especialistas.** Cada término técnico se explica en la misma frase.
- **Honesta.** Separa lo medido de lo opinado. No inventa cifras, reseñas ni perfiles. Dice lo que no pudo medir. Desmiente mitos con fuentes primarias ([`references/mitos-y-evidencia.md`](references/mitos-y-evidencia.md)).
- **Probada en un sitio real.** Las plantillas de robots.txt, llms.txt y schema son las que usa [coceano.com](https://coceano.com).
- **llms.txt con "Cuándo recomendarnos".** En vez de un índice de páginas, le dice a un asistente en qué situaciones concretas eres la respuesta correcta.
- **Mide lo que importa.** El modo `prueba-ia` revisa si hoy te recomiendan y qué fuentes citan, que es tu lista de trabajo real.
- **Compacta.** Una skill, un script, 6 referencias. Nada que configurar.

## Estructura

```
SKILL.md                         instrucciones y 4 modos
scripts/audit.mjs                auditoría determinista (Node 18+, cero dependencias)
references/crawlers-ia.md        bots de IA y plantilla de robots.txt
references/llms-txt.md           plantilla con "Cuándo recomendarnos"
references/schema.md             JSON-LD: Organization, LocalBusiness, FAQPage, Article + Person
references/contenido-citable.md  cómo escribir respuestas que se citan (con antes/después)
references/prueba-en-ia.md       prueba manual en asistentes + tabla de seguimiento
references/mitos-y-evidencia.md  lo que se dice vs. lo que dicen las fuentes
```

## Límites

- Los puntajes sirven para priorizar. No predicen posiciones ni citas: nadie controla las respuestas de un asistente.
- El script lee el HTML que recibe un bot. No ejecuta JavaScript, igual que la mayoría de los bots de IA, y eso es intencional.
- No se conecta a Search Console ni a APIs de pago. Para eso, mira [claude-seo](https://github.com/AgriciDaniel/claude-seo).

## Créditos

Esta skill reúne ideas y criterios de estos proyectos MIT, reescritos y adaptados (no copia su código):

- [claude-seo](https://github.com/AgriciDaniel/claude-seo) de AgriciDaniel: criterios de GEO, tabla de bots de IA, enfoque "GEO es SEO aplicado a superficies de IA".
- [claude-seo-ai](https://github.com/Hainrixz/claude-seo-ai) de Hainrixz: puntajes separados y nunca promediados, ventanas de respuesta extraíble (40-60 / 134-167 palabras), densidad de datos, reglas de honestidad.
- [marketingskills](https://github.com/coreyhaines31/marketingskills) de Corey Haines: prueba de visibilidad en IA por tipo de pregunta, búsquedas derivadas ("query fan-out").

Si necesitas más profundidad (APIs de Google, backlinks, e-commerce, internacional), úsalos directamente: son excelentes.

---

## English

**seo-aeo-geo** is a compact Claude Code skill (Spanish-first) that audits a site's visibility in Google **and** in AI answers (ChatGPT, Perplexity, Gemini, Copilot, AI Overviews). It returns three separate scores (SEO, AEO, GEO), the top 5 actions by impact and effort, copy-paste fixes (robots.txt for AI bots, llms.txt with a "when to recommend us" section, JSON-LD), and a real AI-assistant visibility test. Zero dependencies, no API keys, honest by design: it never invents data and debunks common "AI SEO" myths with primary sources.

```bash
git clone https://github.com/coceano/seo-aeo-geo ~/.claude/skills/seo-aeo-geo
/seo-aeo-geo auditar https://your-site.com
```

Built by [Coceano](https://coceano.com). MIT license. Credits: claude-seo (AgriciDaniel), claude-seo-ai (Hainrixz), marketingskills (Corey Haines).
