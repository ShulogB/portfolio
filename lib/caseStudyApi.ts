import { API_BASE } from "@/lib/api";

const REVALIDATE_SECONDS = 60;

export type EngineeringDecisionItem = {
  id?: number;
  title?: string;
  title_es?: string;
  description?: string;
  description_es?: string;
  tradeoffs?: string;
  tradeoffs_es?: string;
};

export type CaseStudyFromApi = {
  title?: string;
  title_es?: string;
  summary?: string;
  summary_es?: string;
  tech?: string;
  tech_es?: string;
  live_url?: string;
  /** URL de la imagen principal (galería o legacy). Para SEO / JSON-LD. */
  image_url?: string;
  engineering_decisions?: EngineeringDecisionItem[];
  scale_constraints?: Record<string, string>;
  scale_constraints_es?: Record<string, string>;
  rejected_approaches?: { approach: string; reason: string }[];
  rejected_approaches_es?: { approach: string; reason: string }[];
  what_would_break?: string[];
  what_would_break_es?: string[];
  deep_dive?: { title: string; paragraphs: string[] }[];
  deep_dive_es?: { title: string; paragraphs: string[] }[];
  adrs?: { title: string; href: string }[];
  diagram_type?: string;
  ascii_diagram?: string;
};

export type GalleryImage = {
  id: number;
  url: string;
  caption?: string;
  order: number;
};

export type GetCaseStudyResult = {
  galleryImages: GalleryImage[];
  apiCaseStudy: CaseStudyFromApi | null;
  /** true si el fetch falló (red o API caída) */
  fetchFailed: boolean;
};

/**
 * Fetch case study from the API. Usado por la página de proyecto y por generateMetadata.
 * Next.js deduplica fetches con la misma URL en el mismo request.
 */
export async function getCaseStudy(slug: string): Promise<GetCaseStudyResult> {
  const defaultResult: GetCaseStudyResult = { galleryImages: [], apiCaseStudy: null, fetchFailed: true };
  try {
    const res = await fetch(`${API_BASE}/api/v1/case-studies/${slug}/`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return defaultResult;
    const data = await res.json();

    const galleryImages: GalleryImage[] = Array.isArray(data?.images)
      ? data.images.map((img: { id?: number; url?: string; caption?: string; order?: number }) => ({
          id: img?.id ?? 0,
          url: img?.url ?? "",
          caption: img?.caption,
          order: img?.order ?? 0,
        }))
      : [];

    const apiCaseStudy: CaseStudyFromApi = {
      title: data?.title,
      title_es: data?.title_es,
      summary: data?.summary,
      summary_es: data?.summary_es,
      tech: data?.tech,
      tech_es: data?.tech_es,
      live_url: data?.live_url,
      image_url: typeof data?.image_url === "string" ? data.image_url : undefined,
      engineering_decisions: Array.isArray(data?.engineering_decisions) ? data.engineering_decisions : undefined,
      scale_constraints: data?.scale_constraints && typeof data.scale_constraints === "object" ? data.scale_constraints : undefined,
      scale_constraints_es: data?.scale_constraints_es && typeof data.scale_constraints_es === "object" ? data.scale_constraints_es : undefined,
      rejected_approaches: Array.isArray(data?.rejected_approaches) ? data.rejected_approaches : undefined,
      rejected_approaches_es: Array.isArray(data?.rejected_approaches_es) ? data.rejected_approaches_es : undefined,
      what_would_break: Array.isArray(data?.what_would_break) ? data.what_would_break : undefined,
      what_would_break_es: Array.isArray(data?.what_would_break_es) ? data.what_would_break_es : undefined,
      deep_dive: Array.isArray(data?.deep_dive) ? data.deep_dive : undefined,
      deep_dive_es: Array.isArray(data?.deep_dive_es) ? data.deep_dive_es : undefined,
      adrs: Array.isArray(data?.adrs) ? data.adrs : undefined,
      diagram_type: typeof data?.diagram_type === "string" ? data.diagram_type : undefined,
      ascii_diagram: typeof data?.ascii_diagram === "string" ? data.ascii_diagram : undefined,
    };

    return { galleryImages, apiCaseStudy, fetchFailed: false };
  } catch {
    return defaultResult;
  }
}

export type CaseStudyForCarousel = {
  slug: string;
  title: string;
  title_es?: string;
  images: GalleryImage[];
};

/**
 * Lista de case studies con sus imágenes para el carrusel del home.
 * Soporta respuesta paginada (results) o array directo.
 */
export async function getCaseStudiesForCarousel(): Promise<CaseStudyForCarousel[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/case-studies/`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data?.results ?? []);
    const mapped = items
      .filter((item: { slug?: string }) => item?.slug)
      .map((item: { slug: string; title?: string; title_es?: string; image_url?: string; images?: { id?: number; url?: string; caption?: string; order?: number }[] }) => {
        const galleryImages: GalleryImage[] = Array.isArray(item?.images)
          ? item.images.map((img: { id?: number; url?: string; caption?: string; order?: number }) => ({
              id: img?.id ?? 0,
              url: img?.url ?? "",
              caption: img?.caption,
              order: img?.order ?? 0,
            }))
          : [];
        if (galleryImages.length === 0 && typeof item?.image_url === "string" && item.image_url) {
          galleryImages.push({ id: 0, url: item.image_url, order: 0 });
        }
        return {
          slug: item.slug,
          title: item.title ?? item.slug,
          title_es: item.title_es,
          images: galleryImages,
        };
      })
      .filter((p: CaseStudyForCarousel) => p.images.length > 0);
    return mapped;
  } catch {
    return [];
  }
}
