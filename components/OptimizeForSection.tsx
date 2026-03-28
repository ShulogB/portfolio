"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import { orderedOptimizeFor } from "@/lib/portfolioContentApi";

export default function OptimizeForSection() {
  const { lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const items = orderedOptimizeFor(portfolio).map((row) => ({
    title: lang === "es" && row.title_es ? row.title_es : row.title,
    explanation: lang === "es" && row.explanation_es ? row.explanation_es : row.explanation,
  }));

  if (items.length === 0) return null;

  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="border-l-2 border-sega-cyan pl-4 py-1">
          <p className="text-sm font-medium text-sega-cyan font-pixel text-xs">
            {item.title}
          </p>
          <p className="mt-1 text-sm text-sega-white/80 leading-relaxed font-reading">
            {item.explanation}
          </p>
        </li>
      ))}
    </ul>
  );
}
