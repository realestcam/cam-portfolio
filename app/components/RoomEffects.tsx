"use client";

import { useEffect, useRef } from "react";

type Bounds = { ox: number; oy: number; rw: number; rh: number };

/**
 * Galaxy swirl — conic gradient rotating slowly. CSS only.
 * Position by % of room. `size` is % of room width.
 */
export function GalaxySwirl({
  bounds, x, y, size = 6, opacity = 0.55,
}: {
  bounds: Bounds; x: number; y: number; size?: number; opacity?: number;
}) {
  if (!bounds.rw) return null;
  const px = bounds.ox + (x / 100) * bounds.rw;
  const py = bounds.oy + (y / 100) * bounds.rh;
  const sz = (size / 100) * bounds.rw;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: px, top: py, width: sz, height: sz,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 4,
        opacity,
      }}
    >
      <div
        style={{
          width: "100%", height: "100%",
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, rgba(247,37,133,0) 0%, rgba(76,29,149,0.85) 22%, rgba(247,37,133,0.95) 48%, rgba(255,227,79,0.55) 65%, rgba(76,29,149,0.85) 85%, rgba(247,37,133,0) 100%)",
          animation: "cbGalaxySwirl 14s linear infinite",
          filter: "blur(2px)",
          mixBlendMode: "screen",
          maskImage: "radial-gradient(circle at 50% 50%, black 38%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 38%, transparent 75%)",
        }}
      />
      {/* bright core */}
      <div
        style={{
          position: "absolute", inset: "32%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,240,200,0.9) 0%, rgba(255,200,120,0.45) 50%, transparent 90%)",
          filter: "blur(3px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

/**
 * Matrix code — falling green characters in a small canvas region.
 * Low frame rate so it stays subtle and cheap. Position by % of room.
 */
export function MatrixCode({
  bounds, x, y, width = 8, height = 6, opacity = 0.55,
}: {
  bounds: Bounds; x: number; y: number; width?: number; height?: number; opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = Math.max(8, Math.floor(canvas.width / 14));
    const cols = Math.max(1, Math.floor(canvas.width / fontSize));
    const drops: number[] = new Array(cols).fill(0).map(() => Math.floor(Math.random() * (canvas.height / fontSize)));
    const chars = "01アイウエオカキクケコサシスセソタチツテト10110";

    let frame = 0;
    let raf = 0;
    let running = true;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff7a";
      ctx.font = `${fontSize}px "DM Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const yPos = drops[i] * fontSize;
        ctx.fillText(ch, i * fontSize, yPos);
        if (yPos > canvas.height && Math.random() > 0.965) drops[i] = 0;
        drops[i]++;
      }
    };

    const tick = () => {
      if (!running) return;
      frame++;
      if (frame % 5 === 0) draw(); // ~12fps
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, []);

  if (!bounds.rw) return null;
  const cssW = (width / 100) * bounds.rw;
  const cssH = (height / 100) * bounds.rh;
  const px = bounds.ox + (x / 100) * bounds.rw - cssW / 2;
  const py = bounds.oy + (y / 100) * bounds.rh - cssH / 2;
  // Render canvas at 2x for sharpness
  const canvasW = Math.max(20, Math.floor(cssW * 2));
  const canvasH = Math.max(20, Math.floor(cssH * 2));

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      aria-hidden
      style={{
        position: "absolute",
        left: px, top: py,
        width: cssW, height: cssH,
        pointerEvents: "none",
        zIndex: 4,
        opacity,
        mixBlendMode: "screen",
        filter: "blur(0.5px)",
      }}
    />
  );
}

/**
 * Peace-sign placeholder — appears over Cam's figurine on hover.
 * Will be swapped for a real PNG render of Cam doing peace + looking at camera.
 */
export function PeaceSignBurst({
  bounds, x, y, visible,
}: {
  bounds: Bounds; x: number; y: number; visible: boolean;
}) {
  if (!bounds.rw) return null;
  const px = bounds.ox + (x / 100) * bounds.rw;
  const py = bounds.oy + (y / 100) * bounds.rh;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: px, top: py,
        transform: `translate(-50%, -100%) scale(${visible ? 1 : 0.6})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: "none",
        zIndex: 12,
        fontSize: 28,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        animation: visible ? "cbPeaceBob 1.6s ease-in-out infinite" : "none",
      }}
    >
      ✌️
    </div>
  );
}
