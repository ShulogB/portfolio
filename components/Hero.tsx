"use client";

import Button from "./Button";
import { useLanguage } from "@/context/LanguageContext";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

type HeroProps = {
  onCaseStudiesClick?: () => void;
};

export default function Hero({ onCaseStudiesClick }: HeroProps) {
  const { content } = useLanguage();
  const { hero, ui } = content;
  return (
    <header className="border-b border-sega-cyan/50 bg-sega-bg-dark/50">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
        <h1 className="font-pixel text-xl md:text-2xl text-sega-cyan/90 tracking-wide">
          {hero.name}
        </h1>
        <p className="mt-2 text-xs font-pixel text-sega-yellow">
          {hero.location}
        </p>
        <p className="mt-4 text-base md:text-lg text-sega-white font-reading leading-snug">
          {hero.subtitle}
        </p>
        <p className="mt-3 text-sm text-sega-muted font-reading">
          {hero.impactLine}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {onCaseStudiesClick ? (
            <button
              type="button"
              onClick={onCaseStudiesClick}
              className="font-pixel text-xs border border-sega-cyan/60 bg-sega-cyan/15 px-4 py-2.5 text-sega-cyan hover:bg-sega-cyan/25 hover:shadow-sega-glow transition-all"
            >
              {ui.hero.caseStudies}
            </button>
          ) : (
            <Button href="#case-studies" variant="primary">
              {ui.hero.caseStudies}
            </Button>
          )}
          <Button href={GITHUB_URL} variant="secondary" external>
            {ui.hero.github}
          </Button>
          <Button href={LINKEDIN_URL} variant="ghost" external>
            {ui.hero.linkedin}
          </Button>
        </div>
      </div>
    </header>
  );
}
