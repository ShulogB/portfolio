"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { PersonalProjectContent } from "@/lib/content";

/** Simple, on-brand flow diagram (pixel boxes + arrows). No external deps. */
function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="mt-6 mb-1 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-fit">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="font-pixel text-[9px] leading-tight text-sega-white/80 border border-sega-cyan/40 bg-sega-cyan/5 px-2.5 py-2 text-center whitespace-nowrap">
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="font-pixel text-sega-cyan/50 text-xs select-none" aria-hidden>
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
    en: ["Stats ETL", "As-of features", "GBM classifier", "Ensemble", "LLM explains", "Pick"],
    es: ["ETL de stats", "Features as-of", "Clasificador GBM", "Ensemble", "LLM explica", "Pick"],
  },
  llm: {
    en: ["Hand history", "Parser", "LLM + guardrails", "Structured JSON", "UI"],
    es: ["Historial", "Parser", "LLM + guardrails", "JSON estructurado", "UI"],
  },
};

export default function PersonalProjectsSection() {
  const { content, lang } = useLanguage();
  const projects = content.personalProjects as PersonalProjectContent[];
  const labels = content.ui.problemsSolved;

  return (
    <div className="w-full space-y-12">
      <p className="text-sm text-sega-white/75 font-reading leading-relaxed max-w-2xl">
        {content.personalProjectsIntro}
      </p>

      {projects.map((p) => (
        <article
          key={p.slug}
          className="border-2 border-sega-cyan/50 bg-sega-bg-dark/80 p-6 sm:p-8"
        >
          {/* header */}
          <p className="font-pixel text-[10px] text-sega-yellow mb-3">
            {lang === "es" ? "Proyecto personal" : "Personal project"}
          </p>
          <h3 className="font-pixel text-sm text-sega-cyan">{p.title}</h3>
          <p className="mt-2.5 text-xs text-sega-white/60">{p.tech}</p>

          {/* links */}
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

          <p className="mt-4 text-sm text-sega-white/80 font-reading leading-relaxed max-w-3xl">
            {p.tagline}
          </p>

          {/* tags */}
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

          {/* simple flow diagram */}
          <FlowDiagram steps={DIAGRAMS[p.diagram][lang]} />

          {/* problems */}
          <div className="mt-7 pt-6 border-t-2 border-sega-cyan/25">
            <p className="font-pixel text-[10px] text-sega-yellow mb-4">
              {content.ui.sections.problemsSolved}
            </p>
            <ul className="space-y-4">
              {p.problems.map((item, i) => {
                const num = String(i + 1).padStart(2, "0");
                return (
                  <li
                    key={i}
                    className="border border-sega-cyan/20 bg-sega-bg-dark/50 p-5 hover:border-sega-cyan/35 transition-colors duration-150"
                  >
                    <div className="flex gap-4">
                      <span className="font-pixel text-[11px] text-sega-cyan/25 shrink-0 pt-1 leading-none select-none">
                        {num}
                      </span>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div>
                          <span className="inline-block font-pixel text-[9px] text-sega-yellow border border-sega-yellow/35 bg-sega-yellow/8 px-2 py-0.5 mb-2">
                            {labels.context}
                          </span>
                          <p className="text-sm text-sega-white/80 leading-relaxed font-reading">
                            {item.context}
                          </p>
                        </div>
                        <div>
                          <span className="inline-block font-pixel text-[9px] text-sega-cyan border border-sega-cyan/35 bg-sega-cyan/8 px-2 py-0.5 mb-2">
                            {labels.whatYouDid}
                          </span>
                          <p className="text-sm text-sega-white/80 leading-relaxed font-reading">
                            {item.whatYouDid}
                          </p>
                        </div>
                        <div>
                          <span className="inline-block font-pixel text-[9px] text-sega-green border border-sega-green/35 bg-sega-green/8 px-2 py-0.5 mb-2">
                            {labels.impact}
                          </span>
                          <p className="text-sm text-sega-white/80 leading-relaxed font-reading">
                            {item.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
