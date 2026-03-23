export default function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b-2 border-sega-cyan/40">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <h2 className="font-pixel text-sm uppercase tracking-widest text-sega-yellow mb-12 drop-shadow-[0_0_8px_rgba(143,154,110,0.35)]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
