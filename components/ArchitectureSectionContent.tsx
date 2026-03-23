"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { TradeoffItem } from "@/lib/content";

const TRADEOFFS_INDEX = 0;

export default function ArchitectureSectionContent() {
  const { content } = useLanguage();
  const essays = content.deepDiveEssays as { title: string; paragraphs: string[] }[];
  const tradeoffs = content.explicitTradeoffs as TradeoffItem[];
  const tradeoffsTitle = content.ui.sections.explicitTradeoffs;
  const [selectedIndex, setSelectedIndex] = useState(TRADEOFFS_INDEX);
  const isTradeoffs = selectedIndex === TRADEOFFS_INDEX;
  const selectedEssay = !isTradeoffs ? essays[selectedIndex - 1] : null;

  return (
    <div className="flex gap-8">
      <nav
        className="shrink-0 w-48 border-r-2 border-sega-cyan/50 pr-4"
        aria-label="Architecture topics"
      >
        <ul className="space-y-0.5 text-xs font-pixel">
          <li>
            <button
              type="button"
              onClick={() => setSelectedIndex(TRADEOFFS_INDEX)}
              className={`w-full text-left py-2 px-2 border-l-2 transition-colors ${
                isTradeoffs
                  ? "border-sega-cyan bg-sega-cyan/10 text-sega-cyan"
                  : "border-transparent text-sega-white/60 hover:text-sega-cyan"
              }`}
            >
              {tradeoffsTitle}
            </button>
          </li>
          {essays.map((essay, i) => (
            <li key={essay.title}>
              <button
                type="button"
                onClick={() => setSelectedIndex(i + 1)}
                className={`w-full text-left py-2 px-2 border-l-2 transition-colors ${
                  selectedIndex === i + 1
                    ? "border-sega-cyan bg-sega-cyan/10 text-sega-cyan"
                    : "border-transparent text-sega-white/60 hover:text-sega-cyan"
                }`}
              >
                {essay.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        {isTradeoffs ? (
          <article>
            <h3 className="font-pixel text-xs text-sega-yellow mb-4">
              {tradeoffsTitle}
            </h3>
            <ul className="space-y-6 text-sm text-sega-white/80 font-reading">
              {tradeoffs.map((t, i) => (
                <li key={i} className="border-l-2 border-sega-cyan pl-4 space-y-2">
                  <p className="font-medium text-sega-cyan">{t.decision}</p>
                  <p><span className="text-sega-yellow/90">{content.ui.caseStudy.gainedLabel} </span><span className="leading-relaxed">{t.gained}</span></p>
                  <p><span className="text-sega-yellow/90">{content.ui.caseStudy.sacrificedLabel} </span><span className="leading-relaxed">{t.sacrificed}</span></p>
                </li>
              ))}
            </ul>
          </article>
        ) : selectedEssay && (
          <article>
            <h3 className="font-pixel text-xs text-sega-yellow mb-4">
              {selectedEssay.title}
            </h3>
            <div className="space-y-3 text-sm text-sega-white/80 leading-relaxed font-reading">
              {selectedEssay.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
