"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import contentEn from "@/lib/content-en";
import { defaultLang, type Lang } from "@/lib/content-types";

export type Content = typeof contentEn;

const STORAGE_KEY = "portfolio-lang";
const COOKIE_NAME = "portfolio-lang";

function readStoredLang(): Lang {
  if (typeof window === "undefined") return defaultLang;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl === "en" || fromUrl === "es") return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    // ignore
  }
  return defaultLang;
}

function setLangCookie(l: Lang) {
  try {
    document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore
  }
}

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  content: Content;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);
  const [contentState, setContentState] = useState<Content>(contentEn);
  const [hydrated, setHydrated] = useState(false);
  const esContentRef = useRef<Content | null>(null);

  useEffect(() => {
    const stored = readStoredLang();
    setLangState(stored);
    setLangCookie(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (lang === "es") {
      if (esContentRef.current) {
        setContentState(esContentRef.current);
      } else {
        import("@/lib/content-es").then((m) => {
          esContentRef.current = m.default;
          setContentState(m.default);
        });
      }
    } else {
      setContentState(contentEn);
    }
  }, [hydrated, lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      setLangCookie(l);
    } catch {
      // ignore
    }
  }, []);

  const value: LanguageContextValue = {
    lang: hydrated ? lang : defaultLang,
    setLang,
    content: contentState,
  };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Para uso en server components: leer idioma desde la cookie. */
export const LANG_COOKIE_NAME = "portfolio-lang";
