"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ─── constants ──────────────────────────────────────────────────────────────
const COLS = 22;
const ROWS = 16;
const CELL = 11; // px per cell
const TICK_MS = 125;

// Canvas dimensions
const W = COLS * CELL; // 242
const H = ROWS * CELL; // 176

// Colors (matching sega palette)
const C_BG = "#060b14";
const C_GRID = "rgba(0,220,255,0.035)";
const C_SNAKE_HEAD = "#00dcff";
const C_SNAKE_BODY = "#00b8d9";
const C_FOOD = "#ffe066";
const C_DEAD = "rgba(255,107,122,0.75)";

// ─── types ───────────────────────────────────────────────────────────────────
type Point = { x: number; y: number };
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Phase = "idle" | "playing" | "dead";

const OPPOSITES: Record<Dir, Dir> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

function makeInitialState() {
  const snake: Point[] = [
    { x: 11, y: 8 },
    { x: 10, y: 8 },
    { x: 9, y: 8 },
  ];
  return {
    snake,
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: randomFood(snake),
    score: 0,
    alive: true,
  };
}

// ─── component ───────────────────────────────────────────────────────────────
export default function MiniSnakeGame() {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(makeInitialState());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const deadFlashRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);

  // ── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback((flash = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    // Background
    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid dots
    ctx.fillStyle = C_GRID;
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.fillRect(x * CELL + CELL / 2 - 0.5, y * CELL + CELL / 2 - 0.5, 1, 1);
      }
    }

    // Food — yellow glow square
    ctx.shadowColor = C_FOOD;
    ctx.shadowBlur = 10;
    ctx.fillStyle = C_FOOD;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.shadowBlur = 0;

    // Snake segments
    const totalLen = snake.length;
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const fade = Math.max(0.35, 1 - (i / totalLen) * 0.55);

      if (flash) {
        ctx.fillStyle = `rgba(255,107,122,${fade})`;
        ctx.shadowColor = C_DEAD;
        ctx.shadowBlur = isHead ? 12 : 0;
      } else if (isHead) {
        ctx.fillStyle = C_SNAKE_HEAD;
        ctx.shadowColor = C_SNAKE_HEAD;
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = `rgba(0,184,217,${fade})`;
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);

      // Eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = C_BG;
        const { x, y } = seg;
        const dir = stateRef.current.dir;
        if (dir === "RIGHT") {
          ctx.fillRect(x * CELL + CELL - 4, y * CELL + 2, 2, 2);
          ctx.fillRect(x * CELL + CELL - 4, y * CELL + CELL - 4, 2, 2);
        } else if (dir === "LEFT") {
          ctx.fillRect(x * CELL + 2, y * CELL + 2, 2, 2);
          ctx.fillRect(x * CELL + 2, y * CELL + CELL - 4, 2, 2);
        } else if (dir === "UP") {
          ctx.fillRect(x * CELL + 2, y * CELL + 2, 2, 2);
          ctx.fillRect(x * CELL + CELL - 4, y * CELL + 2, 2, 2);
        } else {
          ctx.fillRect(x * CELL + 2, y * CELL + CELL - 4, 2, 2);
          ctx.fillRect(x * CELL + CELL - 4, y * CELL + CELL - 4, 2, 2);
        }
      }
    });

    ctx.shadowBlur = 0;
  }, []);

  // ── tick ──────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;

    s.dir = s.nextDir;
    const head = s.snake[0];
    const next: Point = {
      x: (head.x + (s.dir === "RIGHT" ? 1 : s.dir === "LEFT" ? -1 : 0) + COLS) % COLS,
      y: (head.y + (s.dir === "DOWN" ? 1 : s.dir === "UP" ? -1 : 0) + ROWS) % ROWS,
    };

    // Self-collision
    if (s.snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
      s.alive = false;
      if (timerRef.current) clearInterval(timerRef.current);

      // Flash animation on death
      let flashes = 0;
      const flashInterval = setInterval(() => {
        deadFlashRef.current = !deadFlashRef.current;
        draw(deadFlashRef.current);
        flashes++;
        if (flashes >= 6) {
          clearInterval(flashInterval);
          draw(false);
          setPhase("dead");
          setHiScore((h) => Math.max(h, s.score));
        }
      }, 120);
      return;
    }

    s.snake.unshift(next);

    // Eating
    if (next.x === s.food.x && next.y === s.food.y) {
      s.score++;
      setScore(s.score);
      s.food = randomFood(s.snake);
    } else {
      s.snake.pop();
    }

    draw();
  }, [draw]);

  // ── start ─────────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    stateRef.current = makeInitialState();
    setScore(0);
    setPhase("playing");
    draw();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, TICK_MS);
  }, [draw, tick]);

  // ── initial draw ──────────────────────────────────────────────────────────
  useEffect(() => {
    draw();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  // ── keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const DIR_MAP: Record<string, Dir> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      s: "DOWN",
      a: "LEFT",
      d: "RIGHT",
      W: "UP",
      S: "DOWN",
      A: "LEFT",
      D: "RIGHT",
    };

    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing") {
        if (
          [" ", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
           "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)
        ) {
          e.preventDefault();
          startGame();
        }
        return;
      }
      const newDir = DIR_MAP[e.key];
      if (!newDir) return;
      e.preventDefault();
      const s = stateRef.current;
      if (newDir !== OPPOSITES[s.dir]) s.nextDir = newDir;
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, startGame]);

  // ── touch ─────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;

    if (phase !== "playing") {
      startGame();
      return;
    }

    const s = stateRef.current;
    let newDir: Dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? "RIGHT" : "LEFT";
    } else {
      newDir = dy > 0 ? "DOWN" : "UP";
    }
    if (newDir !== OPPOSITES[s.dir]) s.nextDir = newDir;
  };

  // ── labels ────────────────────────────────────────────────────────────────
  const L = {
    idle:
      lang === "es"
        ? "[ ESPACIO / CLICK PARA JUGAR ]"
        : "[ SPACE / CLICK TO PLAY ]",
    dead:
      lang === "es"
        ? "GAME OVER — ESPACIO / CLICK"
        : "GAME OVER — SPACE / CLICK",
    score: lang === "es" ? "PUNTOS" : "SCORE",
    hi: "BEST",
    filename: "snake.exe",
  };

  return (
    <div
      className="inline-block border border-sega-cyan/30 bg-sega-bg-dark cursor-pointer select-none hover:border-sega-cyan/50 transition-colors duration-200"
      style={{ fontFamily: "var(--font-pixel)" }}
      onClick={() => { if (phase !== "playing") startGame(); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Snake mini-game"
    >
      {/* ── terminal title bar ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sega-cyan/20 bg-sega-bg-dark/90">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        <span className="text-[9px] text-sega-cyan/50 ml-2 tracking-widest">{L.filename}</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[8px] text-sega-cyan/35">
            {L.hi}:{" "}
            <span className="text-sega-yellow/70">{String(hiScore).padStart(3, "0")}</span>
          </span>
          <span className="text-[8px] text-sega-cyan/60">
            {L.score}:{" "}
            <span className="text-sega-cyan">{String(score).padStart(3, "0")}</span>
          </span>
        </div>
      </div>

      {/* ── canvas area ── */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Overlay when idle or dead */}
        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sega-bg-dark/65 backdrop-blur-[1px]">
            {phase === "dead" && (
              <p className="text-[10px] text-sega-red tracking-widest">
                — GAME OVER —
              </p>
            )}
            <p className="text-[8px] text-sega-cyan/80 animate-pulse tracking-wider text-center px-6">
              {phase === "dead" ? L.dead : L.idle}
            </p>
            {phase === "idle" && (
              <p className="text-[7px] text-sega-cyan/30 tracking-wider text-center px-6">
                {lang === "es"
                  ? "flechas / wasd para mover"
                  : "arrows / wasd to move"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── bottom status bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-sega-cyan/15 bg-sega-bg-dark/90">
        <span className="text-[7px] text-sega-cyan/25">
          {phase === "playing"
            ? lang === "es" ? "▶ jugando" : "▶ playing"
            : lang === "es" ? "■ en pausa" : "■ paused"}
        </span>
        <span className="text-[7px] text-sega-cyan/20">
          {COLS}×{ROWS}
        </span>
      </div>
    </div>
  );
}
