"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ─── constants ───────────────────────────────────────────────────────────────
const W = 320;
const H = 240;
const PADDLE_W = 8;
const PADDLE_H = 52;
const BALL_SIZE = 7;
const PADDLE_SPEED = 4.5;
const BALL_SPEED_INIT = 3.5;
const CPU_LAG = 0.072; // 0=perfect, higher=easier to beat

const C_BG    = "#060b14";
const C_GRID  = "rgba(0,220,255,0.03)";
const C_CYAN  = "#00dcff";
const C_YELLOW = "#ffe066";
const C_MID   = "rgba(0,220,255,0.12)";

type Phase = "idle" | "playing" | "paused" | "over";

interface State {
  ball:   { x: number; y: number; vx: number; vy: number };
  player: { y: number };
  cpu:    { y: number };
  score:  { player: number; cpu: number };
}

function makeState(): State {
  const angle = (Math.random() * 0.6 - 0.3) + (Math.random() > 0.5 ? 0 : Math.PI);
  return {
    ball:   { x: W / 2, y: H / 2, vx: Math.cos(angle) * BALL_SPEED_INIT, vy: Math.sin(angle) * BALL_SPEED_INIT },
    player: { y: H / 2 - PADDLE_H / 2 },
    cpu:    { y: H / 2 - PADDLE_H / 2 },
    score:  { player: 0, cpu: 0 },
  };
}

// ─── component ───────────────────────────────────────────────────────────────
type MiniPongGameProps = { isActive?: boolean; onActivate?: () => void };

