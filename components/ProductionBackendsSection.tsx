"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { ProductionDecision } from "@/lib/content";

export default function ProductionBackendsSection() {
  const { content, lang } = useLanguage();
  const items = content.productionBackends as ProductionDecision[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-sega-white/65 font-reading max-w-3xl">
        {lang === "es"
          ? "Patrones y decisiones que aplico en producción, presentados de forma sanitizada (sin detalles propietarios)."
          : "Production patterns and decisions presented in sanitized form (no proprietary details)."}
      </p>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <article
            key={item.title}
            className="border-2 border-sega-cyan/45 bg-sega-bg-dark/55 p-4 space-y-3"
          >
            <h3 className="font-pixel text-xs text-sega-yellow">{item.title}</h3>
            <div className="space-y-1 text-sm font-reading text-sega-white/80">
              <p>
                <span className="text-sega-cyan/90">{lang === "es" ? "Contexto:" : "Context:"} </span>
                {item.context}
              </p>
              <p>
                <span className="text-sega-cyan/90">{lang === "es" ? "Decisión:" : "Decision:"} </span>
                {item.decision}
              </p>
              <p>
                <span className="text-sega-cyan/90">{lang === "es" ? "Tradeoff:" : "Tradeoff:"} </span>
                {item.tradeoff}
              </p>
              <p>
                <span className="text-sega-cyan/90">{lang === "es" ? "Resultado:" : "Outcome:"} </span>
                {item.outcome}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
