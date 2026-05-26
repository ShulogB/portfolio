"use client";

import Button from "./Button";
import { useLanguage } from "@/context/LanguageContext";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";
import MiniSnakeGame from "./MiniSnakeGame";

type HeroProps = {
  onViewProjectsClick?: () => void;
};

export default function Hero({ onViewProjectsClick }: HeroProps) {
  const { content, lang } = useLanguage();
  const { hero, ui } = content;
  return (
    <header className="border-b border-sega-cyan/30 bg-sega-bg-dark/60">
      <div className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* ── left: identity + bio + CTAs ── */}
          <div>
            <h1 className="font-pixel text-xl md:text-2xl text-sega-cyan tracking-wide neon-text">
              {hero.name}
            </h1>
            <p className="mt-2 text-xs font-pixel text-sega-yellow neon-yellow">
              {hero.location}
            </p>
            <p className="mt-1 text-[10px] font-pixel text-sega-cyan/50 tracking-widest">
              &gt; backend engineer
              <span className="cursor-blink ml-0.5">_</span>
            </p>
            <p className="mt-4 text-base md:text-lg text-sega-white font-reading leading-snug">
              {hero.subtitle}
            </p>
            <p className="mt-3 text-sm text-sega-muted font-reading">
              {hero.impactLine}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {onViewProjectsClick ? (
                <button
                  type="button"
                  onClick={onViewProjectsClick}
                  className="font-pixel text-xs border border-sega-cyan/70 bg-sega-cyan/12 px-4 py-2.5 text-sega-cyan hover:bg-sega-cyan/20 hover:shadow-sega-glow transition-all"
                >
                  {ui.hero.viewProjects}
                </button>
              ) : (
                <Button href="#projects" variant="primary">
                  {ui.hero.viewProjects}
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

          {/* ── right: snake mini-game ── */}
          <div className="flex flex-col items-center lg:items-end gap-2">
            <MiniSnakeGame />
            <p className="text-[8px] font-pixel text-sega-cyan/20 tracking-wider">
              {lang === "es"
                ? "// un break entre los proyectos"
                : "// a break between the projects"}
            </p>
          </div>

        </div>
      </div>
    </header>
  );
}
