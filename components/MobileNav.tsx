"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import type { SectionId } from "./Sidebar";

type MobileNavProps = {
  expandedSection: SectionId;
  selectedCaseStudySlug: string;
  onSectionClick: (s: SectionId) => void;
};

const SECTIONS: {
  id: SectionId;
  icon: string;
  label: { en: string; es: string };
}[] = [
  { id: "home",     icon: "⌂",  label: { en: "HOME",  es: "HOME"  } },
  { id: "projects", icon: "◈",  label: { en: "PROJ",  es: "PROY"  } },
  { id: "problems", icon: "⚡", label: { en: "BUILD", es: "BUILD" } },
  { id: "stack",    icon: "◻",  label: { en: "STACK", es: "STACK" } },
  { id: "contact",  icon: "✉",  label: { en: "MSG",   es: "MSG"   } },
];

export default function MobileNav({
  expandedSection,
  selectedCaseStudySlug,
  onSectionClick,
}: MobileNavProps) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-sega-cyan/50 bg-sega-bg-dark"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-14">
        {/* Section tabs */}
        {SECTIONS.map((s) => {
          const isActive = expandedSection === s.id;
          const href = `${pathname || "/"}?section=${s.id}&project=${selectedCaseStudySlug}`;
          return (
            <a
              key={s.id}
              href={href}
              onClick={(e) => { e.preventDefault(); onSectionClick(s.id); }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors border-t-2 ${
                isActive
                  ? "border-sega-cyan text-sega-cyan bg-sega-cyan/8"
                  : "border-transparent text-sega-muted hover:text-sega-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-base leading-none">{s.icon}</span>
              <span className="font-pixel text-[7px] leading-none tracking-wide">
                {s.label[lang]}
              </span>
            </a>
          );
        })}

        {/* Language toggle */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-sega-cyan/20 gap-1">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`font-pixel text-[7px] leading-none px-1 py-0.5 transition-colors ${
              lang === "en" ? "text-sega-yellow" : "text-sega-muted hover:text-sega-cyan"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("es")}
            className={`font-pixel text-[7px] leading-none px-1 py-0.5 transition-colors ${
              lang === "es" ? "text-sega-yellow" : "text-sega-muted hover:text-sega-cyan"
            }`}
          >
            ES
          </button>
        </div>
      </div>
    </nav>
  );
}
