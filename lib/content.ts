/**
 * Punto de entrada único para contenido por idioma.
 * Server (layout, project page): importan aquí y reciben { en, es }.
 * Client (LanguageContext): importa content-en y carga content-es bajo demanda.
 */
import contentEn from "./content-en";
import contentEs from "./content-es";

export const content = {
  en: contentEn,
  es: contentEs,
} as const;

export { defaultLang, type Lang } from "./content-types";
export type {
  AdrLink,
  CaseStudyCardContent,
  ExperienceSummaryItem,
  OptimizeForItem,
  ProductionDecision,
  RejectedApproach,
  ScaleConstraints,
  TradeoffItem,
  UILabels,
} from "./content-types";
