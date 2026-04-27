"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ProblemsSolvedSection() {
  const { content } = useLanguage();
  const groups = content.problemResolutions;
  const labels = content.ui.problemsSolved;

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <div key={g.projectTitle}>
          <h3 className="font-pixel text-sm text-sega-cyan/90 mb-4 border-b border-sega-cyan/30 pb-2">
            {g.projectTitle}
          </h3>
          <ul className="space-y-6">
            {g.items.map((item, i) => (
              <li
                key={i}
                className="border-l-2 border-sega-yellow/60 pl-4 space-y-2 text-sm font-reading text-sega-white/85"
              >
                <p>
                  <span className="font-pixel text-[10px] text-sega-yellow/90 uppercase tracking-wide">
                    {labels.context}
                  </span>
                  <span className="block mt-0.5 leading-relaxed">{item.context}</span>
                </p>
                <p>
                  <span className="font-pixel text-[10px] text-sega-cyan/80 uppercase tracking-wide">
                    {labels.whatYouDid}
                  </span>
                  <span className="block mt-0.5 leading-relaxed">{item.whatYouDid}</span>
                </p>
                <p>
                  <span className="font-pixel text-[10px] text-sega-yellow/80 uppercase tracking-wide">
                    {labels.impact}
                  </span>
                  <span className="block mt-0.5 leading-relaxed">{item.impact}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
