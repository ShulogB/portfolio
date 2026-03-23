"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CaseStudyCard from "./CaseStudyCard";
import { API_ENDPOINTS } from "@/lib/api";
import { getProjectBySlug } from "@/lib/projects";
import type { CaseStudyCardContent } from "@/lib/content";

const CASE_STUDY_LABELS: Record<string, string> = {
  "patagonia-dreams": "Patagonia Dreams",
  "municipal-identity": "Municipal Identity",
  "payment-orchestrator": "Payment Orchestrator",
};

const SLUGS = ["patagonia-dreams", "municipal-identity", "payment-orchestrator"] as const;

type CaseStudiesPanelProps = {
  selectedSlug: string;
  onSelect: (slug: string) => void;
};

export default function CaseStudiesPanel({ selectedSlug, onSelect }: CaseStudiesPanelProps) {
  const { content } = useLanguage();
  const caseStudies = content.caseStudies as CaseStudyCardContent[];
  const [imageBySlug, setImageBySlug] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(API_ENDPOINTS.caseStudies)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { results?: Array<{ slug: string; image_url: string | null }> } | Array<{ slug: string; image_url: string | null }> | null) => {
        const list = Array.isArray(data) ? data : data?.results;
        if (!Array.isArray(list)) return;
        const map: Record<string, string> = {};
        list.forEach((item) => {
          if (item.slug && item.image_url) map[item.slug] = item.image_url;
        });
        setImageBySlug(map);
      })
      .catch(() => {});
  }, []);

  const selected = caseStudies.find((c) => c.slug === selectedSlug) ?? caseStudies[0];
  const selectedImage = selected ? imageBySlug[selected.slug] ?? selected.image : undefined;

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 p-1 border-2 border-sega-cyan/50 bg-sega-bg-dark w-fit"
        role="tablist"
        aria-label="Case studies"
      >
        {SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={selectedSlug === slug}
            onClick={() => onSelect(slug)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedSlug === slug
                ? "bg-sega-cyan/20 text-sega-cyan"
                : "text-sega-white/60 hover:text-sega-white"
            }`}
          >
            {CASE_STUDY_LABELS[slug]}
          </button>
        ))}
      </div>
      <div className="max-w-2xl">
        {selected && (
          <CaseStudyCard
            slug={selected.slug}
            title={selected.title}
            tech={selected.tech}
            preview={selected.preview}
            image={selectedImage}
            diagramType={selected.diagramType}
            adrs={selected.adrs}
            externalUrl={
              (() => {
                const project = getProjectBySlug(selected.slug);
                return project?.externalUrl && project.externalUrl !== "#"
                  ? project.externalUrl
                  : undefined;
              })()
            }
          />
        )}
      </div>
    </div>
  );
}
