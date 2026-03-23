"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

export type GalleryImage = { id: number; url: string; caption?: string; order: number };

export default function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const close = useCallback(() => setSelectedIndex(null), []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, close]);

  if (!images?.length) return null;

  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <figure
              key={img.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedIndex(i)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedIndex(i)}
              className="overflow-hidden rounded border-2 border-sega-cyan/40 bg-sega-bg-dark/80 cursor-pointer transition-all hover:border-sega-cyan/70 hover:border-sega-yellow/50"
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={img.url}
                  alt={img.caption || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {img.caption ? (
                <figcaption className="p-2 font-pixel text-[10px] text-sega-cyan/80 text-center">
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-sega-bg-dark/95 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border-2 border-sega-cyan/70 bg-sega-bg-dark font-pixel text-sega-cyan text-xl shadow-[inset_0_0_0_1px_rgba(122,157,170,0.2)] hover:border-sega-yellow hover:bg-sega-cyan/15 hover:text-sega-yellow transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[70vh] w-full min-w-[280px] max-w-4xl overflow-hidden border-2 border-sega-cyan/60">
              <Image
                src={selected.url}
                alt={selected.caption || ""}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 90vw, 896px"
                priority
              />
            </div>
            {selected.caption && (
              <p className="mt-2 font-pixel text-[10px] text-sega-cyan/80 text-center">
                {selected.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
