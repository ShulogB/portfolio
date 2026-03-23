import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sega-bg text-sega-white flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-sega-cyan">404</h1>
      <p className="text-sega-white/90 text-lg">This page could not be found.</p>
      <Link
        href="/"
        className="text-sega-cyan hover:text-sega-cyan-soft underline font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
