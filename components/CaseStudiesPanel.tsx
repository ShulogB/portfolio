"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import CaseStudyCard from "./CaseStudyCard";
import type { CaseStudyHomeRow } from "@/lib/portfolioContentApi";
import type { AdrLink } from "@/lib/content";

type CaseStudiesPanelProps = {
  selectedSlug: string;
  onSelect: (slug: string) => void;
};

function normalizeAdrs(raw: unknown): AdrLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item && typeof item === "object" && "title" in item && "href" in item) {
        const o = item as { title?: string; href?: string };
        return { title: String(o.title ?? ""), href: String(o.href ?? "#") };
      }
      return null;
    })
    .filter((x): x is AdrLink => !!x && !!x.title);
}

function diagramFromRow(row: CaseStudyHomeRow): "payments" | "identity" | undefined {
  const d = row.diagram_type;
  return d === "payments" || d === "identity" ? d : undefined;
}

export default function CaseStudiesPanel({ selectedSlug, onSelect }: CaseStudiesPanelProps) {
  const { lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const rows = [...portfolio.case_studies].sort((a, b) => a.slug.localeCompare(b.slug));

  const labels: Record<string, string> = {};
  rows.forEach((r) => {
    labels[r.slug] =
      lang === "es" && r.title_es ? r.title_es : r.title || r.slug;
  });

  const selected: CaseStudyHomeRow | undefined =
    rows.find((c) => c.slug === selectedSlug) ?? rows[0];

  const title =
    selected && (lang === "es" && selected.title_es ? selected.title_es : selected.title);
  const tech =
    selected && (lang === "es" && selected.tech_es ? selected.tech_es : selected.tech);
  const preview =
    selected &&
    (lang === "es" && selected.summary_es ? selected.summary_es : selected.summary);
  const image =
    selected?.image_url ||
    (selected?.images?.[0]?.url ?? undefined);
  const externalUrl =
    selected?.live_url && selected.live_url !== "#" ? selected.live_url : undefined;

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 p-1 border-2 border-sega-cyan/50 bg-sega-bg-dark w-fit"
        role="tablist"
        aria-label="Case studies"
      >
        {rows.map((row) => (
          <button
            key={row.slug}
            type="button"
            role="tab"
            aria-selected={selectedSlug === row.slug}
            onClick={() => onSelect(row.slug)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedSlug === row.slug
                ? "bg-sega-cyan/20 text-sega-cyan"
                : "text-sega-white/60 hover:text-sega-white"
            }`}
          >
            {labels[row.slug] ?? row.slug}
          </button>
        ))}
      </div>
      <div className="max-w-2xl">
        {selected && title && (
          <CaseStudyCard
            slug={selected.slug}
            title={title}
            tech={tech || ""}
            preview={preview || ""}
            image={image}
            diagramType={diagramFromRow(selected)}
            adrs={normalizeAdrs(selected.adrs)}
            externalUrl={externalUrl}
          />
        )}
      </div>
    </div>
  );
}
