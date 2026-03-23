/** Tipos y constantes compartidos para contenido por idioma. */

export type AdrLink = { title: string; href: string };

export type ScaleConstraints = {
  requestVolume: string;
  concurrency: string;
  externalDependencies: string;
  failureModes: string;
  dataConsistency: string;
};

export type RejectedApproach = { approach: string; reason: string };

export type ExperienceSummaryItem = {
  scope: string;
  challenge: string;
  decision: string;
  impact: string;
};

export type OptimizeForItem = { title: string; explanation: string };

export type ProductionDecision = {
  title: string;
  context: string;
  decision: string;
  tradeoff: string;
  outcome: string;
};

export type TradeoffItem = {
  decision: string;
  gained: string;
  sacrificed: string;
};

export type CaseStudyCardContent = {
  slug: string;
  title: string;
  tech: string;
  preview: string;
  image?: string;
  diagramType: "payments" | "identity";
  adrs: AdrLink[];
};

export type UILabels = {
  hero: {
    tagline: string;
    caseStudies: string;
    github: string;
    linkedin: string;
    downloadResume: string;
  };
  sections: {
    home: string;
    executiveSnapshot: string;
    experienceSummary: string;
    caseStudies: string;
    principles: string;
    howBuild: string;
    architectureDeepDive: string;
    explicitTradeoffs: string;
    decisions: string;
    stack: string;
    optimizeFor: string;
    contact: string;
  };
  contact: {
    name: string;
    email: string;
    message: string;
    send: string;
    successMessage: string;
    errorMessage: string;
  };
  caseStudy: {
    label: string;
    scaleConstraints: string;
    rejected: string;
    whatWouldBreak: string;
    architectureDecisionRecords: string;
    architectureAndDecisions: string;
    scaleConstraintsRows: { requestVolume: string; concurrency: string; externalDependencies: string; failureModes: string; dataConsistency: string };
    gainedLabel: string;
    sacrificedLabel: string;
  };
  project: {
    overview: string;
    viewLiveSite: string;
    deepDive: string;
    images: string;
  };
  footer: string;
  adminLogin: string;
};

export type Lang = "en" | "es";

export const defaultLang: Lang = "en";
