"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ResumeSection() {
  const { content, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const es = lang === "es";

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const btnClass =
    "inline-flex items-center justify-center px-4 py-2.5 text-xs font-pixel transition-all duration-200 border border-sega-cyan/40 text-sega-white hover:border-sega-cyan/70 hover:bg-sega-cyan/8 hover:text-sega-cyan";

  return (
    <section className="border-b-2 border-sega-cyan/40">
      <div className="max-w-4xl mx-auto px-6 py-6 flex justify-center">
        <div className="relative" ref={popupRef}>
          <button
            type="button"
            className={btnClass}
            onClick={() => setOpen((v) => !v)}
          >
            {content.ui.hero.downloadResume}
          </button>

          {open && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 border border-sega-cyan/40 bg-sega-bg-dark shadow-lg shadow-black/60 min-w-[220px]">
              {/* title bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-sega-cyan/20 bg-sega-bg-dark/80">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
                <span className="w-2 h-2 rounded-full bg-green-400/70" />
                <span className="font-pixel text-[8px] text-sega-cyan/40 ml-1 tracking-wider">
                  {es ? "seleccionar idioma" : "select language"}
                </span>
              </div>

              {/* options */}
              <div className="p-2 flex flex-col gap-1">
                <a
                  href="/Giuliano_Bentevenga_CV_ES.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 font-pixel text-[9px] text-sega-white/70 hover:text-sega-cyan hover:bg-sega-cyan/8 transition-colors"
                >
                  <span className="text-sega-cyan/50">ES</span>
                  <span>{es ? "Español" : "Spanish"}</span>
                </a>
                <a
                  href="/Giuliano_Bentevenga_CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 font-pixel text-[9px] text-sega-white/70 hover:text-sega-cyan hover:bg-sega-cyan/8 transition-colors"
                >
                  <span className="text-sega-cyan/50">EN</span>
                  <span>{es ? "Inglés" : "English"}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
