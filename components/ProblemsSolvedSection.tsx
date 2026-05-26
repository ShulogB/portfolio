"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ProblemsSolvedSection() {
  const { content } = useLanguage();
  const groups = content.problemResolutions;
  const labels = content.ui.problemsSolved;

  let counter = 0;

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <div key={g.projectTitle}>
          {/* Project group separator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-sega-cyan/20" />
            <h3 className="font-pixel text-[10px] text-sega-cyan/60 uppercase tracking-widest whitespace-nowrap">
              {g.projectTitle}
            </h3>
            <div className="h-px flex-1 bg-sega-cyan/20" />
          </div>

          <ul className="space-y-4">
            {g.items.map((item, i) => {
              counter++;
              const num = String(counter).padStart(2, "0");
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
      ))}
    </div>
  );
}
