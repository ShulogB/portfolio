export default function PrincipleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-2 border-sega-cyan/50 bg-sega-bg-dark/80 p-6 hover:border-sega-cyan hover:shadow-sega-inner transition-all">
      <h3 className="font-pixel text-xs text-sega-cyan">{title}</h3>
      <p className="mt-3 text-sm text-sega-white/80 font-reading leading-relaxed">{description}</p>
    </div>
  );
}
