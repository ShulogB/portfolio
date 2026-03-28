"use client";

import { usePathname } from "next/navigation";

type SectionId =
  | "home"
  | "experience"
  | "case-studies"
  | "how-build"
  | "architecture"
  | "stack"
  | "contact";

type SidebarProps = {
  caseStudySlugs: string[];
  caseStudyLabels: Record<string, string>;
  labels: {
    name: string;
    role: string;
    tagline: string;
    home: string;
    experience: string;
    caseStudies: string;
    howBuild: string;
    architecture: string;
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
  caseStudySlugs,
  caseStudyLabels,
  labels,
  expandedSection,
  selectedCaseStudySlug,
  onSectionClick,
  onCaseStudyClick,
}: SidebarProps) {
  const isCaseStudiesExpanded = expandedSection === "case-studies";
  const projectParam = selectedCaseStudySlug || caseStudySlugs[0] || "_";

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
              section="experience"
              project={projectParam}
              isActive={expandedSection === "experience"}
              onClick={() => onSectionClick("experience")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "experience"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.experience}
            </NavLink>
          </li>
          <li>
            <NavLink
              section="case-studies"
              project={projectParam}
              isActive={expandedSection === "case-studies"}
              onClick={() => onSectionClick("case-studies")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "case-studies"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.caseStudies}
            </NavLink>
            {isCaseStudiesExpanded && caseStudySlugs.length > 0 && (
              <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-sega-cyan/50 pl-3">
                {caseStudySlugs.map((slug) => (
                  <li key={slug}>
                    <NavLink
                      section="case-studies"
                      project={slug}
                      isActive={selectedCaseStudySlug === slug}
                      onClick={() => onCaseStudyClick(slug)}
                      className={`block w-full text-left py-1.5 px-2 text-[10px] font-pixel transition-colors cursor-pointer ${
                        selectedCaseStudySlug === slug
                          ? "text-sega-yellow"
                          : "text-sega-muted hover:text-sega-cyan"
                      }`}
                    >
                      {caseStudyLabels[slug] ?? slug}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <NavLink
              section="how-build"
              project={projectParam}
              isActive={expandedSection === "how-build"}
              onClick={() => onSectionClick("how-build")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "how-build"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.howBuild}
            </NavLink>
          </li>
          <li>
            <NavLink
              section="architecture"
              project={projectParam}
              isActive={expandedSection === "architecture"}
              onClick={() => onSectionClick("architecture")}
              className={`block w-full text-left py-2.5 px-3 border-l-2 transition-colors cursor-pointer ${
                expandedSection === "architecture"
                  ? "border-sega-cyan/80 bg-sega-cyan/10 text-sega-cyan/90 sidebar-item-active"
                  : "border-transparent text-sega-muted hover:text-sega-white hover:bg-sega-cyan/5"
              }`}
            >
              {labels.architecture}
            </NavLink>
          </li>
          <li>
            <NavLink
              section="stack"
              project={projectParam}
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
              project={projectParam}
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
