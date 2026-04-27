"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Sidebar, { type SectionId } from "./Sidebar";
import Hero from "./Hero";
import ResumeSection from "./ResumeSection";
import CollapsibleSection from "./CollapsibleSection";
import CaseStudiesPanel from "./CaseStudiesPanel";
import ProblemsSolvedSection from "./ProblemsSolvedSection";
import StackTags from "./StackTags";
import ContactForm from "./ContactForm";
import HomeCarousel from "./HomeCarousel";
import { ADMIN_LOGIN_URL } from "@/lib/api";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";
import type { CaseStudyForCarousel } from "@/lib/caseStudyApi";

const SECTION_IDS: SectionId[] = ["home", "projects", "problems", "stack", "contact"];

const PROJECT_SLUGS = ["patagonia-dreams", "municipal-identity", "payment-orchestrator"];

const DEFAULT_PROJECT = "patagonia-dreams";

const LEGACY_SECTION_MAP: Record<string, SectionId> = {
  "case-studies": "projects",
  experience: "problems",
  "how-build": "problems",
  architecture: "problems",
};

function parseSection(param: string | null): SectionId {
  if (!param) return "home";
  if (LEGACY_SECTION_MAP[param]) return LEGACY_SECTION_MAP[param];
  if (SECTION_IDS.includes(param as SectionId)) return param as SectionId;
  return "home";
}

function parseProject(param: string | null): string {
  if (param && PROJECT_SLUGS.includes(param)) return param;
  return DEFAULT_PROJECT;
}

type AppLayoutProps = {
  caseStudiesForCarousel?: CaseStudyForCarousel[];
};

export default function AppLayout({ caseStudiesForCarousel = [] }: AppLayoutProps) {
  const { content, lang } = useLanguage();
  const ui = content.ui;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  const [expandedSection, setExpandedSection] = useState<SectionId>("home");
  const [selectedCaseStudySlug, setSelectedCaseStudySlug] = useState<string>(DEFAULT_PROJECT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const section = parseSection(searchParams.get("section"));
    const project = parseProject(searchParams.get("project"));
    setExpandedSection(section);
    setSelectedCaseStudySlug(project);
  }, [hydrated, searchParams]);

  const updateUrl = useCallback(
    (section: SectionId, project: string) => {
      const params = new URLSearchParams();
      params.set("section", section);
      if (section !== "home") params.set("project", project);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSectionClick = useCallback(
    (section: SectionId) => {
      if (section === "home") {
        setExpandedSection("home");
        updateUrl("home", selectedCaseStudySlug);
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const project = section === "projects" ? selectedCaseStudySlug : DEFAULT_PROJECT;
      setExpandedSection(section);
      if (section === "projects") setSelectedCaseStudySlug(project);
      updateUrl(section, project);
      const scrollToSection = () => {
        const el = document.getElementById(section);
        if (!el) return;
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      };
      setTimeout(scrollToSection, 200);
    },
    [selectedCaseStudySlug, updateUrl]
  );

  const handleCaseStudyClick = useCallback(
    (slug: string) => {
      setSelectedCaseStudySlug(slug);
      updateUrl("projects", slug);
    },
    [updateUrl]
  );

  const sidebarLabels = {
    name: content.hero.name,
    role: content.hero.sidebarRole,
    tagline: content.ui.hero.tagline,
    home: ui.sections.home,
    productionProjects: ui.sections.productionProjects,
    problemsSolved: ui.sections.problemsSolved,
    stack: ui.sections.stack,
    contact: ui.sections.contact,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          labels={sidebarLabels}
          expandedSection={expandedSection}
          selectedCaseStudySlug={selectedCaseStudySlug}
          onSectionClick={handleSectionClick}
          onCaseStudyClick={handleCaseStudyClick}
        />
        <main ref={mainRef} className="flex-1 min-h-0 ml-[240px] flex flex-col overflow-auto relative z-0">
          <Hero onViewProjectsClick={() => handleSectionClick("projects")} />
          <HomeCarousel caseStudies={caseStudiesForCarousel} lang={lang} />
          <ResumeSection />
          <CollapsibleSection
            id="projects"
            title={ui.sections.productionProjects}
            isExpanded={expandedSection === "projects"}
            onHeaderClick={() => handleSectionClick("projects")}
          >
            <CaseStudiesPanel selectedSlug={selectedCaseStudySlug} onSelect={handleCaseStudyClick} />
          </CollapsibleSection>
          <CollapsibleSection
            id="problems"
            title={ui.sections.problemsSolved}
            isExpanded={expandedSection === "problems"}
            onHeaderClick={() => handleSectionClick("problems")}
          >
            <ProblemsSolvedSection />
          </CollapsibleSection>
          <CollapsibleSection
            id="stack"
            title={ui.sections.stack}
            isExpanded={expandedSection === "stack"}
            onHeaderClick={() => handleSectionClick("stack")}
            centered
          >
            <StackTags
              itemsPrincipal={content.stack}
              itemsComplementary={content.stackComplementary}
            />
          </CollapsibleSection>
          <CollapsibleSection
            id="contact"
            title={ui.sections.contact}
            isExpanded={expandedSection === "contact"}
            onHeaderClick={() => handleSectionClick("contact")}
          >
            <ContactForm source="home" />
          </CollapsibleSection>
        </main>
      </div>
      <footer className="border-t border-sega-cyan/50 flex flex-none font-pixel text-[10px] text-sega-muted min-h-[7.5rem]">
        <div className="w-[240px] shrink-0 flex flex-col justify-center gap-2 py-6 px-4 border-r border-sega-cyan/50">
          <p className="uppercase tracking-wide text-sega-muted leading-relaxed">
            {ui.hero.tagline}
          </p>
          <a
            href={ADMIN_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-sega-cyan/50 bg-sega-cyan/10 py-2 px-3 text-sega-muted text-center hover:bg-sega-cyan/15 hover:text-sega-cyan/90 hover:border-sega-cyan/70 transition-colors w-fit"
          >
            {ui.adminLogin}
          </a>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 px-6">
          <p className="text-sega-muted">
            {ui.footer}
            <span className="mx-1.5">·</span>
            <a
              href={ADMIN_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-sega-cyan/90 transition-colors"
            >
              {ui.adminLogin}
            </a>
          </p>
          <div className="flex items-center justify-center gap-3" aria-label="Redes sociales">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sega-muted hover:text-sega-cyan/90 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sega-muted hover:text-sega-cyan/90 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
