export default function DecisionsList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-sm text-sega-white/80 leading-relaxed border-l-2 border-sega-cyan pl-4 py-1 font-sans"
        >
          <span className="text-sega-cyan shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
