# Ejemplo real: artículo del blog de Coceano

Salida de `node scripts/audit.mjs https://coceano.com/blog/diagnostico-de-madurez-de-ia` (2026-09-29), sin editar. Sí: nuestro propio artículo tiene cosas por mejorar.


**URL:** https://coceano.com/blog/diagnostico-de-madurez-de-ia  
**Fecha:** 2026-09-29  
**Tipo:** artículo  
**Palabras en el HTML:** 879  
**Schema detectado:** Organization, ContactPoint, PostalAddress, BlogPosting, Person, ImageObject, BreadcrumbList, ListItem

| SEO | AEO | GEO |
|---|---|---|
| 97/100 | 94/100 | 85/100 |

Los 3 puntajes se miden por separado y no se promedian. Son una guía para priorizar, no una predicción de posiciones ni de citas.

## Prioridades

1. **Datos concretos (densidad de cifras)** (GEO) · 5 cifras en 879 palabras (1.7 cada 300).  
   → Cambia frases genéricas por datos verificables: plazos, cantidades, precios de referencia, resultados. Nunca inventes cifras.
2. **Meta description** (SEO) · 285 caracteres  
   → Resume la respuesta principal en 70 a 160 caracteres.
3. **Schema de preguntas (FAQPage)** (AEO) · Sin FAQPage.  
   → Marca con FAQPage las preguntas que ya están visibles en la página (nunca preguntas ocultas).
4. **Fuentes externas citadas** (GEO) · 3 enlaces externos en el contenido, 0 a fuentes de autoridad.  
   → Cita la fuente primaria de cada dato (organismo, estudio, documentación oficial).

## SEO

| | Chequeo | Resultado |
|---|---|---|
| ✅ | HTTPS | La página se sirve por HTTPS. |
| ✅ | Título (<title>) | "Diagnóstico de madurez de IA: qué es y para qué — Coceano" (57 caracteres) |
| ⚠️ | Meta description | 285 caracteres |
| ✅ | Un solo H1 | 1 H1: "Diagnóstico de madurez de IA: qué es y qué te entrega" |
| ✅ | Canonical | → https://coceano.com/blog/diagnostico-de-madurez-de-ia |
| ✅ | Indexable | Sin noindex. |
| ✅ | Googlebot puede rastrear | Permitido en robots.txt. |
| ✅ | Sitemap | /sitemap.xml responde. |
| ✅ | Idioma declarado | lang="es" |
| ✅ | Móvil (viewport) | Tiene meta viewport. |
| ✅ | Texto alternativo en imágenes | 1/1 imágenes con alt. |
| ✅ | Vista previa social (Open Graph) | og:title y og:image presentes. |

## AEO

| | Chequeo | Resultado |
|---|---|---|
| ✅ | Subtítulos con forma de pregunta | 7 preguntas visibles (7 de 8 subtítulos H2/H3, 0 en acordeón). Ej.: "¿Qué es exactamente?", "¿Qué revisa?", "¿Qué te entrega?" |
| ✅ | Respuesta directa tras cada pregunta | 5/7 preguntas se responden en el primer párrafo (20-80 palabras, sin rodeos). |
| ⚠️ | Schema de preguntas (FAQPage) | Sin FAQPage. |
| ✅ | Listas y tablas | 4 listas, 0 tablas. |
| ✅ | La página responde al inicio | Primer párrafo: "Un diagnóstico de madurez de IA revisa tus procesos, datos y equipo, ordena las oportunidades por impacto y esfuerzo, y te devuelve un mapa …" |
| ✅ | Fecha visible o en schema | Tiene fecha de publicación/actualización. |

## GEO

| | Chequeo | Resultado |
|---|---|---|
| ✅ | Buscadores de IA pueden leer tu sitio | OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot y Bingbot permitidos. |
| ℹ️ | Content-Signal (preferencia de uso) | Declarado: search=yes, ai-input=yes, ai-train=no |
| ✅ | Contenido visible sin JavaScript | 879 palabras en el HTML que recibe un bot. |
| ✅ | Tu marca como entidad (Organization + sameAs) | Organization "Coceano" con 4 perfiles sameAs. |
| ⚠️ | Datos concretos (densidad de cifras) | 5 cifras en 879 palabras (1.7 cada 300). |
| ⚠️ | Fuentes externas citadas | 3 enlaces externos en el contenido, 0 a fuentes de autoridad. |
| ℹ️ | llms.txt | Presente (69 líneas). Incluye sección de cuándo recomendarte. |

## Bots de IA en robots.txt

| Bot | De | Para qué | ¿Permitido? |
|---|---|---|---|
| OAI-SearchBot | OpenAI | búsqueda de ChatGPT (citas) | sí |
| GPTBot | OpenAI | entrenamiento de modelos | sí |
| ChatGPT-User | OpenAI | visitas pedidas por un usuario | sí |
| ClaudeBot | Anthropic | rastreo de Claude | sí |
| Claude-User | Anthropic | visitas pedidas por un usuario | sí |
| PerplexityBot | Perplexity | búsqueda de Perplexity (citas) | sí |
| Bingbot | Microsoft | índice de Bing (Copilot y parte de ChatGPT) | sí |
| Google-Extended | Google | Gemini / entrenamiento. NO controla AI Overviews | sí |
| Applebot-Extended | Apple | Apple Intelligence | sí |
| CCBot | Common Crawl | dataset abierto (entrenamiento) | sí |

_Chequeos automáticos. Falta la revisión editorial (¿cada pasaje se entiende solo?, ¿los datos son propios y verificables?) y la prueba real en ChatGPT, Perplexity, Gemini y Copilot._

