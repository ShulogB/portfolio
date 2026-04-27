"use client";

import Image from "next/image";
import Button from "./Button";
import ArchitectureDiagram from "./ArchitectureDiagram";
import { useLanguage } from "@/context/LanguageContext";
import type { AdrLink } from "@/lib/content";

type CaseStudyCardVariant = "full" | "compact";

export default function CaseStudyCard({
  slug,
  title,
  tech,
  preview,
  image,
  diagramType,
  adrs = [],
  externalUrl,
  variant = "full",
}: {
  slug: string;
  title: string;
  tech: string;
  preview: string;
  image?: string;
  diagramType?: "payments" | "identity";
  adrs?: AdrLink[];
  externalUrl?: string;
  variant?: CaseStudyCardVariant;
}) {
  const { content } = useLanguage();
  const ui = content.ui;
  const isCompact = variant === "compact";

  return (
    <article className="border-2 border-sega-cyan/50 bg-sega-bg-dark/80 p-7 sm:p-8 flex flex-col hover:border-sega-cyan hover:shadow-sega-inner transition-all duration-200">
      {image && (
        <div className="mb-5 overflow-hidden rounded">
          <Image
            src={image}
            alt={title}
            width={640}
            height={360}
            className="sega-img w-full h-auto object-cover"
          />
        </div>
      )}
      <p className="font-pixel text-[10px] text-sega-yellow mb-3">
        {isCompact ? ui.caseStudy.productionProjectLabel : ui.caseStudy.label}
      </p>
      <h3 className="font-pixel text-sm text-sega-cyan">
        {title}
      </h3>
      <p className="mt-2.5 text-xs text-sega-white/60 mb-5">
        {tech}
      </p>
      {externalUrl && (
        <p className="mb-5 -mt-2">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[10px] text-sega-cyan/80 hover:text-sega-yellow transition-colors inline-flex items-center gap-1"
          >
            {ui.project.viewLiveSite}
            <span aria-hidden>↗</span>
          </a>
        </p>
      )}
      <p
        className={`text-sm text-sega-white/80 font-reading leading-relaxed flex-1 ${isCompact ? "" : "line-clamp-5"}`}
      >
        {preview}
      </p>
      {!isCompact && diagramType && (
        <ArchitectureDiagram type={diagramType} />
      )}
      {!isCompact && adrs.length > 0 && (
        <div className="mt-6 pt-5 border-t-2 border-sega-cyan/30">
          <p className="font-pixel text-[10px] text-sega-yellow mb-3">
            {ui.caseStudy.architectureDecisionRecords}
          </p>
          <ul className="space-y-2">
            {adrs.map((adr, i) => (
              <li key={i}>
                <a
                  href={adr.href}
                  className="group flex items-start gap-2 text-sm text-sega-white/80 hover:text-sega-cyan transition-colors font-reading"
                >
                  <span className="font-pixel text-[10px] text-sega-cyan/70 shrink-0 mt-0.5">
                    ADR-{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-snug group-hover:underline decoration-sega-cyan underline-offset-2">
                    {adr.title}
                  </span>
                  <span className="shrink-0 text-sega-cyan/50 group-hover:text-sega-cyan transition-colors" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-8">
        <Button href={`/projects/${slug}`} variant="secondary">
          {isCompact ? ui.caseStudy.viewDetails : ui.caseStudy.architectureAndDecisions}
        </Button>
      </div>
    </article>
  );
}
