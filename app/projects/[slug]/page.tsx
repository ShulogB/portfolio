import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/projects";
import { content } from "@/lib/content";
import { LANG_COOKIE_NAME } from "@/context/LanguageContext";
import { ADMIN_LOGIN_URL } from "@/lib/api";
import { getCaseStudy } from "@/lib/caseStudyApi";
import Section from "@/components/Section";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import Button from "@/components/Button";
import ProjectGallery from "@/components/ProjectGallery";
import type { ScaleConstraints, RejectedApproach } from "@/lib/content";
import type { Lang } from "@/lib/content";

const SITE_BASE_URL =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://example.com";

function truncateForMeta(text: string, maxLength: number = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 1).trimEnd().replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };

  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANG_COOKIE_NAME);
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === "es" || langCookie?.value === "es" ? "es" : "en";

  let displayTitle = lang === "es" && project.titleEs ? project.titleEs : project.title;
  let displayOverview = lang === "es" && project.overviewEs ? project.overviewEs : project.overview;
  const { apiCaseStudy: metaCaseStudy } = await getCaseStudy(slug);
  if (metaCaseStudy) {
    if (lang === "es") {
      if (metaCaseStudy.title_es) displayTitle = metaCaseStudy.title_es;
      if (metaCaseStudy.summary_es) displayOverview = metaCaseStudy.summary_es;
    } else {
      if (metaCaseStudy.title) displayTitle = metaCaseStudy.title;
      if (metaCaseStudy.summary) displayOverview = metaCaseStudy.summary;
    }
  }
  const description = truncateForMeta(displayOverview);

  const url = `${SITE_BASE_URL}/projects/${slug}?lang=${lang}`;
  const locale = lang === "es" ? "es_ES" : "en_US";
  const alternateEn = `${SITE_BASE_URL}/projects/${slug}?lang=en`;
  const alternateEs = `${SITE_BASE_URL}/projects/${slug}?lang=es`;

  return {
    title: displayTitle,
    description,
    openGraph: {
      title: displayTitle,
      description,
      url,
      locale,
      alternateLocale: lang === "es" ? "en_US" : "es_ES",
      type: "article",
      siteName: "Senior Backend Engineer – Distributed Systems, Payments, Identity",
    },
    twitter: {
      card: "summary",
      title: displayTitle,
      description,
    },
    alternates: {
      canonical: url,
      languages: {
        "en": alternateEn,
        "es": alternateEs,
        "x-default": alternateEn,
      },
    },
  };
}

