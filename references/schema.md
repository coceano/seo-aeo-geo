# Datos estructurados (JSON-LD) que sí importan

El schema no hace que Google o una IA te prefiera por sí solo. Sirve para que entiendan sin ambigüedad **quién eres, qué página es y qué responde**. Va en un `<script type="application/ld+json">` dentro del `<head>` y debe coincidir con lo visible en la página.

Valida siempre con https://validator.schema.org y https://search.google.com/test/rich-results.

## 1. Organization (todas las páginas): tu marca como entidad

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://TU-DOMINIO/#org",
  "name": "NOMBRE",
  "url": "https://TU-DOMINIO/",
  "logo": "https://TU-DOMINIO/logo.png",
  "description": "Qué haces, para quién y dónde, en una frase.",
  "email": "TODO",
  "sameAs": [
    "https://www.linkedin.com/company/TODO",
    "https://www.instagram.com/TODO",
    "https://g.page/TODO"
  ]
}
```

`sameAs` conecta tu sitio con tus perfiles reales, y así un buscador sabe que son la misma entidad. **Solo perfiles que existen y son tuyos.** Si tienes ficha en Wikidata, es el enlace más fuerte.

## 2. LocalBusiness (si atiendes en un lugar físico o una zona)

Usa el subtipo más preciso (`Dentist`, `AutoRepair`, `Restaurant`, `ProfessionalService`...). El nombre, la dirección y el teléfono deben ser **idénticos** a los de tu perfil de Google Business.

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://TU-DOMINIO/#negocio",
  "name": "NOMBRE",
  "url": "https://TU-DOMINIO/",
  "telephone": "TODO",
  "address": { "@type": "PostalAddress", "streetAddress": "TODO", "addressLocality": "TODO", "addressRegion": "TODO", "addressCountry": "CL" },
  "areaServed": "TODO",
  "openingHours": "Mo-Fr 09:00-18:00",
  "parentOrganization": { "@id": "https://TU-DOMINIO/#org" }
}
```

## 3. FAQPage (páginas con preguntas visibles)

Solo con preguntas y respuestas **que el visitante ve en la página**. Google muestra el resultado enriquecido de FAQ casi solo a sitios de gobierno y salud, pero el marcado igual ayuda a que buscadores y asistentes identifiquen cada respuesta.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "¿Cuánto demora X?", "acceptedAnswer": { "@type": "Answer", "text": "Respuesta directa de 40-60 palabras, igual a la visible." } }
  ]
}
```

## 4. Article / BlogPosting + Person (artículos)

La fecha de actualización y un autor real con perfil son señales que los asistentes usan para decidir si confían en un texto.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Título igual al H1",
  "datePublished": "2026-01-15",
  "dateModified": "2026-03-02",
  "author": { "@type": "Person", "name": "TODO", "url": "https://TU-DOMINIO/nosotros", "sameAs": ["https://www.linkedin.com/in/TODO"] },
  "publisher": { "@id": "https://TU-DOMINIO/#org" },
  "mainEntityOfPage": "https://TU-DOMINIO/blog/slug"
}
```

Actualiza `dateModified` solo cuando cambies el contenido de verdad, y refléjalo en `<lastmod>` del sitemap.

## 5. WebSite y BreadcrumbList

`WebSite` (en la home) declara el nombre del sitio. `BreadcrumbList` muestra la jerarquía (Inicio › Servicios › X) y ayuda a entender la estructura. Ambos son baratos y sin riesgo.

## No hagas

- Marcar reseñas propias con `Review`/`AggregateRating` en tu propio sitio para conseguir estrellas: Google no las muestra y puede considerarlo manipulación.
- Poner en el schema datos que no están en la página.
- Copiar el mismo FAQPage en todas las páginas.
