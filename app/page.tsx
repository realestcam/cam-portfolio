"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectLabel } from "./components/ProjectLabel";
import { IdentityPlate } from "./components/IdentityPlate";
import { OpeningExperience, CenterNotification } from "./components/OpeningExperience";

type IntroPhase = "intro" | "notification" | "sync" | "normal";

// Light positions as % of the rendered room. Open /?lightDev=true to edit.
type LightKey = "window" | "lampPool" | "lampBulb";
type LightConfig = Record<LightKey, { x: number; y: number; w: number; h: number }>;
const LIGHTS: LightConfig = {
  window: { x: 41, y: 7, w: 16, h: 27 },
  lampPool: { x: 22, y: 86, w: 55, h: 42 },
  lampBulb: { x: 22, y: 82, w: 12, h: 12 },
};
const LIGHT_INFO: Record<LightKey, { label: string; description: string; color: string; centered: boolean }> = {
  window: {
    label: "Window frame",
    description: "Top-left corner + size of the window in the wall. The streetlight glow, flicker, and car headlights all stay inside this box.",
    color: "#00F5FF",
    centered: false,
  },
  lampPool: {
    label: "Lamp floor pool",
    description: "Where the warm pool of light spreads on the floor. Centered on x,y — the box is the full pool size.",
    color: "#F72585",
    centered: true,
  },
  lampBulb: {
    label: "Lamp bulb hotspot",
    description: "The bright bulb itself — small, centered on x,y. Should sit on the actual bulb in the artwork.",
    color: "#FFE34F",
    centered: true,
  },
};

function useImageBounds(
  containerRef: React.RefObject<HTMLDivElement | null>,
  naturalSize: { w: number; h: number }
) {
  const [bounds, setBounds] = useState({ ox: 0, oy: 0, rw: 0, rh: 0 });

  useEffect(() => {
    if (!naturalSize.w || !naturalSize.h) return;
    const el = containerRef.current;
    if (!el) return;

    function calc() {
      const el2 = containerRef.current;
      if (!el2) return;
      const cw = el2.clientWidth, ch = el2.clientHeight;
      const ca = cw / ch, ia = naturalSize.w / naturalSize.h;
      if (ca >= ia) {
        const rh = ch, rw = ch * ia;
        setBounds({ ox: (cw - rw) / 2, oy: 0, rw, rh });
      } else {
        const rw = cw, rh = cw / ia;
        setBounds({ ox: 0, oy: (ch - rh) / 2, rw, rh });
      }
    }

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalSize, containerRef]);

  return bounds;
}

