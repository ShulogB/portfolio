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

/** Context → what you did → impact (interview-style bullets per project). */
export type ProblemResolutionItem = {
  context: string;
  whatYouDid: string;
  impact: string;
};

export type ProblemResolutionProjectGroup = {
  projectTitle: string;
  items: ProblemResolutionItem[];
};

export type UILabels = {
  hero: {
    tagline: string;
    caseStudies: string;
    /** Primary CTA under hero (e.g. View projects). */
    viewProjects: string;
    github: string;
    linkedin: string;
    downloadResume: string;
  };
  problemsSolved: {
    context: string;
    whatYouDid: string;
    impact: string;
  };
  sections: {
    home: string;
    executiveSnapshot: string;
    experienceSummary: string;
    caseStudies: string;
    /** Sidebar + section title for production work list. */
    productionProjects: string;
    problemsSolved: string;
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
    /** Shorter label on compact project cards. */
    productionProjectLabel: string;
    scaleConstraints: string;
    rejected: string;
    whatWouldBreak: string;
    architectureDecisionRecords: string;
    architectureAndDecisions: string;
    viewDetails: string;
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
