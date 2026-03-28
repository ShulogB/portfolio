"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import { orderedPrinciples } from "@/lib/portfolioContentApi";

export default function PrinciplesFromPortfolio() {
  const { content, lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const title = content.ui.sections.principles;
  const rows = orderedPrinciples(portfolio).map((row) => ({
    title: lang === "es" && row.title_es ? row.title_es : row.title,
    description: lang === "es" && row.description_es ? row.description_es : row.description,
  }));

  if (rows.length === 0) return null;

  return (
    <div className="pb-6 mb-6 border-b-2 border-sega-cyan/30">
      <p className="font-pixel text-[10px] text-sega-yellow mb-4">{title}</p>
      <ul className="space-y-5">
        {rows.map((row, i) => (
          <li key={i} className="border-l-2 border-sega-cyan/50 pl-4">
            <h3 className="font-pixel text-xs text-sega-cyan mb-2">{row.title}</h3>
            <p className="text-sm text-sega-white/80 leading-relaxed font-reading">{row.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
