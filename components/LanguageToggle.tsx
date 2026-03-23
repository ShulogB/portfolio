"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function langHref(lang: "en" | "es", pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", lang);
  const q = params.toString();
  const base = pathname || "/";
  return q ? `${base}?${q}` : base;
}

export default function LanguageToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang, setLang } = useLanguage();
  const hrefEn = langHref("en", pathname, searchParams);
  const hrefEs = langHref("es", pathname, searchParams);

  return (
    <div className="fixed top-4 right-6 z-[110] flex gap-2 font-pixel text-[10px] text-sega-cyan/80 pointer-events-auto select-none">
      <Link
        href={hrefEn}
        onClick={() => setLang("en")}
        className={`cursor-pointer px-1 py-0.5 rounded ${lang === "en" ? "text-sega-yellow" : "hover:text-sega-cyan"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </Link>
      <span aria-hidden className="text-sega-cyan/50">|</span>
      <Link
        href={hrefEs}
        onClick={() => setLang("es")}
        className={`cursor-pointer px-1 py-0.5 rounded ${lang === "es" ? "text-sega-yellow" : "hover:text-sega-cyan"}`}
        aria-pressed={lang === "es"}
      >
        ES
      </Link>
    </div>
  );
}
