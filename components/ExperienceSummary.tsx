"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { ExperienceSummaryItem } from "@/lib/content";

function LabelBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-pixel text-[10px] text-sega-yellow">
        {label}
      </p>
      <p className="text-sm text-sega-white/80 leading-relaxed font-reading">
        {children}
      </p>
    </div>
  );
}

export default function ExperienceSummary() {
  const { content } = useLanguage();
  const items = content.experienceSummary as ExperienceSummaryItem[];

  return (
    <ul className="divide-y divide-sega-cyan/30">
      {items.map((item, i) => (
        <li
          key={i}
          className="py-6 first:pt-0 space-y-4 border-l-2 border-sega-cyan pl-5"
        >
          <p className="font-pixel text-sm tracking-wide text-sega-white drop-shadow-[0_0_6px_rgba(122,157,170,0.4)]">
            {item.scope}
          </p>
          <div className="space-y-4">
            <LabelBlock label="Challenge">{item.challenge}</LabelBlock>
            <LabelBlock label="Decision">{item.decision}</LabelBlock>
            <div className="space-y-1">
              <p className="font-pixel text-[10px] text-sega-yellow">
                Impact
              </p>
              <p className="text-sm leading-relaxed text-sega-white/90 bg-sega-bg-dark border-2 border-sega-cyan/50 px-3 py-2 font-reading">
                {item.impact}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
