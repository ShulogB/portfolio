"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import { orderedDecisions } from "@/lib/portfolioContentApi";

export default function DecisionsFromPortfolio() {
  const { content, lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const title = content.ui.sections.decisions;
  const lines = orderedDecisions(portfolio)
    .map((row) => (lang === "es" && row.text_es ? row.text_es : row.text))
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className="pb-6 mb-6 border-b-2 border-sega-cyan/30">
      <p className="font-pixel text-[10px] text-sega-yellow mb-4">{title}</p>
      <ul className="space-y-2 text-sm text-sega-white/80 font-reading list-disc list-inside">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