export default function HomePage() {
  const router = useRouter();
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [lightDev, setLightDev] = useState(false);
  const [devCoords, setDevCoords] = useState<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = useState<null | { x1: number; y1: number; x2: number; y2: number }>(null);
  const [selectedLight, setSelectedLight] = useState<LightKey | null>("lampPool");
  const [lights, setLights] = useState<LightConfig>(LIGHTS);
  // Always start in "intro" — the pre-hydration script in layout.tsx adds
  // `cb-skip-intro` to <html> for repeat visitors, and CSS hides the overlay.
  // No SSR/client hydration mismatch this way.
  const [introPhase, setIntroPhase] = useState<IntroPhase>("intro");
  const [roomSrc, setRoomSrc] = useState("/Clean.webp");
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bounds = useImageBounds(containerRef, naturalSize);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDevMode(params.get("dev") === "true");
    setLightDev(params.get("lightDev") === "true");
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  function handleIntroLookAround() {
    if (typeof window !== "undefined") window.localStorage.setItem("cb_hasSeenIntro", "1");
    setIntroPhase("notification");
  }
  function handleIntroGoToWork() {
    if (typeof window !== "undefined") window.localStorage.setItem("cb_hasSeenIntro", "1");
    router.push("/work");
  }
  function handleNotificationComplete() {
    setIntroPhase("sync");
    setTimeout(() => setIntroPhase("normal"), 1600);
  }

  function handleRoomClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!devMode || !bounds.rw || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left - bounds.ox) / bounds.rw) * 100;
    const py = ((e.clientY - rect.top - bounds.oy) / bounds.rh) * 100;
    if (px >= 0 && px <= 100 && py >= 0 && py <= 100) {
      const coords = { x: +px.toFixed(2), y: +py.toFixed(2) };
      setDevCoords(coords);
      console.log(`{ x: ${coords.x}, y: ${coords.y} }`);
    }
  }

  return (
    <div style={{ background: "#0d0b08" }}>
      {introPhase === "intro" && (
        <OpeningExperience
          onLookAround={handleIntroLookAround}
          onGoToWork={handleIntroGoToWork}
        />
      )}
      {introPhase === "notification" && (
        <CenterNotification onComplete={handleNotificationComplete} />
      )}
      <IdentityPlate />
      {/* Room */}
      <div
        className="room-fixed"
        style={{ position: "fixed", inset: 0, animation: "roomTilt 30s ease-in-out infinite" }}
      >
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} onClick={handleRoomClick}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={roomSrc}
            alt="Room"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain", display: "block",
            }}
          />

          {/* Night window + interior floor-lamp light */}
          {bounds.rw > 0 && (() => {
            const winLeft = bounds.ox + (lights.window.x / 100) * bounds.rw;
            const winTop = bounds.oy + (lights.window.y / 100) * bounds.rh;
            const winW = (lights.window.w / 100) * bounds.rw;
            const winH = (lights.window.h / 100) * bounds.rh;

            const lampX = bounds.ox + (lights.lampPool.x / 100) * bounds.rw;
            const lampY = bounds.oy + (lights.lampPool.y / 100) * bounds.rh;
            const poolW = (lights.lampPool.w / 100) * bounds.rw;
            const poolH = (lights.lampPool.h / 100) * bounds.rh;

            const bulbX = bounds.ox + (lights.lampBulb.x / 100) * bounds.rw;
            const bulbY = bounds.oy + (lights.lampBulb.y / 100) * bounds.rh;
            const bulbW = (lights.lampBulb.w / 100) * bounds.rw;
            const bulbH = (lights.lampBulb.h / 100) * bounds.rh;

            return (
              <>
                {/* Outside window — night yellow streetlight base */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: winLeft, top: winTop, width: winW, height: winH,
                    pointerEvents: "none",
                    overflow: "hidden",
                    zIndex: 6,
                  }}
                >
                  {/* Faint warm streetlight glow staying behind the glass */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 70% 60%, rgba(255,200,120,0.22), rgba(255,180,90,0.08) 45%, transparent 75%)",
                    animation: "cityFlicker 7.5s ease-in-out infinite",
                  }} />

                  {/* Intermittent flicker bloom */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at 35% 40%, rgba(255,230,160,0.35), transparent 45%)",
                    mixBlendMode: "screen",
                    animation: "windowFlicker 11s steps(1, end) infinite",
                  }} />

                  {/* Car passing — bright headlight hot spot, fully bounded */}
                  <div style={{
                    position: "absolute",
                    top: "55%", height: "18%", width: "30%", left: "-30%",
                    background: "radial-gradient(ellipse at 50% 50%, rgba(255,250,220,0.95) 0%, rgba(255,235,170,0.55) 35%, transparent 70%)",
                    filter: "blur(2px)",
                    animation: "carPass 14s ease-in-out infinite",
                  }} />
                </div>

                {/* Floor lamp — warm pool on the floor */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: lampX, top: lampY,
                    width: poolW, height: poolH,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,200,130,0.32) 0%, rgba(255,180,100,0.16) 35%, rgba(255,160,80,0.06) 60%, transparent 80%)",
                    mixBlendMode: "screen",
                    filter: "blur(4px)",
                    animation: "lampBreathe 6s ease-in-out infinite",
                    zIndex: 5,
                  }}
                />

                {/* Lamp bulb — bright hot center */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: bulbX, top: bulbY,
                    width: bulbW, height: bulbH,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    background: "radial-gradient(circle, rgba(255,225,170,0.42) 0%, rgba(255,200,130,0.18) 40%, transparent 75%)",
                    mixBlendMode: "screen",
                    filter: "blur(2px)",
                    animation: "lampBreathe 6s ease-in-out infinite",
                    zIndex: 6,
                  }}
                />
              </>
            );
          })()}

          {/* Dots */}
          {bounds.rw > 0 && projects.filter(p => p.active).map((p) => {
            const left = bounds.ox + (p.hotspot.x / 100) * bounds.rw;
            const top  = bounds.oy + (p.hotspot.y / 100) * bounds.rh;
            const isHovered = hovered === p.id;
            const color = p.brandColor || (p.tier === "agency" ? "#F72585" : "#00F5FF");

            return (
              <Link
                key={p.id}
                href={`/work/${p.id}`}
                style={{
                  position: "absolute", left, top,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10, textDecoration: "none",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: 18,
                }}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Label */}
                {isHovered && !p.slideLabel && (
                  <div style={{
                    position: "absolute",
                    bottom: "calc(100% + 10px)",
                    left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", pointerEvents: "none",
                  }}>
                    <ProjectLabel project={p} size="sm" />
                  </div>
                )}

                {/* Dot — ring outline with brand-color center pin, pink halo pulse */}
                <div style={{
                  position: "relative",
                  width: isHovered ? 18 : 13,
                  height: isHovered ? 18 : 13,
                  transition: "width 0.22s ease, height 0.22s ease",
                  cursor: "pointer",
                }}>
                  {/* Outer ring — carries the pulsing halo */}
                  <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    border: isHovered
                      ? `1.5px solid ${color}`
                      : "1.5px solid rgba(255,255,255,0.88)",
                    background: "transparent",
                    boxShadow: isHovered
                      ? `0 0 0 4px ${color}22, 0 0 16px ${color}55`
                      : undefined,
                    filter: "drop-shadow(0 0 2px rgba(0,0,0,0.7))",
                    transition: "border-color 0.2s ease",
                    animation: isHovered
                      ? "none"
                      : introPhase === "sync"
                      ? "dotSyncPulse 1.5s ease-out 1 forwards"
                      : `dotPulse 6s ease-in-out ${(projects.indexOf(p) / projects.length) * 6}s infinite`,
                  }} />
                  {/* Center pin */}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: isHovered ? 6 : 3.5,
                    height: isHovered ? 6 : 3.5,
                    borderRadius: "50%",
                    background: isHovered ? color : "rgba(255,255,255,0.92)",
                    filter: "drop-shadow(0 0 1px rgba(0,0,0,0.7))",
                    transition: "all 0.2s ease",
                  }} />
                </div>
              </Link>
            );
          })}

          {/* Slide labels — perspective text painted along a surface */}
          {bounds.rw > 0 && (() => {
            const p = projects.find(x => x.id === hovered);
            if (!p || !p.slideLabel) return null;
            const left = bounds.ox + (p.slideLabel.startX / 100) * bounds.rw;
            const top  = bounds.oy + (p.slideLabel.y / 100) * bounds.rh;
            const width = ((p.slideLabel.endX - p.slideLabel.startX) / 100) * bounds.rw;
            const angle = p.slideLabel.angle ?? 0;
            return (
              <div style={{
                position: "absolute",
                left, top, width,
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 15,
                transformOrigin: "left center",
                transform: `rotate(${angle}deg)`,
              }}>
                <div style={{
                  fontFamily: '"DM Mono", "Courier New", monospace',
                  fontSize: "clamp(11px, 0.95vw, 15px)",
                  fontWeight: 500,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: p.brandColor || "#1b120b",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.65)",
                  whiteSpace: "nowrap",
                  animation: "aboutReveal 0.7s ease-out forwards",
                }}>
                  {p.slideLabel.text}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Light dev tool — toggle with ?lightDev=true */}
        {lightDev && bounds.rw > 0 && (() => {
          const toPct = (clientX: number, clientY: number) => {
            const el = containerRef.current;
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const px = ((clientX - rect.left - bounds.ox) / bounds.rw) * 100;
            const py = ((clientY - rect.top - bounds.oy) / bounds.rh) * 100;
            return { x: px, y: py };
          };
          const wireframe = (key: LightKey) => {
            const cfg = lights[key];
            const info = LIGHT_INFO[key];
            const isSelected = selectedLight === key;
            const left = bounds.ox + (cfg.x / 100) * bounds.rw - (info.centered ? (cfg.w / 100) * bounds.rw / 2 : 0);
            const top = bounds.oy + (cfg.y / 100) * bounds.rh - (info.centered ? (cfg.h / 100) * bounds.rh / 2 : 0);
            const width = (cfg.w / 100) * bounds.rw;
            const height = (cfg.h / 100) * bounds.rh;
            return (
              <div key={key} style={{
                position: "absolute",
                left, top, width, height,
                border: `${isSelected ? 2.5 : 1.5}px ${isSelected ? "solid" : "dashed"} ${info.color}`,
                boxShadow: isSelected ? `0 0 0 1px rgba(0,0,0,0.5), 0 0 14px ${info.color}66` : undefined,
                pointerEvents: "none",
                zIndex: 99,
                fontFamily: '"DM Mono", monospace',
                fontSize: 10,
                color: info.color,
                textShadow: "1px 1px 0 #000",
              }}>
                {/* Center crosshair for centered lights */}
                {info.centered && (
                  <>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 12, height: 1, background: info.color,
                      transform: "translate(-50%, -50%)",
                    }} />
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 1, height: 12, background: info.color,
                      transform: "translate(-50%, -50%)",
                    }} />
                  </>
                )}
                <span style={{
                  position: "absolute", top: -16, left: 0,
                  background: "rgba(0,0,0,0.78)", padding: "2px 6px", borderRadius: 2,
                  letterSpacing: "0.08em", whiteSpace: "nowrap",
                }}>{info.label.toUpperCase()}{isSelected ? "  ◄ EDITING" : ""}</span>
              </div>
            );
          };
          return (
            <div
              style={{
                position: "absolute", inset: 0, zIndex: 98,
                cursor: selectedLight ? "crosshair" : "default",
              }}
              onMouseDown={(e) => {
                if (!selectedLight) return;
                const p = toPct(e.clientX, e.clientY);
                if (!p) return;
                setDrawing({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
              }}
              onMouseMove={(e) => {
                if (!drawing) return;
                const p = toPct(e.clientX, e.clientY);
                if (!p) return;
                setDrawing({ ...drawing, x2: p.x, y2: p.y });
              }}
              onMouseUp={() => {
                if (!drawing || !selectedLight) { setDrawing(null); return; }
                const x = Math.min(drawing.x1, drawing.x2);
                const y = Math.min(drawing.y1, drawing.y2);
                const w = Math.abs(drawing.x2 - drawing.x1);
                const h = Math.abs(drawing.y2 - drawing.y1);
                const info = LIGHT_INFO[selectedLight];
                // For centered lights, store the center as x,y
                const newCfg = info.centered
                  ? { x: +(x + w / 2).toFixed(2), y: +(y + h / 2).toFixed(2), w: +w.toFixed(2), h: +h.toFixed(2) }
                  : { x: +x.toFixed(2), y: +y.toFixed(2), w: +w.toFixed(2), h: +h.toFixed(2) };
                setLights((prev) => ({ ...prev, [selectedLight]: newCfg }));
                setDrawing(null);
              }}
            >
              {(["window", "lampPool", "lampBulb"] as LightKey[]).map(wireframe)}

              {drawing && (() => {
                const x = Math.min(drawing.x1, drawing.x2);
                const y = Math.min(drawing.y1, drawing.y2);
                const w = Math.abs(drawing.x2 - drawing.x1);
                const h = Math.abs(drawing.y2 - drawing.y1);
                return (
                  <div style={{
                    position: "absolute",
                    left: bounds.ox + (x / 100) * bounds.rw,
                    top: bounds.oy + (y / 100) * bounds.rh,
                    width: (w / 100) * bounds.rw,
                    height: (h / 100) * bounds.rh,
                    border: "2px solid #fff",
                    background: "rgba(255,255,255,0.10)",
                    pointerEvents: "none",
                  }} />
                );
              })()}
            </div>
          );
        })()}

        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
          background: "radial-gradient(ellipse 92% 92% at 50% 50%, transparent 20%, rgba(0,0,0,0.48) 100%)",
        }} />

        {/* Mobile-only hero overlay */}
        <div
          className="mobile-hero-overlay"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            padding: "0 20px 22px",
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.78))",
            pointerEvents: "none", zIndex: 8,
            textAlign: "center",
            display: "none",
          }}
        >
          <p style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 14, fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "0.01em",
            marginBottom: 4,
          }}>
            cameron bell
            <span style={{ color: "rgba(247,37,133,0.6)", margin: "0 6px", fontWeight: 300 }}>|</span>
            creative director
            <span style={{ color: "rgba(247,37,133,0.6)", margin: "0 6px", fontWeight: 300 }}>|</span>
            la
          </p>
          <p style={{
            fontFamily: '"DM Mono", monospace', fontSize: 9.5,
            color: "goldenrod", opacity: 0.75,
            letterSpacing: "0.08em",
          }}>
            shoes off but make urself comfortable.
          </p>
        </div>

        {/* Identity (moved to shared component, rendered outside this fixed room layer) */}

        {/* Dev mode */}
        {devMode && (
          <div style={{
            position: "absolute", top: 16, right: 16, zIndex: 100,
            background: "rgba(0,245,255,0.1)", border: "1px solid #00F5FF",
            borderRadius: 3, padding: "6px 12px",
            fontFamily: "monospace", fontSize: 11, color: "#00F5FF", pointerEvents: "none",
          }}>
            DEV MODE — click room to log coords
          </div>
        )}
        {lightDev && (
          <div style={{
            position: "fixed", top: 16, left: 16, zIndex: 100,
            background: "rgba(0,0,0,0.92)",
            border: "1px solid rgba(247,37,133,0.5)",
            borderRadius: 6, padding: "14px 16px",
            fontFamily: '"DM Mono", monospace', fontSize: 11,
            color: "#fff", width: 320, lineHeight: 1.55,
            pointerEvents: "auto",
            maxHeight: "92vh", overflowY: "auto",
          }}>
            <div style={{ color: "#F72585", letterSpacing: "0.14em", marginBottom: 4, fontSize: 10 }}>
              LIGHT EDITOR
            </div>
            <div style={{ opacity: 0.65, fontSize: 10, marginBottom: 14, lineHeight: 1.5 }}>
              Pick a light → drag a box on the room where it should sit. The lighting updates live.
            </div>

            {(["window", "lampPool", "lampBulb"] as LightKey[]).map((key) => {
              const info = LIGHT_INFO[key];
              const cfg = lights[key];
              const isSelected = selectedLight === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedLight(isSelected ? null : key)}
                  style={{
                    cursor: "pointer",
                    padding: "10px 12px",
                    marginBottom: 8,
                    border: `1px solid ${isSelected ? info.color : "rgba(255,255,255,0.12)"}`,
                    borderLeft: `4px solid ${info.color}`,
                    borderRadius: 3,
                    background: isSelected ? "rgba(255,255,255,0.04)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      color: info.color, letterSpacing: "0.08em",
                      textTransform: "uppercase", fontSize: 10, fontWeight: 500,
                    }}>
                      {info.label}
                    </span>
                    <span style={{
                      fontSize: 9, color: isSelected ? info.color : "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em",
                    }}>
                      {isSelected ? "EDITING" : "click to edit"}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4, lineHeight: 1.45 }}>
                    {info.description}
                  </div>
                  <div style={{
                    fontSize: 10, color: "#FFE34F", marginTop: 6,
                    fontFamily: '"DM Mono", monospace',
                  }}>
                    {info.centered ? "center" : "top-left"}: {cfg.x}, {cfg.y} &nbsp;·&nbsp; size: {cfg.w}×{cfg.h}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                const out = `const LIGHTS: LightConfig = ${JSON.stringify(lights, null, 2)};`;
                console.log(out);
                try { navigator.clipboard.writeText(out); } catch {}
              }}
              style={{
                width: "100%", marginTop: 10, padding: "8px 12px",
                background: "rgba(247,37,133,0.18)",
                border: "1px solid #F72585",
                color: "#fff", cursor: "pointer", borderRadius: 3,
                fontFamily: '"DM Mono", monospace', fontSize: 10,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}
            >
              Copy LIGHTS config
            </button>
            <button
              onClick={() => setLights(LIGHTS)}
              style={{
                width: "100%", marginTop: 6, padding: "6px 12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.55)", cursor: "pointer", borderRadius: 3,
                fontFamily: '"DM Mono", monospace', fontSize: 9,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}
            >
              Reset to saved
            </button>
          </div>
        )}
        {devMode && devCoords && (
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 100, background: "rgba(0,0,0,0.88)", border: "1px solid #F72585",
            borderRadius: 3, padding: "8px 16px",
            fontFamily: "monospace", fontSize: 13, color: "#F72585", pointerEvents: "none",
          }}>
            x: {devCoords.x} &nbsp;|&nbsp; y: {devCoords.y}
          </div>
        )}
      </div>

      {/* Mobile list */}
      <div className="mobile-list" style={{
        background: "#0d0b08",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "24px 18px 80px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <p style={{
            fontFamily: '"DM Mono", monospace', fontSize: 9,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}>
            The Work
          </p>
          <Link href="/work" style={{
            fontFamily: '"DM Mono", monospace', fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "5px 10px", borderRadius: 2,
          }}>
            Grid →
          </Link>
        </div>
        {projects.filter(p => p.active).map((p) => {
          const color = p.brandColor || (p.tier === "agency" ? "#F72585" : "#00F5FF");
          const isVideo = p.heroImage.endsWith(".mp4") || p.heroImage.endsWith(".webm");
          return (
            <Link key={p.id} href={`/work/${p.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                gap: 14,
              }}>
                {/* Thumbnail */}
                <div style={{
                  flex: "0 0 auto",
                  width: 62, height: 44,
                  borderRadius: 3, overflow: "hidden",
                  background: "#1a1612",
                  border: `1px solid ${color}30`,
                  position: "relative",
                }}>
                  {isVideo ? (
                    <video
                      src={p.heroImage}
                      muted playsInline loop autoPlay
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.heroImage}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <div style={{
                    position: "absolute", top: 4, left: 4,
                    width: 5, height: 5, borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}88`,
                  }} />
                </div>
                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ProjectLabel project={p} size="md" />
                </div>
                {/* Year */}
                <div style={{
                  fontFamily: '"DM Mono", monospace', fontSize: 10,
                  color: "#f3ead6", opacity: 0.5, letterSpacing: "0.04em",
                  textShadow: "1px 1px 0 #1b120b",
                  flex: "0 0 auto",
                }}>
                  {p.year || "→"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
