"use client";

import Button from "./Button";
import { useLanguage } from "@/context/LanguageContext";

export default function ResumeSection() {
  const { lang } = useLanguage();

  const es = lang === "es";

  return (
    <section className="border-b-2 border-sega-cyan/40">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Primary: matching the current UI language */}
          <Button
            href={es ? "/Giuliano_Bentevenga_CV_ES.pdf" : "/Giuliano_Bentevenga_CV.pdf"}
            variant="secondary"
            external
          >
            {es ? "Descargar CV (ES)" : "Download Resume (EN)"}
          </Button>

          {/* Secondary: the other language, smaller/dimmer */}
          <a
            href={es ? "/Giuliano_Bentevenga_CV.pdf" : "/Giuliano_Bentevenga_CV_ES.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="font-pixel text-[9px] text-sega-cyan/35 hover:text-sega-cyan/70 border border-sega-cyan/20 hover:border-sega-cyan/45 px-3 py-2 transition-colors"
          >
            {es ? "EN version" : "versión ES"}
          </a>
        </div>

        <p className="font-pixel text-[7px] text-sega-muted/40 tracking-wider">
          {es ? "también disponible en inglés" : "also available in spanish"}
        </p>
      </div>
    </section>
  );
}
