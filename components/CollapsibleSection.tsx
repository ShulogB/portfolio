"use client";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  isExpanded: boolean;
  onHeaderClick?: () => void;
  children: React.ReactNode;
  centered?: boolean;
};

export default function CollapsibleSection({
  id,
  title,
  isExpanded,
  onHeaderClick,
  children,
  centered = false,
}: CollapsibleSectionProps) {
  const titleClass =
    "font-pixel text-sm uppercase tracking-widest text-sega-yellow mb-8 hover:text-sega-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-sega-cyan/50 rounded drop-shadow-[0_0_8px_rgba(143,154,110,0.35)] " +
    (centered ? "text-center block w-full" : "block text-left");
  const contentClass = centered ? "flex flex-col items-center" : "";

  return (
    <section id={id} className="border-b-2 border-sega-cyan/40">
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
            {onHeaderClick ? (
              <button
                type="button"
                onClick={onHeaderClick}
                className={titleClass}
                aria-expanded={isExpanded}
              >
                {title}
              </button>
            ) : (
              <h2 className={titleClass}>{title}</h2>
            )}
            <div className={contentClass}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