export default function MiniPongGame({ isActive = true, onActivate }: MiniPongGameProps) {
  const { lang } = useLanguage();
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<State>(makeState());
  const rafRef     = useRef<number | null>(null);
  const keysRef    = useRef<Set<string>>(new Set());
  const speedRef   = useRef(BALL_SPEED_INIT);

  const [phase,   setPhase]  = useState<Phase>("idle");
  const [scores,  setScores] = useState({ player: 0, cpu: 0 });

  const es = lang === "es";

  // ── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = C_GRID;
    for (let x = 0; x < W; x += 16)
      for (let y = 0; y < H; y += 16)
        ctx.fillRect(x, y, 1, 1);

    // Center line dashes
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = C_MID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // CPU paddle (left)
    ctx.shadowColor = C_YELLOW;
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = C_YELLOW;
    ctx.fillRect(8, s.cpu.y, PADDLE_W, PADDLE_H);

    // Player paddle (right)
    ctx.shadowColor = C_CYAN;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = C_CYAN;
    ctx.fillRect(W - 8 - PADDLE_W, s.player.y, PADDLE_W, PADDLE_H);

    // Ball
    ctx.shadowColor = C_CYAN;
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = "#ffffff";
    ctx.fillRect(s.ball.x - BALL_SIZE / 2, s.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);

    ctx.shadowBlur = 0;
  }, []);

  // ── game loop ─────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const s = stateRef.current;

    // Player movement
    if (keysRef.current.has("ArrowUp") || keysRef.current.has("w") || keysRef.current.has("W")) {
      s.player.y = Math.max(0, s.player.y - PADDLE_SPEED);
    }
    if (keysRef.current.has("ArrowDown") || keysRef.current.has("s") || keysRef.current.has("S")) {
      s.player.y = Math.min(H - PADDLE_H, s.player.y + PADDLE_SPEED);
    }

    // CPU movement (tracks ball center with lag)
    const cpuCenter = s.cpu.y + PADDLE_H / 2;
    const diff = s.ball.y - cpuCenter;
    s.cpu.y = Math.max(0, Math.min(H - PADDLE_H, s.cpu.y + diff * CPU_LAG * speedRef.current));

    // Move ball
    s.ball.x += s.ball.vx;
    s.ball.y += s.ball.vy;

    // Top / bottom bounce
    if (s.ball.y - BALL_SIZE / 2 <= 0)         { s.ball.y = BALL_SIZE / 2;     s.ball.vy = Math.abs(s.ball.vy); }
    if (s.ball.y + BALL_SIZE / 2 >= H)          { s.ball.y = H - BALL_SIZE / 2; s.ball.vy = -Math.abs(s.ball.vy); }

    // Player paddle collision (right)
    const px = W - 8 - PADDLE_W;
    if (
      s.ball.vx > 0 &&
      s.ball.x + BALL_SIZE / 2 >= px &&
      s.ball.x - BALL_SIZE / 2 <= px + PADDLE_W &&
      s.ball.y >= s.player.y &&
      s.ball.y <= s.player.y + PADDLE_H
    ) {
      s.ball.vx = -Math.abs(s.ball.vx);
      // add spin based on hit position
      const rel = (s.ball.y - (s.player.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      s.ball.vy = rel * speedRef.current * 1.1;
      speedRef.current = Math.min(speedRef.current * 1.04, 10);
      const spd = speedRef.current;
      const total = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2);
      s.ball.vx = (-spd / total) * Math.abs(s.ball.vx);
      s.ball.vy = (spd / total) * s.ball.vy;
    }

    // CPU paddle collision (left)
    if (
      s.ball.vx < 0 &&
      s.ball.x - BALL_SIZE / 2 <= 8 + PADDLE_W &&
      s.ball.x + BALL_SIZE / 2 >= 8 &&
      s.ball.y >= s.cpu.y &&
      s.ball.y <= s.cpu.y + PADDLE_H
    ) {
      s.ball.vx = Math.abs(s.ball.vx);
      const rel = (s.ball.y - (s.cpu.y + PADDLE_H / 2)) / (PADDLE_H / 2);
      s.ball.vy = rel * speedRef.current * 1.1;
      speedRef.current = Math.min(speedRef.current * 1.04, 10);
    }

    // Scoring
    if (s.ball.x < 0) {
      s.score.player++;
      setScores({ ...s.score });
      resetBall(s, 1);
    } else if (s.ball.x > W) {
      s.score.cpu++;
      setScores({ ...s.score });
      resetBall(s, -1);
    }

    // Win condition (first to 7)
    if (s.score.player >= 7 || s.score.cpu >= 7) {
      setPhase("over");
      draw();
      return;
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  function resetBall(s: State, dir: 1 | -1) {
    speedRef.current = BALL_SPEED_INIT;
    const angle = (Math.random() * 0.5 - 0.25);
    s.ball = { x: W / 2, y: H / 2, vx: dir * BALL_SPEED_INIT * Math.cos(angle), vy: BALL_SPEED_INIT * Math.sin(angle) };
  }

  // ── controls ──────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    stateRef.current = makeState();
    speedRef.current = BALL_SPEED_INIT;
    setScores({ player: 0, cpu: 0 });
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const pauseGame = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPhase("paused");
  }, []);

  const resumeGame = useCallback(() => {
    setPhase("playing");
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  // ── initial draw + cleanup ─────────────────────────────────────────────────
  useEffect(() => {
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  // ── keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","w","s","W","S"," "].includes(e.key)) e.preventDefault();
      if (e.key === " " || e.key === "Enter") {
        if (phase === "idle" || phase === "over") { startGame(); return; }
        if (phase === "playing") { pauseGame(); return; }
        if (phase === "paused")  { resumeGame(); return; }
      }
      if ((e.key === "Escape" || e.key === "p" || e.key === "P") && phase === "playing") { pauseGame(); return; }
      if ((e.key === "Escape" || e.key === "p" || e.key === "P") && phase === "paused")  { resumeGame(); return; }
    };
    const up = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [phase, isActive, startGame, pauseGame, resumeGame]);

  // Auto-pause when another game becomes active
  useEffect(() => {
    if (!isActive && phase === "playing") pauseGame();
  }, [isActive, phase, pauseGame]);

  const isPaused  = phase === "paused";
  const isPlaying = phase === "playing";

  return (
    <div
      className={`inline-block border bg-sega-bg-dark select-none transition-colors duration-200 ${isActive ? "border-sega-cyan/50" : "border-sega-cyan/20 hover:border-sega-cyan/35 cursor-pointer"}`}
      style={{ fontFamily: "var(--font-pixel)" }}
      onClick={() => { if (!isActive) onActivate?.(); }}
      aria-label="Pong mini-game"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sega-cyan/20">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        <span className="text-[9px] text-sega-cyan/45 ml-1 tracking-widest">pong.exe</span>
        <div className="ml-auto flex items-center gap-3 text-[8px]">
          <span className="text-sega-yellow/60">{String(scores.cpu).padStart(2,"0")}</span>
          <span className="text-sega-cyan/30">vs</span>
          <span className="text-sega-cyan">{String(scores.player).padStart(2,"0")}</span>
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
            if (phase === "idle" || phase === "over") startGame();
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-sega-bg/60 pointer-events-none">
            <p className="text-[8px] text-sega-cyan/40 tracking-widest">{es ? "CPU" : "CPU"}</p>
            <div className="flex items-center gap-6 text-[9px]">
              <span className="text-sega-yellow/60">{es ? "← CPU" : "← CPU"}</span>
              <span className="text-sega-cyan/40">vs</span>
              <span className="text-sega-cyan">{es ? "TÚ →" : "YOU →"}</span>
            </div>
            <p className="text-[8px] text-sega-cyan/60 tracking-widest animate-pulse mt-2">
              {es ? "[ ESPACIO / CLICK PARA JUGAR ]" : "[ SPACE / CLICK TO PLAY ]"}
            </p>
          </div>
        )}

        {/* paused overlay */}
        {phase === "paused" && isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-sega-bg/70">
            <p className="text-[11px] text-sega-cyan tracking-[0.3em]">{es ? "EN PAUSA" : "PAUSED"}</p>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={resumeGame}
                className="text-[8px] border border-sega-cyan/40 text-sega-cyan/70 hover:text-sega-cyan hover:border-sega-cyan/80 px-3 py-1.5 transition-colors">
                {es ? "▶ CONTINUAR" : "▶ RESUME"}
              </button>
              <button type="button" onClick={startGame}
                className="text-[8px] border border-sega-cyan/20 text-sega-cyan/40 hover:text-sega-cyan/70 hover:border-sega-cyan/50 px-3 py-1.5 transition-colors">
                {es ? "↺ REINICIAR" : "↺ RESTART"}
              </button>
            </div>
          </div>
        )}

        {/* game over overlay */}
        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sega-bg/70 pointer-events-none">
            <p className={`text-[11px] tracking-[0.2em] ${scores.player >= 7 ? "text-sega-cyan" : "text-red-400/80"}`}>
              {scores.player >= 7 ? (es ? "¡GANASTE!" : "YOU WIN!") : (es ? "CPU GANA" : "CPU WINS")}
            </p>
            <p className="text-[8px] text-sega-cyan/40 tracking-widest animate-pulse mt-1">
              {es ? "[ ESPACIO / CLICK ]" : "[ SPACE / CLICK ]"}
            </p>
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-sega-cyan/10">
        <span className="text-[7px] text-sega-cyan/18 tracking-wider">
          {es ? "w/s o flechas · primero en 7 gana" : "w/s or arrows · first to 7 wins"}
        </span>
        {isActive && (isPlaying || isPaused) && (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); isPaused ? resumeGame() : pauseGame(); }}
            className="text-[8px] border border-sega-cyan/25 text-sega-cyan/45 hover:text-sega-cyan/80 hover:border-sega-cyan/55 px-2 py-1 transition-colors ml-4 shrink-0">
            {isPaused ? (es ? "▶ CONTINUAR" : "▶ RESUME") : (es ? "❙❙ PAUSAR" : "❙❙ PAUSE")}
          </button>
        )}
      </div>
    </div>
  );
}
