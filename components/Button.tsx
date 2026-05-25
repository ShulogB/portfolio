type Props = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
};

export default function Button({
  children,
  href,
  variant = "secondary",
  external = false,
}: Props) {
  const base =
    "inline-flex items-center justify-center px-4 py-2.5 text-xs font-pixel transition-all duration-200";
  const primary =
    "border border-sega-cyan/70 bg-sega-cyan/12 text-sega-cyan hover:bg-sega-cyan/22 hover:shadow-sega-glow hover:border-sega-cyan neon-text-sm";
  const secondary =
    "border border-sega-cyan/40 text-sega-white hover:border-sega-cyan/70 hover:bg-sega-cyan/8 hover:text-sega-cyan";
  const ghost =
    "text-sega-muted hover:text-sega-cyan hover:bg-sega-cyan/5";

  const variantClass =
    variant === "primary"
      ? primary
      : variant === "ghost"
        ? ghost
        : secondary;

  const className = `${base} ${variantClass}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
