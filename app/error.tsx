"use client";

/**
 * Error boundary de la app: si algo falla en el cliente, se muestra esta vista
 * en lugar de pantalla en blanco. Estética alineada con el resto del sitio.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-sega-bg text-sega-white flex flex-col items-center justify-center px-6 font-pixel">
      <div className="max-w-md w-full border-2 border-sega-cyan/50 bg-sega-bg-dark/80 p-8 text-center">
        <p className="text-xs text-sega-yellow mb-4">
          Something went wrong
        </p>
        <p className="text-[10px] text-sega-white/70 mb-6 leading-relaxed">
          Algo salió mal. Podés intentar recargar la página.
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-xs px-4 py-2 border-2 border-sega-cyan/70 text-sega-cyan/90 hover:bg-sega-cyan/10 hover:border-sega-cyan transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
