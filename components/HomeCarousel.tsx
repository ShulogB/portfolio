"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CaseStudyForCarousel } from "@/lib/caseStudyApi";
import type { Lang } from "@/lib/content";

const AUTO_SCROLL_INTERVAL_MS = 4000;
const ITEM_WIDTH = 300;
const GAP = 24;
const STEP = ITEM_WIDTH + GAP;

type HomeCarouselProps = {
  caseStudies: CaseStudyForCarousel[];
  lang: Lang;
};

export default function HomeCarousel({ caseStudies, lang }: HomeCarouselProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const items = caseStudies.flatMap((cs) =>
    cs.images.map((img) => ({
      url: img.url,
      caption: img.caption,
      projectTitle: lang === "es" && cs.title_es ? cs.title_es : cs.title,
      slug: cs.slug,
    }))
  );

  const updateProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el || items.length <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    setScrollProgress(Math.min(el.scrollLeft / maxScroll, 1));
  }, [items.length]);

  const goPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el || items.length <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const next = Math.max(0, el.scrollLeft - STEP);
    el.scrollTo({ left: next, behavior: "smooth" });
  }, [items.length]);

  const goNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || items.length <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const next = el.scrollLeft + STEP;
    if (next >= maxScroll) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollTo({ left: next, behavior: "smooth" });
    }
  }, [items.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const next = el.scrollLeft + STEP;
      if (next >= maxScroll) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: next, behavior: "smooth" });
      }
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateProgress();
    const onScroll = () => updateProgress();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateProgress]);

  if (items.length === 0) return null;

  const btnClass =
    "shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-sega-cyan/80 bg-sega-bg-dark text-sega-cyan font-pixel text-xl shadow-[inset_0_0_0_1px_rgba(122,157,170,0.2)] hover:border-sega-yellow hover:bg-sega-cyan/15 hover:text-sega-yellow transition-colors";

  return (
    <section className="border-t border-sega-cyan/40 bg-sega-bg-dark/50 py-8" aria-label={lang === "es" ? "Imágenes de proyectos" : "Project images"}>
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-pixel text-[10px] text-sega-cyan/80 uppercase tracking-widest mb-4 text-center">
          {lang === "es" ? "Imágenes de proyectos" : "Project images"}
        </h2>
        <div className="flex items-center gap-2">
          {items.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className={btnClass}
              aria-label={lang === "es" ? "Anterior" : "Previous"}
            >
              ‹
            </button>
          )}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
            className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory flex gap-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
          >
            {items.map((item, i) => (
              <div
                key={`${item.slug}-${i}`}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/projects/${item.slug}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/projects/${item.slug}`)}
                className="shrink-0 w-[260px] sm:w-[300px] snap-center group cursor-pointer"
              >
                <figure className="border-4 border-sega-cyan/70 transition-all group-hover:border-sega-yellow group-hover:opacity-95">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.caption || item.projectTitle}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-sega-bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="font-pixel text-xs text-sega-yellow text-center px-3">
                        {item.projectTitle}
                      </span>
                    </div>
                  </div>
                  {item.caption ? (
                    <figcaption className="font-pixel text-[10px] text-sega-white/50 py-1.5 px-2 truncate border-t border-sega-cyan/30">
                      {item.caption}
                    </figcaption>
                ) : null}
              </figure>
              </div>
            ))}
          </div>
          {items.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className={btnClass}
              aria-label={lang === "es" ? "Siguiente" : "Next"}
            >
              ›
            </button>
          )}
        </div>
        {items.length > 1 && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <div
              className="w-full max-w-[220px] h-2.5 border-2 border-sega-cyan/70 bg-sega-bg-dark shadow-[inset_0_0_0_1px_rgba(122,157,170,0.3)] overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-sega-cyan/90 transition-all duration-300 ease-out border-r border-sega-yellow/40"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <p className="font-pixel text-[9px] text-sega-cyan/50 text-center">
              {lang === "es" ? "‹ › para cambiar · Clic para ir al proyecto" : "‹ › to change · Click to open project"}
            </p>
          </div>
        )}
        {items.length <= 1 && (
          <p className="font-pixel text-[9px] text-sega-cyan/50 text-center mt-3">
            {lang === "es" ? "Clic para ir al proyecto" : "Click to open project"}
          </p>
        )}
      </div>
    </section>
  );
}
