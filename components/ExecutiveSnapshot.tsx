"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import { orderedExecutiveSnapshot } from "@/lib/portfolioContentApi";

export default function ExecutiveSnapshot() {
  const { content, lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const title = content.ui.sections.executiveSnapshot;
  const bullets = orderedExecutiveSnapshot(portfolio)
    .map((row) => (lang === "es" && row.text_es ? row.text_es : row.text))
    .filter(Boolean);

  if (bullets.length === 0) return null;

  return (
    <div className="pb-6 mb-6 border-b-2 border-sega-cyan/30">
      <p className="font-pixel text-[10px] text-sega-yellow mb-3">
        {title}
      </p>
      <ul className="space-y-1.5 text-sm text-sega-white/80 leading-snug font-reading">
        {bullets.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-sega-cyan shrink-0">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
