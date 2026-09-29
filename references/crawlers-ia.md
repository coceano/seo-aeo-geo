# Bots de IA y robots.txt

Si un asistente no puede leer tu sitio, no te puede citar. Esta es la lista que importa, separada entre **bots que buscan para responder** (te citan) y **bots que recolectan para entrenar** (no te citan).

| Bot | Empresa | Para qué | Recomendación por defecto |
|---|---|---|---|
| `OAI-SearchBot` | OpenAI | Búsqueda de ChatGPT: de aquí salen las citas | Permitir |
| `ChatGPT-User` | OpenAI | Visita una página cuando un usuario lo pide | Permitir (igual ignora robots.txt) |
| `GPTBot` | OpenAI | Entrenamiento de modelos | A elección |
| `ClaudeBot` | Anthropic | Rastreo de Claude | Permitir |
| `Claude-User` | Anthropic | Visitas pedidas por un usuario | Permitir |
| `PerplexityBot` | Perplexity | Índice de búsqueda de Perplexity | Permitir |
| `Bingbot` | Microsoft | Índice de Bing: Copilot y parte de ChatGPT | Permitir siempre |
| `Googlebot` | Google | Buscador y AI Overviews / AI Mode | Permitir siempre |
| `Google-Extended` | Google | Gemini y entrenamiento. **No controla AI Overviews** | A elección |
| `Applebot-Extended` | Apple | Apple Intelligence | A elección |
| `CCBot` | Common Crawl | Dataset abierto usado para entrenar | A elección (suele bloquearse) |

Los bots "-User" actúan en nombre de una persona y en la práctica no respetan robots.txt. Si necesitas bloquearlos, se hace en el servidor.

## Plantilla recomendada (visibilidad máxima, sin ceder entrenamiento)

Es la que usa coceano.com:

```txt
User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no

# Buscadores y asistentes de IA: permitidos a propósito para poder ser citados.
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

# Solo entrenamiento: descomenta si no quieres que entrenen con tu contenido.
# User-agent: GPTBot
# Disallow: /
# User-agent: CCBot
# Disallow: /

Sitemap: https://TU-DOMINIO/sitemap.xml
```

`Content-Signal` es una propuesta de Cloudflare para declarar el uso permitido: citar sí (`search`, `ai-input`), entrenar no (`ai-train=no`). Es una declaración de preferencia; no bloquea técnicamente a nadie.

## Errores frecuentes

- **Bloqueo heredado.** Plugins de seguridad o el panel del hosting (por ejemplo, el "bloqueo de bots de IA" de Cloudflare) pueden bloquear a todos sin que te enteres. Revisa también el firewall, no solo el archivo.
- **Bloquear `Bingbot` "porque nadie usa Bing".** Copilot usa Bing, y ChatGPT se apoya en parte en su índice. Registra el sitio en Bing Webmaster Tools y activa IndexNow.
- **Creer que bloquear `Google-Extended` te saca de AI Overviews.** No lo hace: eso depende de Googlebot y de `nosnippet`/`noindex`.
- **Contenido solo con JavaScript.** La mayoría de bots de IA no ejecuta JavaScript. Si el texto aparece solo después de cargar scripts, para ellos la página está vacía.
