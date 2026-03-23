# Imágenes de proyectos

Coloca aquí las imágenes de cada case study (por ejemplo `patagonia-dreams.jpg`, `municipal-identity.webp`).

En `lib/content.ts`, en cada objeto de `caseStudies`, añade la propiedad opcional:

```ts
image: "/images/projects/patagonia-dreams.jpg",
```

- Rutas: siempre desde la raíz del sitio (`/images/...`). Next.js sirve lo que está en `public/`.
- Formatos: JPG, WebP o PNG. Para mejor rendimiento, usa `next/image` (ya usado en `CaseStudyCard`) y tamaños razonables (ej. 640×360 o 800×450).
- Si no añades `image`, la tarjeta del proyecto se muestra igual, sin imagen.
