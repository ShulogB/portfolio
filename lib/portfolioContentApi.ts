import { API_BASE } from "@/lib/api";
import type { CaseStudyForCarousel, GalleryImage } from "@/lib/caseStudyApi";

const REVALIDATE_SECONDS = 60;

export type ExecutiveSnapshotRow = {
  id: number;
  text: string;
  text_es: string;
  order: number;
};

export type ExperienceSummaryRow = {
  id: number;
  scope: string;
  challenge: string;
  decision: string;
  impact: string;
  scope_es: string;
  challenge_es: string;
  decision_es: string;
  impact_es: string;
  order: number;
};

export type PrincipleRow = {
  id: number;
  title: string;
  description: string;
  title_es: string;
  description_es: string;
  order: number;
};

export type TechnologyRow = {
  id: number;
  name: string;
  name_es: string;
  order: number;
};

export type DecisionRow = {
  id: number;
  text: string;
  text_es: string;
  order: number;
};

export type TradeoffRow = {
  id: number;
  decision: string;
  gained: string;
  sacrificed: string;
  decision_es: string;
  gained_es: string;
  sacrificed_es: string;
  order: number;
};

export type DeepDiveEssayRow = {
  id: number;
  title: string;
  title_es: string;
  paragraphs: string[];
  paragraphs_es: string[];
};

export type OptimizeForRow = {
  id: number;
  title: string;
  explanation: string;
  title_es: string;
  explanation_es: string;
  order: number;
};

export type AdrApi = { title: string; href: string };

export type CaseStudyHomeRow = {
  slug: string;
  title: string;
  title_es: string;
  summary: string;
  summary_es: string;
  tech: string;
  tech_es: string;
  live_url: string;
  adrs: AdrApi[];
  diagram_type: string;
  image_url: string | null;
  images: GalleryImage[];
};

export type PortfolioContent = {
  executive_snapshot: ExecutiveSnapshotRow[];
  experience_summary: ExperienceSummaryRow[];
  principles: PrincipleRow[];
  technologies: TechnologyRow[];
  decisions: DecisionRow[];
  tradeoffs: TradeoffRow[];
  deep_dive_essays: DeepDiveEssayRow[];
  optimize_for: OptimizeForRow[];
  case_studies: CaseStudyHomeRow[];
};

export const EMPTY_PORTFOLIO_CONTENT: PortfolioContent = {
  executive_snapshot: [],
  experience_summary: [],
  principles: [],
  technologies: [],
  decisions: [],
  tradeoffs: [],
  deep_dive_essays: [],
  optimize_for: [],
  case_studies: [],
};

function sortByOrder<T extends { order?: number; id: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const oa = a.order ?? 0;
    const ob = b.order ?? 0;
    if (oa !== ob) return oa - ob;
    return a.id - b.id;
  });
}

/** Orden estable para UI (mismo criterio que el admin). */
export function orderedExecutiveSnapshot(p: PortfolioContent): ExecutiveSnapshotRow[] {
  return sortByOrder(p.executive_snapshot);
}

export function orderedExperienceSummary(p: PortfolioContent): ExperienceSummaryRow[] {
  return sortByOrder(p.experience_summary);
}

export function orderedPrinciples(p: PortfolioContent): PrincipleRow[] {
  return sortByOrder(p.principles);
}

export function orderedTechnologies(p: PortfolioContent): TechnologyRow[] {
  return sortByOrder(p.technologies);
}

export function orderedDecisions(p: PortfolioContent): DecisionRow[] {
  return sortByOrder(p.decisions);
}

export function orderedTradeoffs(p: PortfolioContent): TradeoffRow[] {
  return sortByOrder(p.tradeoffs);
}

export function orderedDeepDiveEssays(p: PortfolioContent): DeepDiveEssayRow[] {
  return [...p.deep_dive_essays].sort((a, b) => a.id - b.id);
}

export function orderedOptimizeFor(p: PortfolioContent): OptimizeForRow[] {
  return sortByOrder(p.optimize_for);
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/portfolio-content/`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return EMPTY_PORTFOLIO_CONTENT;
    const data = (await res.json()) as PortfolioContent;
    return {
      executive_snapshot: Array.isArray(data.executive_snapshot) ? data.executive_snapshot : [],
      experience_summary: Array.isArray(data.experience_summary) ? data.experience_summary : [],
      principles: Array.isArray(data.principles) ? data.principles : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      decisions: Array.isArray(data.decisions) ? data.decisions : [],
      tradeoffs: Array.isArray(data.tradeoffs) ? data.tradeoffs : [],
      deep_dive_essays: Array.isArray(data.deep_dive_essays) ? data.deep_dive_essays : [],
      optimize_for: Array.isArray(data.optimize_for) ? data.optimize_for : [],
      case_studies: Array.isArray(data.case_studies) ? data.case_studies : [],
    };
  } catch {
    return EMPTY_PORTFOLIO_CONTENT;
  }
}

/** Carrusel: mismas reglas que antes (al menos una imagen). */
export function caseStudiesToCarouselItems(caseStudies: CaseStudyHomeRow[]): CaseStudyForCarousel[] {
  return caseStudies
    .filter((item) => item?.slug)
    .map((item) => {
      const galleryImages: GalleryImage[] = Array.isArray(item.images)
        ? item.images.map((img) => ({
            id: img?.id ?? 0,
            url: img?.url ?? "",
            caption: img?.caption,
            order: img?.order ?? 0,
          }))
        : [];
      if (galleryImages.length === 0 && typeof item.image_url === "string" && item.image_url) {
        galleryImages.push({ id: 0, url: item.image_url, order: 0 });
      }
      return {
        slug: item.slug,
        title: item.title ?? item.slug,
        title_es: item.title_es,
        images: galleryImages,
      };
    })
    .filter((p) => p.images.length > 0);
}
