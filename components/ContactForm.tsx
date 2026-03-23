"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { API_ENDPOINTS } from "@/lib/api";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ source = "home" }: { source?: string }) {
  const { content } = useLanguage();
  const ui = content.ui.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1 block font-pixel text-[10px] text-sega-yellow">
          {ui.name}
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-sega-cyan/50 bg-sega-bg-dark px-3 py-2 font-reading text-sm text-sega-white placeholder-sega-muted/60 focus:border-sega-cyan/80 focus:outline-none"
          placeholder={ui.name}
          disabled={status === "sending"}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block font-pixel text-[10px] text-sega-yellow">
          {ui.email}
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-sega-cyan/50 bg-sega-bg-dark px-3 py-2 font-reading text-sm text-sega-white placeholder-sega-muted/60 focus:border-sega-cyan/80 focus:outline-none"
          placeholder={ui.email}
          disabled={status === "sending"}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block font-pixel text-[10px] text-sega-yellow">
          {ui.message}
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-sega-cyan/50 bg-sega-bg-dark px-3 py-2 font-reading text-sm text-sega-white placeholder-sega-muted/60 focus:border-sega-cyan/80 focus:outline-none resize-y"
          placeholder={ui.message}
          disabled={status === "sending"}
        />
      </div>
      {status === "success" && (
        <p className="font-reading text-sm text-sega-green">{ui.successMessage}</p>
      )}
      {status === "error" && (
        <p className="font-reading text-sm text-sega-red">{ui.errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="font-pixel text-xs border border-sega-cyan/60 bg-sega-cyan/15 px-4 py-2.5 text-sega-cyan hover:bg-sega-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {status === "sending" ? "…" : ui.send}
      </button>
    </form>
  );
}
