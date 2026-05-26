"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { API_ENDPOINTS } from "@/lib/api";

type Status = "idle" | "sending" | "success" | "error";

const SENDING_LINES: Record<string, string[]> = {
  en: [
    "> CONNECTING TO SERVER...",
    "> ENCRYPTING PAYLOAD...",
    "> TRANSMITTING MESSAGE...",
  ],
  es: [
    "> CONECTANDO AL SERVIDOR...",
    "> ENCRIPTANDO MENSAJE...",
    "> TRANSMITIENDO...",
  ],
};

const inputClass =
  "w-full bg-transparent border-b border-sega-cyan/35 px-0 py-2 font-reading text-sm text-sega-white placeholder-sega-muted/45 focus:border-sega-cyan focus:outline-none transition-colors duration-150";

export default function ContactForm({ source = "home" }: { source?: string }) {
  const { content, lang } = useLanguage();
  const ui = content.ui.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    if (status !== "sending") return;
    setVisibleLines([]);
    const lines = SENDING_LINES[lang] ?? SENDING_LINES.en;
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleLines((prev) => [...prev, line]), i * 550)
    );
    return () => timers.forEach(clearTimeout);
  }, [status, lang]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(API_ENDPOINTS.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || String(res.status));
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="border-2 border-sega-cyan/50 bg-sega-bg-dark max-w-md">
      {/* Terminal window header */}
      <div className="border-b border-sega-cyan/25 px-4 py-2 flex items-center gap-3 bg-sega-bg-dark/60">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-sega-red/70" />
          <div className="h-2 w-2 rounded-full bg-sega-yellow/70" />
          <div className="h-2 w-2 rounded-full bg-sega-green/70" />
        </div>
        <span className="font-pixel text-[9px] text-sega-cyan/40 ml-1">contact.sh</span>
      </div>

      {/* Success screen */}
      {status === "success" ? (
        <div className="p-6 space-y-3">
          <div className="font-pixel text-[10px] space-y-2.5 leading-relaxed">
            <p className="text-sega-green">{">> TRANSMISSION COMPLETE"}</p>
            <p className="text-sega-white/60">{ui.successMessage}</p>
            <span className="inline-block text-sega-green cursor-blink">█</span>
          </div>
          <button
            onClick={() => { setStatus("idle"); }}
            className="mt-3 font-pixel text-[10px] text-sega-cyan/50 hover:text-sega-cyan transition-colors"
          >
            {">"} {lang === "es" ? "enviar otro mensaje" : "send another message"}
          </button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="contact-name" className="mb-2 block font-pixel text-[10px] text-sega-cyan/60">
              {">_"} {ui.name}
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder={ui.name.toLowerCase() + "..."}
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-2 block font-pixel text-[10px] text-sega-cyan/60">
              {">_"} {ui.email}
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder={ui.email.toLowerCase() + "..."}
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-2 block font-pixel text-[10px] text-sega-cyan/60">
              {">_"} {ui.message}
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder={ui.message.toLowerCase() + "..."}
              disabled={status === "sending"}
            />
          </div>

          {/* Sending animation */}
          {status === "sending" && (
            <div className="font-pixel text-[10px] space-y-1.5">
              {visibleLines.map((line, i) => (
                <p key={i} className="text-sega-cyan/80">{line}</p>
              ))}
              <span className="inline-block text-sega-cyan cursor-blink">█</span>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <p className="font-pixel text-[10px] text-sega-red">
              {">> ERROR — "}{ui.errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="font-pixel text-[10px] border border-sega-cyan/50 bg-sega-cyan/10 px-5 py-2.5 text-sega-cyan hover:bg-sega-cyan/18 hover:border-sega-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {status === "sending" ? "..." : `> ${ui.send}`}
          </button>
        </form>
      )}
    </div>
  );
}