function ScaleConstraintsBlock({
  data,
  ui,
}: {
  data: ScaleConstraints;
  ui: (typeof content.en)["ui"];
}) {
  const rows: { label: string; value: string }[] = [
    { label: ui.caseStudy.scaleConstraintsRows.requestVolume, value: data.requestVolume },
    { label: ui.caseStudy.scaleConstraintsRows.concurrency, value: data.concurrency },
    { label: ui.caseStudy.scaleConstraintsRows.externalDependencies, value: data.externalDependencies },
    { label: ui.caseStudy.scaleConstraintsRows.failureModes, value: data.failureModes },
    { label: ui.caseStudy.scaleConstraintsRows.dataConsistency, value: data.dataConsistency },
  ];
  return (
    <dl className="space-y-2 text-sm text-sega-white/80 font-reading">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex gap-2">
          <dt className="shrink-0 w-[10rem] font-pixel text-xs text-sega-yellow">{label}</dt>
          <dd className="leading-relaxed">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RejectedBlock({ items }: { items: RejectedApproach[] }) {
  return (
    <ul className="space-y-3 text-sm text-sega-white/80 font-reading">
      {items.map((item, i) => (
        <li key={i}>
          <span className="text-sega-cyan">{item.approach}.</span>{" "}
          <span className="leading-relaxed">{item.reason}</span>
        </li>
      ))}
    </ul>
  );
}

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANG_COOKIE_NAME);
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === "es" || langCookie?.value === "es" ? "es" : "en";
  const ui = content[lang].ui;

  const { galleryImages, apiCaseStudy, fetchFailed: galleryError } = await getCaseStudy(slug);

  const scaleConstraintsKeys = [
    "requestVolume",
    "concurrency",
    "externalDependencies",
    "failureModes",
    "dataConsistency",
  ] as const;
  const hasValidScaleConstraints = (o: Record<string, unknown> | undefined): o is ScaleConstraints =>
    !!o && scaleConstraintsKeys.every((k) => typeof (o as Record<string, unknown>)[k] === "string");
  // Solo mostrar contenido del idioma seleccionado: EN solo usa campos EN de la API, ES solo _es. Fallback a estático si no hay datos en ese idioma.
  const displayScaleConstraints: ScaleConstraints =
    lang === "es"
      ? (hasValidScaleConstraints(apiCaseStudy?.scale_constraints_es)
          ? (apiCaseStudy!.scale_constraints_es as ScaleConstraints)
          : project.scaleConstraints)
      : (hasValidScaleConstraints(apiCaseStudy?.scale_constraints)
          ? (apiCaseStudy!.scale_constraints as ScaleConstraints)
          : project.scaleConstraints);
  const displayRejectedApproaches: RejectedApproach[] =
    lang === "es"
      ? (apiCaseStudy?.rejected_approaches_es?.length ? apiCaseStudy.rejected_approaches_es : project.rejectedApproaches)
      : (apiCaseStudy?.rejected_approaches?.length ? apiCaseStudy.rejected_approaches : project.rejectedApproaches);
  const displayWhatWouldBreak: string[] =
    lang === "es"
      ? (apiCaseStudy?.what_would_break_es?.length ? apiCaseStudy.what_would_break_es : project.whatWouldBreak)
      : (apiCaseStudy?.what_would_break?.length ? apiCaseStudy.what_would_break : project.whatWouldBreak);
  const displayDeepDive: { title: string; paragraphs: string[] }[] =
    lang === "es"
      ? (apiCaseStudy?.deep_dive_es?.length ? apiCaseStudy.deep_dive_es : project.deepDive)
      : (apiCaseStudy?.deep_dive?.length ? apiCaseStudy.deep_dive : project.deepDive);
  const displayAdrs = (apiCaseStudy?.adrs?.length ? apiCaseStudy.adrs : project.adrs) as { title: string; href: string }[];
  const displayDiagramType: "payments" | "identity" =
    apiCaseStudy?.diagram_type === "payments" || apiCaseStudy?.diagram_type === "identity"
      ? apiCaseStudy.diagram_type
      : project.diagramType;
  const displayAsciiDiagram = apiCaseStudy?.ascii_diagram ?? project.asciiDiagram;

  const displayTech =
    lang === "es"
      ? (apiCaseStudy?.tech_es || project.techEs || project.tech)
      : (apiCaseStudy?.tech || project.tech);

  const displayTitle =
    (lang === "es" && (apiCaseStudy?.title_es || project.titleEs))
      ? (apiCaseStudy?.title_es || project.titleEs)
      : (apiCaseStudy?.title || project.title);
  const displayOverview =
    (lang === "es" && (apiCaseStudy?.summary_es || project.overviewEs))
      ? (apiCaseStudy?.summary_es || project.overviewEs)
      : (apiCaseStudy?.summary || project.overview);
  const externalUrlToShow =
    apiCaseStudy?.live_url && apiCaseStudy.live_url.trim() && apiCaseStudy.live_url !== "#"
      ? apiCaseStudy.live_url
      : project.externalUrl && project.externalUrl !== "#"
        ? project.externalUrl
        : null;

  const backLabel = lang === "es" ? "← VOLVER" : "← BACK";

  const pageUrl = `${SITE_BASE_URL}/projects/${slug}?lang=${lang}`;
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: displayTitle,
    description: truncateForMeta(displayOverview ?? ""),
    url: pageUrl,
    ...(apiCaseStudy?.image_url || galleryImages[0]?.url
      ? { image: apiCaseStudy?.image_url || galleryImages[0]?.url }
      : {}),
    author: {
      "@type": "Person",
      name: content.en.hero.name,
      url: SITE_BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-5 pb-1">
        <Link
          href="/?section=home"
          className="font-pixel text-[10px] text-sega-cyan/80 hover:text-sega-yellow transition-colors"
        >
          {backLabel}
        </Link>
      </div>
      <div className="border-b-2 border-sega-cyan">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="font-pixel text-xs text-sega-yellow mb-2">
            {ui.caseStudy.label}
          </p>
          <h1 className="font-pixel text-xl md:text-2xl text-sega-cyan">
            {displayTitle}
          </h1>
          <p className="mt-2 text-sm text-sega-white/70">
            {displayTech}
          </p>
          {externalUrlToShow && (
            <div className="mt-6">
              <Button href={externalUrlToShow} variant="secondary" external>
                {ui.project.viewLiveSite}
              </Button>
            </div>
          )}
        </div>
      </div>

      {(galleryImages.length > 0 || galleryError) && (
        <Section id="images" title={ui.project.images}>
          {galleryImages.length > 0 ? (
            <ProjectGallery images={galleryImages} />
          ) : (
            <p className="text-sm text-sega-white/60 font-reading">
              {lang === "es" ? "Galería no disponible." : "Gallery unavailable."}
            </p>
          )}
        </Section>
      )}

      <Section id="overview" title={ui.project.overview}>
        <p className="text-sm text-sega-white/80 leading-relaxed max-w-3xl font-reading">
          {displayOverview}
        </p>
        {displayAsciiDiagram && (
          <pre className="mt-6 p-4 border-2 border-sega-cyan/50 bg-sega-bg-dark font-mono text-xs text-sega-cyan leading-relaxed overflow-x-auto">
            <code>{displayAsciiDiagram}</code>
          </pre>
        )}
      </Section>

      <Section id="diagram" title={ui.sections.architectureDeepDive}>
        <div className="bg-sega-bg-dark/80 border-2 border-sega-cyan/50 p-6">
          <ArchitectureDiagram type={displayDiagramType} />
        </div>
      </Section>

      {apiCaseStudy?.engineering_decisions && apiCaseStudy.engineering_decisions.length > 0 && (
        <Section id="architecture-decisions" title={ui.caseStudy.architectureAndDecisions}>
          <div className="space-y-6">
            {apiCaseStudy.engineering_decisions.map((ed, i) => {
              const title = lang === "es" && ed.title_es ? ed.title_es : ed.title;
              const description = lang === "es" && ed.description_es ? ed.description_es : ed.description;
              const tradeoffs = lang === "es" && ed.tradeoffs_es ? ed.tradeoffs_es : ed.tradeoffs;
              if (!title && !description) return null;
              return (
                <div key={ed.id ?? i} className="space-y-2">
                  {title && (
                    <h3 className="font-pixel text-xs text-sega-yellow">{title}</h3>
                  )}
                  {description && (
                    <p className="text-sm text-sega-white/80 leading-relaxed font-reading">
                      {description}
                    </p>
                  )}
                  {tradeoffs && (
                    <p className="text-sm text-sega-white/60 leading-relaxed font-reading italic">
                      {tradeoffs}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section id="scale-constraints" title={ui.caseStudy.scaleConstraints}>
        <ScaleConstraintsBlock data={displayScaleConstraints} ui={ui} />
      </Section>

      <Section id="rejected" title={ui.caseStudy.rejected}>
        <RejectedBlock items={displayRejectedApproaches} />
      </Section>

      <Section id="what-would-break" title={ui.caseStudy.whatWouldBreak}>
        <ul className="space-y-2 text-sm text-sega-white/80 font-reading">
          {displayWhatWouldBreak.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-sega-cyan shrink-0">•</span>
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="deep-dive" title={ui.project.deepDive}>
        <div className="space-y-8">
          {displayDeepDive.map((section) => (
            <div key={section.title}>
              <h3 className="font-pixel text-xs text-sega-yellow mb-3">
                {section.title}
              </h3>
              <div className="space-y-3 text-sm text-sega-white/80 leading-relaxed font-reading">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <footer className="border-t-2 border-sega-cyan/40 py-8 text-center font-pixel text-xs text-sega-cyan/80 space-x-2">
        <Link href="/?section=home" className="hover:text-sega-yellow transition-colors">
          {lang === "es" ? "← Volver al inicio" : "← Back to home"}
        </Link>
        <span>·</span>
        <a
          href={ADMIN_LOGIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-sega-cyan transition-colors"
        >
          {ui.adminLogin}
        </a>
      </footer>
    </main>
    </>
  );
}
