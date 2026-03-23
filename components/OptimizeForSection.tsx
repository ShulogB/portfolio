"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { OptimizeForItem } from "@/lib/content";

export default function OptimizeForSection() {
  const { content } = useLanguage();
  const items = content.optimizeFor as OptimizeForItem[];

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
