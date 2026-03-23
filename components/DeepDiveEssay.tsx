"use client";

import { useState } from "react";

export default function DeepDiveEssay({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="border-2 border-sega-cyan/50 bg-sega-bg-dark/80 overflow-hidden hover:border-sega-cyan/80 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-sega-cyan/5 transition-colors duration-200"
        aria-expanded={open}
      >
        <h3 className="font-pixel text-xs text-sega-cyan">
          {title}
        </h3>
        <svg
          className={`shrink-0 text-sega-cyan transition-transform duration-200 w-4 h-4 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t-2 border-sega-cyan/50 px-6 py-5 text-sm text-sega-white/80 leading-relaxed space-y-4 font-reading">
          {children}
        </div>
      )}
    </article>
  );
}
