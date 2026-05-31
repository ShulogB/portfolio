"use client";

import { useEffect, useRef } from "react";

const SERVICES = [
  {
    name: "TNT Sports",
    url: "https://angulismotv.pages.dev/transmision?c=TNT+Sports&o=0",
    emoji: "🏆",
    color: "#FF6B00",
  },
  {
    name: "ESPN Premium",
    url: "https://angulismotv.pages.dev/transmision?c=ESPN+Premium&o=0",
    emoji: "⚡",
    color: "#CC0000",
  },
  {
    name: "BVC Play",
    url: "https://bvcplay.com.ar/#/login",
    emoji: "🎭",
    color: "#1A73E8",
  },
];

export default function StreamingPage() {
  const focusedRef = useRef(0);
  const cardsRef = useRef<HTMLAnchorElement[]>([]);

  function setFocus(idx: number) {
    const cards = cardsRef.current;
    if (!cards.length) return;
    cards[focusedRef.current]?.classList.remove("focused");
    focusedRef.current = ((idx % cards.length) + cards.length) % cards.length;
    cards[focusedRef.current]?.classList.add("focused");
    cards[focusedRef.current]?.focus();
  }

  useEffect(() => {
    // Ocultar LanguageToggle del layout global en esta página
    const toggle = document.querySelector<HTMLElement>("[data-lang-toggle]");
    if (toggle) toggle.style.display = "none";

    setFocus(0);

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocus(focusedRef.current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocus(focusedRef.current - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const url = cardsRef.current[focusedRef.current]?.href;
        if (url) window.location.href = url;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (toggle) toggle.style.display = "";
    };
  }, []);

  return (
    <>
      <style>{`
        body { overflow: hidden !important; }

        .streaming-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          width: clamp(220px, 22vw, 340px);
          aspect-ratio: 3 / 4;
          background: #16161f;
          border: 2px solid #2a2a3a;
          border-radius: 20px;
          cursor: pointer;
          outline: none;
          text-decoration: none;
          color: #f0f0f5;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
          user-select: none;
        }
        .streaming-card:hover {
          transform: scale(1.04);
          border-color: #555;
        }
        .streaming-card.focused {
          border-color: #ffffff;
          background: #1e1e2e;
          transform: scale(1.08);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.6);
        }

        @media (max-width: 700px) {
          .streaming-card {
            width: min(80vw, 280px);
            aspect-ratio: 5 / 3;
            flex-direction: row;
            gap: 20px;
            padding: 0 32px;
            justify-content: flex-start;
          }
          .streaming-accent { display: none; }
          .streaming-cards { flex-direction: column !important; }
        }
      `}</style>

      {/* Cubre el layout global completamente */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "56px",
          zIndex: 9999,
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
            fontWeight: 300,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#888899",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ¿Qué vemos?
        </h1>

        <div
          className="streaming-cards"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "48px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {SERVICES.map((service, i) => (
            <a
              key={service.name}
              href={service.url}
              className="streaming-card"
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              tabIndex={0}
              onMouseEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
            >
              <span style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", lineHeight: 1 }}>
                {service.emoji}
              </span>
              <span
                style={{
                  fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {service.name}
              </span>
              <span
                className="streaming-accent"
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: service.color,
                  opacity: 0.8,
                }}
              />
            </a>
          ))}
        </div>

        <span
          style={{
            fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
            color: "#888899",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ← → para navegar · Enter para abrir
        </span>
      </div>
    </>
  );
}
