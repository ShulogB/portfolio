"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ExecutiveSnapshot() {
  const { content } = useLanguage();
  const bullets = content.executiveSnapshot as string[];
  const title = content.ui.sections.executiveSnapshot;

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
