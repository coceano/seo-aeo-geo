---
name: seo-aeo-geo
description: >
  Auditoría y plan de visibilidad en Google y en respuestas de IA (ChatGPT, Perplexity, Gemini, Copilot, AI Overviews)
  para sitios de negocios, en español. Combina SEO (que te encuentren), AEO (que tu respuesta se pueda extraer) y
  GEO (que una IA te pueda leer, entender como entidad y citar). Mide con un script sin dependencias, prioriza por
  impacto y esfuerzo, entrega arreglos listos para pegar (robots.txt, llms.txt, JSON-LD, respuestas reescritas) y
  una prueba real en asistentes de IA. Úsala cuando digan "SEO", "AEO", "GEO", "aparecer en ChatGPT", "que la IA me
  recomiende", "AI Overviews", "Perplexity", "visibilidad en IA", "llms.txt", "schema", "auditar mi web".
user-invocable: true
argument-hint: "[auditar|prueba-ia|plan|arreglar] <url o negocio>"
license: MIT
metadata:
  author: Coceano (github.com/coceano)
  version: "1.0.0"
  based_on: "claude-seo (AgriciDaniel, MIT), claude-seo-ai (Hainrixz, MIT), marketingskills/ai-seo (Corey Haines, MIT) + práctica aplicada en coceano.com"
---

# SEO · AEO · GEO

Tres capas de una misma estrategia, no tres disciplinas separadas:

| Capa | Pregunta que responde | Qué se trabaja |
|---|---|---|
| **SEO** | ¿Te encuentran? | Indexación, títulos, estructura, velocidad, sitemap, enlaces |
| **AEO** | ¿Tu respuesta se puede extraer? | Preguntas reales como subtítulos, respuesta directa de 40-60 palabras, listas, tablas, FAQ |
| **GEO** | ¿Una IA te puede leer, entender y citar? | Acceso de bots de IA, contenido sin JavaScript, marca como entidad, datos verificables, presencia en fuentes externas |

Para Google, AEO y GEO siguen siendo SEO bien hecho: sus funciones de IA salen de su mismo índice y sus mismos sistemas de calidad. Para ChatGPT, Perplexity, Claude y Copilot, además pesan la estructura extraíble, el acceso de sus bots y lo que otros sitios dicen de ti. Esta skill trabaja las dos realidades sin vender trucos.

## Modos

Si el usuario no indica modo, pregunta cuál necesita o infiérelo: con una URL → `auditar`; con un rubro y una ciudad → `prueba-ia`.

### 1. `auditar <url>`

1. Corre el script (Node 18+, sin instalar nada):
   ```bash
   node "<carpeta-de-esta-skill>/scripts/audit.mjs" <url>
   ```
   Con `--json` devuelve los datos crudos. Si la URL no responde, dilo y detente: nunca completes resultados de memoria.
2. Lee el reporte y haz la **revisión editorial** que el script no puede hacer (ver `references/contenido-citable.md`):
   - ¿Cada respuesta se entiende sola, sin "como dijimos arriba"?
   - ¿Los datos son propios y verificables, o son frases que podría firmar cualquiera?
   - ¿La página responde la intención real de quien busca (ver, comparar, contratar)?
3. Entrega:
   - Los **3 puntajes por separado** (SEO, AEO, GEO). Nunca los promedies en uno solo.
   - **Top 5 acciones** ordenadas por impacto ÷ esfuerzo, cada una con: qué cambiar, dónde, ejemplo concreto y cuánto toma.
   - Lo que **no se pudo medir** y cómo medirlo (Search Console, prueba en IA).
   - Si hay un bloqueante (noindex, bots de IA bloqueados, contenido solo con JavaScript), va primero y en negrita.

Para varias páginas, audita la home, 1 página de servicio y 1 artículo. Los problemas de plantilla se repiten en todo el sitio.

### 2. `prueba-ia <rubro> <ciudad o mercado> [marca]`

Mide lo único que de verdad importa: si hoy te recomiendan. Sigue `references/prueba-en-ia.md`:
1. Genera 10 preguntas reales de clientes en 4 tipos: descubrimiento ("mejor X en Y"), comparación, problema ("cómo resuelvo..."), marca ("¿qué opinan de...?").
2. Si tienes búsqueda web, ejecútalas y anota quién aparece y qué fuentes cita cada asistente. Si no, entrega la tabla para que el usuario la llene en ChatGPT, Perplexity, Gemini y Copilot.
3. Resume: en cuántas apareces, quién aparece en tu lugar y **qué fuentes citan** (esas fuentes son tu lista de trabajo para GEO).
Nunca afirmes que alguien aparece o no aparece sin haberlo visto en una respuesta real.

### 3. `plan <url o negocio>`

Plan de 30 días en 4 semanas, cada tarea con responsable sugerido y tiempo estimado:
- **Semana 1 · Que te lean:** bloqueantes técnicos, robots.txt, sitemap, bots de IA, contenido sin JavaScript, títulos.
- **Semana 2 · Que te entiendan:** Organization + sameAs, LocalBusiness si aplica, página "sobre nosotros" con datos verificables, llms.txt con "cuándo recomendarnos".
- **Semana 3 · Que te citen:** reescribir las 3-5 páginas clave con preguntas reales, respuestas de 40-60 palabras, datos propios, FAQ visible + FAQPage.
- **Semana 4 · Que hablen de ti:** perfil de Google Business, reseñas, directorios y medios del rubro, la fuente que la prueba en IA mostró que citan. Repetir la prueba en IA y comparar.

### 4. `arreglar <qué>`

Genera artefactos listos para pegar, **siempre como propuesta** que el usuario revisa. Si vas a escribir en archivos del proyecto, muestra el diff y pide confirmación antes:
- `robots.txt` para IA → `references/crawlers-ia.md`
- `llms.txt` con sección "Cuándo recomendarnos" → `references/llms-txt.md`
- JSON-LD (Organization, WebSite, LocalBusiness, FAQPage, Article + Person, BreadcrumbList) → `references/schema.md`
- Reescritura de respuestas y primer párrafo → `references/contenido-citable.md`

Si falta un dato (dirección, perfil, cifra, fecha), deja `TODO: <qué falta>` en su lugar. **Nunca inventes** cifras, reseñas, autores, perfiles sameAs ni fuentes.

## Reglas de honestidad (no negociables)

Detalle y fuentes en `references/mitos-y-evidencia.md`.
- **No prometas posiciones ni citas.** Los puntajes son una guía para priorizar, no una predicción.
- **llms.txt no mueve nada en Google.** Google lo ignora. Puede servir a otros asistentes; preséntalo como opcional.
- **Google-Extended no controla AI Overviews.** Solo afecta a Gemini y al entrenamiento. Para salir de AI Overviews se usan `nosnippet`/`noindex`, con su costo.
- **No escribas contenido "para la IA".** Nada de trocear textos, relleno de keywords o páginas duplicadas por ciudad: Google lo trata como spam de contenido a escala. Escribe para personas y organiza con claridad.
- **FAQPage solo con preguntas visibles** en la página. Google limita el rich result de FAQ a sitios de gobierno y salud, pero el marcado sigue ayudando a entender la página.
- **Cada cifra con fuente.** Si una estadística de la industria no tiene fuente primaria verificable, no la uses.
- **Separa lo medido de lo opinado.** Lo que sale del script es medición; la revisión editorial es criterio y se presenta como tal.

## Formato de salida

- Español claro, sin jerga. Si usas un término técnico, explícalo en la misma frase.
- Tablas cortas, acciones con verbo en imperativo ("Agrega...", "Cambia...").
- Al final, una línea con el siguiente paso más útil.
