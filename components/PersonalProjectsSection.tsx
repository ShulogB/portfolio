"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { PersonalProjectContent } from "@/lib/content";

/** Simple, on-brand flow diagram (pixel boxes + arrows). No external deps. */
function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-fit">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <span className="font-pixel text-[8px] leading-tight text-sega-white/80 border border-sega-cyan/40 bg-sega-cyan/5 px-2 py-1.5 text-center whitespace-nowrap">
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="font-pixel text-sega-cyan/50 text-[10px] select-none" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const DIAGRAMS: Record<PersonalProjectContent["diagram"], { en: string[]; es: string[] }> = {
  ml: {
    en: ["Stats ETL", "Features", "GBM", "Ensemble", "LLM", "Pick"],
    es: ["ETL stats", "Features", "GBM", "Ensemble", "LLM", "Pick"],
  },
  llm: {
    en: ["Hand", "Parser", "LLM + guardrails", "JSON", "UI"],
    es: ["Mano", "Parser", "LLM + guardrails", "JSON", "UI"],
  },
};

type Props = {
  onViewDetails: (anchor: string) => void;
};

export default function PersonalProjectsSection({ onViewDetails }: Props) {
  const { content, lang } = useLanguage();
  const projects = content.personalProjects as PersonalProjectContent[];

  return (
    <div className="w-full space-y-8">
      <p className="text-sm text-sega-white/75 font-reading leading-relaxed max-w-2xl">
        {content.personalProjectsIntro}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.slug}
            className="border-2 border-sega-cyan/50 bg-sega-bg-dark/80 p-6 sm:p-7 flex flex-col hover:border-sega-cyan hover:shadow-sega-inner transition-all duration-200"
          >
            <p className="font-pixel text-[10px] text-sega-yellow mb-3">
              {lang === "es" ? "Proyecto personal" : "Personal project"}
            </p>
            <h3 className="font-pixel text-sm text-sega-cyan">{p.title}</h3>
            <p className="mt-2.5 text-xs text-sega-white/60">{p.tech}</p>

            {(p.liveUrl || p.repoUrl) && (
              <div className="mt-3 flex flex-wrap gap-4">
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-[10px] text-sega-cyan/80 hover:text-sega-yellow transition-colors inline-flex items-center gap-1"
                  >
                    {content.ui.project.viewLiveSite}
                    <span aria-hidden>↗</span>
                  </a>
                )}
                {p.repoUrl && (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-[10px] text-sega-cyan/80 hover:text-sega-yellow transition-colors inline-flex items-center gap-1"
                  >
                    GitHub
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            )}

            <p className="mt-4 text-sm text-sega-white/80 font-reading leading-relaxed flex-1">
              {p.tagline}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="font-pixel text-[8px] text-sega-cyan/80 border border-sega-cyan/30 bg-sega-cyan/5 px-2 py-1"
                >
                  {t}
                </span>
              ))}
            </div>

            <FlowDiagram steps={DIAGRAMS[p.diagram][lang]} />

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onViewDetails(p.problemsAnchor)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-pixel border border-sega-cyan/40 text-sega-white hover:border-sega-cyan/70 hover:bg-sega-cyan/8 hover:text-sega-cyan transition-all duration-200"
              >
                {lang === "es" ? "Ver problemas resueltos" : "See problems solved"}
                <span aria-hidden>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
