"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ─── word pool ────────────────────────────────────────────────────────────────
const WORDS = [
  "react","nextjs","django","python","typescript","postgresql",
  "docker","redis","nginx","celery","tailwind","vercel","railway",
  "restapi","jwt","git","webpack","prisma","graphql","fastapi",
  "kubernetes","terraform","github","vite","eslint","jest",
  "supabase","sqlite","mongodb","express","node","hooks",
];

const TIME_PER_WORD = 4000; // ms base
const LIVES_MAX = 3;

type Phase = "idle" | "playing" | "paused" | "over";

// ─── component ───────────────────────────────────────────────────────────────
export default function TypingGame() {
  const { lang } = useLanguage();
  const es = lang === "es";

  const [phase,    setPhase]    = useState<Phase>("idle");
  const [word,     setWord]     = useState("");
  const [typed,    setTyped]    = useState("");
  const [score,    setScore]    = useState(0);
  const [hiScore,  setHiScore]  = useState(0);
  const [lives,    setLives]    = useState(LIVES_MAX);
  const [progress, setProgress] = useState(1); // 1→0
  const [shake,    setShake]    = useState(false);
  const [flash,    setFlash]    = useState<"correct" | "wrong" | null>(null);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef  = useRef(1);
  const livesRef     = useRef(LIVES_MAX);
  const scoreRef     = useRef(0);
  const usedRef      = useRef<Set<string>>(new Set());
  const inputRef     = useRef<HTMLInputElement>(null);
  const timeoutRef   = useRef<number>(TIME_PER_WORD);

  const pickWord = useCallback(() => {
    const available = WORDS.filter((w) => !usedRef.current.has(w));
    if (available.length === 0) usedRef.current.clear();
    const pool = available.length > 0 ? available : WORDS;
    const next = pool[Math.floor(Math.random() * pool.length)];
    usedRef.current.add(next);
    return next;
  }, []);

  const startTimer = useCallback((wordLen: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    // longer words get more time
    timeoutRef.current = Math.max(2500, TIME_PER_WORD + wordLen * 150);
    const start = Date.now();
    progressRef.current = 1;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.max(0, 1 - elapsed / timeoutRef.current);
      progressRef.current = p;
      setProgress(p);
      if (p <= 0) {
        clearInterval(timerRef.current!);
        // Time's up — lose a life
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);
        setShake(true);
        setFlash("wrong");
        setTimeout(() => { setShake(false); setFlash(null); }, 400);
        if (newLives <= 0) {
          setPhase("over");
          setHiScore((h) => Math.max(h, scoreRef.current));
        } else {
          const next = pickWord();
          setWord(next);
          setTyped("");
          startTimer(next.length);
        }
      }
    }, 30);
  }, [pickWord]);

  const startGame = useCallback(() => {
    usedRef.current.clear();
    livesRef.current = LIVES_MAX;
    scoreRef.current = 0;
    setLives(LIVES_MAX);
    setScore(0);
    setTyped("");
    setFlash(null);
    setShake(false);
    const first = pickWord();
    setWord(first);
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
    startTimer(first.length);
  }, [pickWord, startTimer]);

  const pauseGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("paused");
  }, []);

  const resumeGame = useCallback(() => {
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
    // Restart timer from current progress
    const remaining = progressRef.current * timeoutRef.current;
    const start = Date.now() - (timeoutRef.current - remaining);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.max(0, 1 - elapsed / timeoutRef.current);
      progressRef.current = p;
      setProgress(p);
      if (p <= 0) {
        clearInterval(timerRef.current!);
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);
        setShake(true);
        setFlash("wrong");
        setTimeout(() => { setShake(false); setFlash(null); }, 400);
        if (newLives <= 0) {
          setPhase("over");
          setHiScore((h) => Math.max(h, scoreRef.current));
        } else {
          const next = pickWord();
          setWord(next);
          setTyped("");
          startTimer(next.length);
        }
      }
    }, 30);
  }, [pickWord, startTimer]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── input handling ────────────────────────────────────────────────────────
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== "playing") return;
    const val = e.target.value.toLowerCase().trim();
    setTyped(val);

    if (val === word) {
      // Correct!
      if (timerRef.current) clearInterval(timerRef.current);
      scoreRef.current++;
      setScore(scoreRef.current);
      setFlash("correct");
      setTimeout(() => {
        setFlash(null);
        const next = pickWord();
        setWord(next);
        setTyped("");
        startTimer(next.length);
        setTimeout(() => inputRef.current?.focus(), 10);
      }, 250);
    }
  }, [phase, word, pickWord, startTimer]);

  // ── keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (phase === "playing") { pauseGame(); return; }
        if (phase === "paused")  { resumeGame(); return; }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, pauseGame, resumeGame]);

  // Progress bar color
  const barColor = progress > 0.5 ? "#00dcff" : progress > 0.25 ? "#ffe066" : "#ff6b7a";

  // Character-by-character coloring
  const renderWord = () =>
    word.split("").map((ch, i) => {
      let color = "rgba(0,220,255,0.25)";
      if (i < typed.length) color = typed[i] === ch ? "#00dcff" : "#ff6b7a";
      return <span key={i} style={{ color }}>{ch}</span>;
    });

  const isPaused  = phase === "paused";
  const isPlaying = phase === "playing";

  return (
    <div
      className="inline-flex flex-col border border-sega-cyan/30 bg-sega-bg-dark select-none hover:border-sega-cyan/45 transition-colors duration-200"
      style={{ fontFamily: "var(--font-pixel)", width: 300 }}
      aria-label="Typing mini-game"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sega-cyan/20">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        <span className="text-[9px] text-sega-cyan/45 ml-1 tracking-widest">type.exe</span>
        <div className="ml-auto flex items-center gap-4 text-[8px]">
          <span className="text-sega-cyan/30">
            BEST: <span className="text-sega-yellow/60">{String(hiScore).padStart(3,"0")}</span>
          </span>
          <span className="text-sega-cyan/55">
            {es ? "PUNTOS" : "SCORE"}: <span className="text-sega-cyan">{String(score).padStart(3,"0")}</span>
          </span>
        </div>
      </div>

      {/* game area */}
      <div className="flex flex-col flex-1" style={{ height: 240 }}>
        {phase === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="text-[9px] text-sega-cyan/50 text-center leading-relaxed tracking-wide">
              {es ? "escribe las palabras\nantes de que se acabe el tiempo" : "type the words\nbefore time runs out"}
            </p>
            <p className="text-[8px] text-sega-cyan/40 tracking-widest">
              {es ? "3 vidas" : "3 lives"}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="text-[8px] border border-sega-cyan/40 text-sega-cyan/70 hover:text-sega-cyan hover:border-sega-cyan/80 px-4 py-2 transition-colors mt-2"
            >
              {es ? "[ CLICK PARA JUGAR ]" : "[ CLICK TO PLAY ]"}
            </button>
          </div>
        )}

        {phase === "over" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <p className="text-[10px] text-red-400/80 tracking-widest">GAME OVER</p>
            <p className="text-[9px] text-sega-cyan/50">
              {es ? "palabras escritas:" : "words typed:"} <span className="text-sega-cyan">{score}</span>
            </p>
            <button
              type="button"
              onClick={startGame}
              className="text-[8px] border border-sega-cyan/40 text-sega-cyan/70 hover:text-sega-cyan hover:border-sega-cyan/80 px-4 py-2 transition-colors mt-2"
            >
              {es ? "↺ REINICIAR" : "↺ RESTART"}
            </button>
          </div>
        )}

        {phase === "paused" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="text-[11px] text-sega-cyan tracking-[0.3em]">{es ? "EN PAUSA" : "PAUSED"}</p>
            <div className="flex gap-3">
              <button type="button" onClick={resumeGame}
                className="text-[8px] border border-sega-cyan/40 text-sega-cyan/70 hover:text-sega-cyan hover:border-sega-cyan/80 px-3 py-1.5 transition-colors">
                {es ? "▶ CONTINUAR" : "▶ RESUME"}
              </button>
              <button type="button" onClick={startGame}
                className="text-[8px] border border-sega-cyan/20 text-sega-cyan/40 hover:text-sega-cyan/70 px-3 py-1.5 transition-colors">
                {es ? "↺ REINICIAR" : "↺ RESTART"}
              </button>
            </div>
          </div>
        )}

        {(isPlaying || flash !== null) && phase !== "paused" && (
          <div className="flex-1 flex flex-col">
            {/* lives */}
            <div className="flex items-center gap-1.5 px-4 pt-4">
              {Array.from({ length: LIVES_MAX }).map((_, i) => (
                <span key={i} className={`text-[10px] ${i < lives ? "text-red-400" : "text-sega-cyan/15"}`}>♥</span>
              ))}
            </div>

            {/* word display */}
            <div className={`flex-1 flex items-center justify-center px-6 ${shake ? "animate-bounce" : ""}`}>
              <div className={`text-center transition-colors duration-150 ${
                flash === "correct" ? "scale-110" : ""
              }`}>
                <p className="text-[20px] tracking-[0.15em] leading-none mb-2" style={{
                  filter: flash === "correct" ? "drop-shadow(0 0 8px #00dcff)" : flash === "wrong" ? "drop-shadow(0 0 8px #ff6b7a)" : "none"
                }}>
                  {renderWord()}
                </p>
                <p className="text-[9px] text-sega-cyan/25 mt-3 tracking-widest">
                  {typed}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
            </div>

            {/* progress bar */}
            <div className="px-4 pb-3">
              <div className="h-1 bg-sega-cyan/10 w-full">
                <div
                  className="h-full transition-none"
                  style={{ width: `${progress * 100}%`, backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}` }}
                />
              </div>
            </div>

            {/* input (invisible but focused) */}
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInput}
              onBlur={() => { if (phase === "playing") inputRef.current?.focus(); }}
              className="sr-only"
              aria-label="Type the word"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-sega-cyan/10">
        <span className="text-[7px] text-sega-cyan/18 tracking-wider">
          {es ? "escribe la palabra · ESC pausa" : "type the word · ESC pause"}
        </span>
        {(isPlaying || isPaused) && (
          <button type="button"
            onClick={() => isPaused ? resumeGame() : pauseGame()}
            className="text-[8px] border border-sega-cyan/25 text-sega-cyan/45 hover:text-sega-cyan/80 hover:border-sega-cyan/55 px-2 py-1 transition-colors ml-4 shrink-0">
            {isPaused ? (es ? "▶ CONTINUAR" : "▶ RESUME") : (es ? "❙❙ PAUSAR" : "❙❙ PAUSE")}
          </button>
        )}
      </div>
    </div>
  );
}
