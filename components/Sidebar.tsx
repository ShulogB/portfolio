"use client";

import { usePathname } from "next/navigation";

const CASE_STUDY_LABELS: Record<string, string> = {
  "patagonia-dreams": "Patagonia Dreams",
  "municipal-identity": "Municipal Identity",
  "payment-orchestrator": "Payment Orchestrator",
};

const CASE_STUDY_SLUGS = ["patagonia-dreams", "municipal-identity", "payment-orchestrator"] as const;

export type SectionId = "home" | "projects" | "problems" | "stack" | "contact";

type SidebarProps = {
  labels: {
    name: string;
    role: string;
    tagline: string;
    home: string;
    productionProjects: string;
    problemsSolved: string;
    stack: string;
    contact: string;
  };
  expandedSection: SectionId;
  selectedCaseStudySlug: string;
  onSectionClick: (section: SectionId) => void;
  onCaseStudyClick: (slug: string) => void;
};

function NavLink({
  section,
  project,
  isActive,
  onClick,
  children,
  className,
}: {
  section: string;
  project: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className: string;
}) {
  const pathname = usePathname();
  const href = `${pathname || "/"}?section=${section}&project=${project}`;
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={className}
      role="button"
    >
      {children}
    </a>
  );
}

export default function Sidebar({
  labels,
  expandedSection,
  selectedCaseStudySlug,
  onSectionClick,
  onCaseStudyClick,
}: SidebarProps) {
  const isProjectsExpanded = expandedSection === "projects";

  return (
    <aside
      className="fixed left-0 top-0 z-[100] h-full w-[240px] border-r border-sega-cyan/50 bg-sega-bg-dark flex flex-col shadow-sega-glow pointer-events-auto"
      aria-label="Navigation"
    >
      <div className="shrink-0 py-6 px-4 border-b border-sega-cyan/50">
        <p className="text-xs font-pixel text-sega-cyan/90 leading-relaxed">
          {labels.name}
        </p>
        <p className="mt-1 text-[10px] font-pixel text-sega-muted">
          {labels.role}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5 text-xs font-pixel">
          <li>
            <button
              type="button"
              onClick={() => onSectionClick("home")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "home"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
              aria-label={labels.home}
              aria-current={expandedSection === "home" ? "page" : undefined}
            >
              {labels.home}
            </button>
          </li>
          <li>
            <NavLink
              section="projects"
              project={selectedCaseStudySlug}
              isActive={expandedSection === "projects"}
              onClick={() => onSectionClick("projects")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "projects"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.productionProjects}
            </NavLink>
            {isProjectsExpanded && (
              <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-sega-cyan/50 pl-3">
                {CASE_STUDY_SLUGS.map((slug) => (
                  <li key={slug}>
                    <NavLink
                      section="projects"
                      project={slug}
                      isActive={selectedCaseStudySlug === slug}
                      onClick={() => onCaseStudyClick(slug)}
                      className={`block w-full text-left py-1.5 px-2 text-[10px] font-pixel transition-colors cursor-pointer ${
                        selectedCaseStudySlug === slug
                          ? "text-sega-yellow"
                          : "text-sega-muted hover:text-sega-cyan"
                      }`}
                    >
                      {CASE_STUDY_LABELS[slug]}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <NavLink
              section="problems"
              project={selectedCaseStudySlug}
              isActive={expandedSection === "problems"}
              onClick={() => onSectionClick("problems")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "problems"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.problemsSolved}
            </NavLink>
          </li>
          <li>
            <NavLink
              section="stack"
              project={selectedCaseStudySlug}
              isActive={expandedSection === "stack"}
              onClick={() => onSectionClick("stack")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "stack"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.stack}
            </NavLink>
          </li>
          <li>
            <NavLink
              section="contact"
              project={selectedCaseStudySlug}
              isActive={expandedSection === "contact"}
              onClick={() => onSectionClick("contact")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "contact"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.contact}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
