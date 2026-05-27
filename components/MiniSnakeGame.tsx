"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ─── constants ──────────────────────────────────────────────────────────────
const COLS = 20;
const ROWS = 15;
const CELL = 16; // px per cell
const TICK_MS = 120;

const W = COLS * CELL; // 320
const H = ROWS * CELL; // 240

// Colors
const C_BG    = "#060b14";
const C_GRID  = "rgba(0,220,255,0.03)";
const C_HEAD  = "#00dcff";
const C_FOOD  = "#ffe066";
const C_DEAD  = "rgba(255,107,122,0.75)";

// ─── types ───────────────────────────────────────────────────────────────────
type Point = { x: number; y: number };
type Dir   = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Phase = "idle" | "playing" | "paused" | "dead";

const OPPOSITES: Record<Dir, Dir> = {
  UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT",
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

function makeState() {
  const snake: Point[] = [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }];
  return { snake, dir: "RIGHT" as Dir, nextDir: "RIGHT" as Dir, food: randomFood(snake), score: 0, alive: true };
}

// ─── component ───────────────────────────────────────────────────────────────
type MiniSnakeGameProps = { isActive?: boolean; onActivate?: () => void };

export default function MiniSnakeGame({ isActive = true, onActivate }: MiniSnakeGameProps) {
  const { lang } = useLanguage();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const stateRef    = useRef(makeState());
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchRef    = useRef<{ x: number; y: number } | null>(null);
  const flashRef    = useRef(false);

  const [phase,   setPhase]   = useState<Phase>("idle");
  const [score,   setScore]   = useState(0);
  const [hiScore, setHiScore] = useState(0);

  // ── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback((flash = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = C_GRID;
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * CELL + CELL / 2 - 0.5, y * CELL + CELL / 2 - 0.5, 1, 1);

    // Food
    ctx.shadowColor = C_FOOD;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = C_FOOD;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.shadowBlur  = 0;

    // Snake
    const len = snake.length;
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const fade   = Math.max(0.35, 1 - (i / len) * 0.55);

      if (flash) {
        ctx.fillStyle   = `rgba(255,107,122,${fade})`;
        ctx.shadowColor = C_DEAD;
        ctx.shadowBlur  = isHead ? 14 : 0;
      } else if (isHead) {
        ctx.fillStyle   = C_HEAD;
        ctx.shadowColor = C_HEAD;
        ctx.shadowBlur  = 14;
      } else {
        ctx.fillStyle  = `rgba(0,184,217,${fade})`;
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);

      // Eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle  = C_BG;
        const { x, y } = seg;
        const d = stateRef.current.dir;
        const E = 2;
        if      (d === "RIGHT") { ctx.fillRect(x*CELL+CELL-4, y*CELL+E,      E, E); ctx.fillRect(x*CELL+CELL-4, y*CELL+CELL-4, E, E); }
        else if (d === "LEFT")  { ctx.fillRect(x*CELL+E,      y*CELL+E,      E, E); ctx.fillRect(x*CELL+E,      y*CELL+CELL-4, E, E); }
        else if (d === "UP")    { ctx.fillRect(x*CELL+E,      y*CELL+E,      E, E); ctx.fillRect(x*CELL+CELL-4, y*CELL+E,      E, E); }
        else                    { ctx.fillRect(x*CELL+E,      y*CELL+CELL-4, E, E); ctx.fillRect(x*CELL+CELL-4, y*CELL+CELL-4, E, E); }
      }
    });
    ctx.shadowBlur = 0;
  }, []);

  // ── tick ──────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    s.dir = s.nextDir;
    const h = s.snake[0];
    const next: Point = {
      x: (h.x + (s.dir === "RIGHT" ? 1 : s.dir === "LEFT" ? -1 : 0) + COLS) % COLS,
      y: (h.y + (s.dir === "DOWN"  ? 1 : s.dir === "UP"   ? -1 : 0) + ROWS) % ROWS,
    };

    if (s.snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
      s.alive = false;
      if (timerRef.current) clearInterval(timerRef.current);
      let n = 0;
      const fi = setInterval(() => {
        flashRef.current = !flashRef.current;
        draw(flashRef.current);
        if (++n >= 6) {
          clearInterval(fi);
          draw(false);
          setPhase("dead");
          setHiScore((prev) => Math.max(prev, s.score));
        }
      }, 120);
      return;
    }

    s.snake.unshift(next);
    if (next.x === s.food.x && next.y === s.food.y) {
      s.score++;
      setScore(s.score);
      s.food = randomFood(s.snake);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw]);

  // ── controls ──────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    stateRef.current = makeState();
    setScore(0);
    setPhase("playing");
    draw();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, TICK_MS);
  }, [draw, tick]);

  const pauseGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("paused");
  }, []);

  const resumeGame = useCallback(() => {
    setPhase("playing");
    timerRef.current = setInterval(tick, TICK_MS);
  }, [tick]);

  const exitGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    stateRef.current = makeState();
    setScore(0);
    setPhase("idle");
    draw();
  }, [draw]);

  // ── initial draw + cleanup ─────────────────────────────────────────────────
  useEffect(() => {
    draw();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [draw]);

  // ── keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const DIR_MAP: Record<string, Dir> = {
      ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
      w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
    };
    const START_KEYS = [" ", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
                        "w","a","s","d","W","A","S","D"];

    const onKey = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (phase === "playing") { e.preventDefault(); pauseGame(); return; }
        if (phase === "paused")  { e.preventDefault(); resumeGame(); return; }
        return;
      }
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") { e.preventDefault(); pauseGame(); return; }
        if (phase === "paused")  { e.preventDefault(); resumeGame(); return; }
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        startGame();
        return;
      }
      if (phase === "idle" || phase === "dead") {
        if (START_KEYS.includes(e.key)) { e.preventDefault(); startGame(); }
        return;
      }
      if (phase === "playing") {
        const newDir = DIR_MAP[e.key];
        if (!newDir) return;
        e.preventDefault();
        const s = stateRef.current;
        if (newDir !== OPPOSITES[s.dir]) s.nextDir = newDir;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, isActive, startGame, pauseGame, resumeGame]);

  // Auto-pause when another game becomes active
  useEffect(() => {
    if (!isActive && phase === "playing") pauseGame();
  }, [isActive, phase, pauseGame]);

  // ── touch ─────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;

    if (phase === "idle" || phase === "dead") { startGame(); return; }
    if (phase === "paused") { resumeGame(); return; }

    const s = stateRef.current;
    const newDir: Dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "RIGHT" : "LEFT")
      : (dy > 0 ? "DOWN"  : "UP");
    if (newDir !== OPPOSITES[s.dir]) s.nextDir = newDir;
  };

  // ── labels ────────────────────────────────────────────────────────────────
  const es = lang === "es";
  const L = {
    idle:     es ? "[ ESPACIO / CLICK PARA JUGAR ]"    : "[ SPACE / CLICK TO PLAY ]",
    dead:     es ? "GAME OVER — ESPACIO PARA REINICIAR" : "GAME OVER — SPACE TO RESTART",
    paused:   es ? "EN PAUSA"                           : "PAUSED",
    resume:   es ? "CLICK PARA CONTINUAR"               : "CLICK TO RESUME",
    score:    es ? "PUNTOS" : "SCORE",
    hint:     es ? "flechas / wasd  ·  P pausar  ·  R reiniciar" : "arrows / wasd  ·  P pause  ·  R restart",
    filename: "snake.exe",
  };

  const isPaused  = phase === "paused";
  const isPlaying = phase === "playing";

  return (
    <div
      className={`inline-block border bg-sega-bg-dark select-none transition-colors duration-200 ${isActive ? "border-sega-cyan/50" : "border-sega-cyan/20 hover:border-sega-cyan/35 cursor-pointer"}`}
      style={{ fontFamily: "var(--font-pixel)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => { if (!isActive) onActivate?.(); }}
      aria-label="Snake mini-game"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sega-cyan/20">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        <span className="text-[9px] text-sega-cyan/45 ml-1 tracking-widest">{L.filename}</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[8px] text-sega-cyan/30">
            BEST: <span className="text-sega-yellow/60">{String(hiScore).padStart(3, "0")}</span>
          </span>
          <span className="text-[8px] text-sega-cyan/55">
            {L.score}: <span className="text-sega-cyan">{String(score).padStart(3, "0")}</span>
          </span>
        </div>
      </div>

      {/* canvas wrapper */}
      <div className="relative" style={{ width: W, height: H }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={() => {
            if (!isActive) return;
            if (phase === "idle" || phase === "dead") startGame();
            else if (phase === "paused") resumeGame();
          }}
          className="block cursor-pointer"
        />

        {/* inactive overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-sega-bg-dark/65 flex items-center justify-center z-20 pointer-events-none">
            <p className="text-[8px] text-sega-cyan/45 tracking-[0.25em] animate-pulse">[ CLICK ]</p>
          </div>
        )}

        {/* idle overlay */}
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sega-bg/60 pointer-events-none">
            <p className="text-[9px] text-sega-cyan/70 tracking-widest animate-pulse">{L.idle}</p>
          </div>
        )}

        {/* paused overlay */}
        {phase === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-sega-bg/70">
            <p className="text-[11px] text-sega-cyan tracking-[0.3em]">{L.paused}</p>
            <p className="text-[8px] text-sega-cyan/50 tracking-widest">{L.resume}</p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resumeGame(); }}
                className="text-[8px] border border-sega-cyan/40 text-sega-cyan/70 hover:text-sega-cyan hover:border-sega-cyan/80 px-3 py-1.5 transition-colors"
              >
                {es ? "▶ CONTINUAR" : "▶ RESUME"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="text-[8px] border border-sega-cyan/20 text-sega-cyan/40 hover:text-sega-cyan/70 hover:border-sega-cyan/50 px-3 py-1.5 transition-colors"
              >
                {es ? "↺ REINICIAR" : "↺ RESTART"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); exitGame(); }}
                className="text-[8px] border border-red-500/20 text-red-400/40 hover:text-red-400/70 hover:border-red-500/50 px-3 py-1.5 transition-colors"
              >
                {es ? "× SALIR" : "× EXIT"}
              </button>
            </div>
          </div>
        )}

        {/* dead overlay */}
        {phase === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sega-bg/60 pointer-events-none">
            <p className="text-[10px] text-red-400/80 tracking-widest">{L.dead}</p>
            <p className="text-[8px] text-sega-cyan/40 tracking-widest animate-pulse">
              {es ? "[ ESPACIO / CLICK ]" : "[ SPACE / CLICK ]"}
            </p>
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-sega-cyan/10">
        <span className="text-[7px] text-sega-cyan/18 tracking-wider">{L.hint}</span>
        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); isPaused ? resumeGame() : pauseGame(); }}
            className="text-[8px] border border-sega-cyan/25 text-sega-cyan/45 hover:text-sega-cyan/80 hover:border-sega-cyan/55 px-2 py-1 transition-colors ml-4 shrink-0"
            title={isPaused ? (es ? "Continuar" : "Resume") : (es ? "Pausar" : "Pause")}
          >
            {isPaused
              ? (es ? "▶ CONTINUAR" : "▶ RESUME")
              : (es ? "❙❙ PAUSAR" : "❙❙ PAUSE")}
          </button>
        )}
      </div>
    </div>
  );
}
