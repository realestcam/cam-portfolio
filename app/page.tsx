"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectLabel } from "./components/ProjectLabel";
import { IdentityPlate } from "./components/IdentityPlate";
import { OpeningExperience, CenterNotification } from "./components/OpeningExperience";
import { LazyVideo } from "./components/LazyVideo";

type IntroPhase = "intro" | "notification" | "sync" | "normal";

// Light shapes as polygons in % of the rendered room. Open /?lightDev=true to draw.
type LightKey = "window" | "lampPool" | "lampBulb";
type Point = { x: number; y: number };
type LightShapes = Record<LightKey, Point[][]>;

const DEFAULT_SHAPES: LightShapes = {
  window: [
    [{ x: 40.54, y: 27.4 }, { x: 40.4, y: 28.7 }, { x: 41.1, y: 29.66 }],
    [{ x: 40.99, y: 18.54 }, { x: 41.58, y: 19.27 }, { x: 41.63, y: 17.82 }],
    [{ x: 48.93, y: 17.16 }, { x: 48.44, y: 17.76 }, { x: 49.01, y: 18.39 }],
    [{ x: 41.35, y: 13.96 }, { x: 41.02, y: 13.92 }, { x: 41.21, y: 14.84 }],
    [{ x: 37.76, y: 10.61 }, { x: 38.04, y: 37.31 }, { x: 48.17, y: 29.6 }, { x: 43.14, y: 22.91 }, { x: 44.84, y: 5.94 }],
  ],
  lampPool: [
    [{ x: 26.05, y: 54.34 }, { x: 31.36, y: 71.78 }, { x: 16.13, y: 88.06 }, { x: 2.66, y: 69.93 }, { x: 14.04, y: 36.72 }],
    [{ x: 13.73, y: 59.69 }, { x: 15.47, y: 58.48 }, { x: 14.34, y: 56.09 }, { x: 13.33, y: 57.2 }],
  ],
  lampBulb: [
    [{ x: 17.55, y: 57.48 }, { x: 13.52, y: 63.13 }, { x: 13.45, y: 53.99 }],
    [{ x: 51.83, y: 43.53 }, { x: 48.79, y: 44.99 }, { x: 50.27, y: 51.63 }, { x: 52.69, y: 50.52 }],
  ],
};

type LightSettings = { feather: number; opacity: number; freq: number };
const DEFAULT_SETTINGS: Record<LightKey, LightSettings> = {
  window: { feather: 29, opacity: 5, freq: 0.4 },
  lampPool: { feather: 60, opacity: 1, freq: 1.3 },
  lampBulb: { feather: 25, opacity: 44, freq: 3 },
};

const LIGHT_INFO: Record<LightKey, { label: string; description: string; color: string }> = {
  window: {
    label: "Window frame",
    description: "Outline of the window in the wall. Streetlight glow, flicker, and car headlights all stay inside this shape.",
    color: "#00F5FF",
  },
  lampPool: {
    label: "Lamp floor pool",
    description: "Outline of the warm pool of light on the floor. Multiple shapes allowed — useful if the pool wraps around objects.",
    color: "#F72585",
  },
  lampBulb: {
    label: "Lamp bulb hotspot",
    description: "Small bright spot for the bulb itself. Draw a tight shape around the actual bulb.",
    color: "#FFE34F",
  },
};

// Polygon helpers
function polyBounds(poly: Point[]) {
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const x1 = Math.max(...xs), y1 = Math.max(...ys);
  return { x: x0, y: y0, w: Math.max(x1 - x0, 0.5), h: Math.max(y1 - y0, 0.5) };
}
function polyCentroid(poly: Point[]) {
  const bb = polyBounds(poly);
  return { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2 };
}
function polyClipPath(poly: Point[]) {
  const bb = polyBounds(poly);
  const points = poly.map(p =>
    `${(((p.x - bb.x) / bb.w) * 100).toFixed(2)}% ${(((p.y - bb.y) / bb.h) * 100).toFixed(2)}%`
  ).join(", ");
  return `polygon(${points})`;
}

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
  const [selectedLight, setSelectedLight] = useState<LightKey | null>("lampPool");
  const [shapes, setShapes] = useState<LightShapes>(DEFAULT_SHAPES);
  const [settings, setSettings] = useState<Record<LightKey, LightSettings>>(DEFAULT_SETTINGS);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  // On hard loads SSR renders "intro" and the pre-hydration script in
  // layout.tsx hides the overlay via CSS for repeat visitors. On client
  // navigations (e.g. back from /work/[id]) there's no SSR — read
  // localStorage here so returning guests skip straight to "normal".
  const [introPhase, setIntroPhase] = useState<IntroPhase>(() => {
    if (typeof window === "undefined") return "intro";
    const params = new URLSearchParams(window.location.search);
    if (params.get("intro") === "true") return "intro";
    if (params.get("skipIntro") === "true") return "normal";
    return window.localStorage.getItem("cb_hasSeenIntro") === "1" ? "normal" : "intro";
  });
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

          {/* Lights — SVG polygons with feathered Gaussian-blur edges */}
          {bounds.rw > 0 && (() => {
            const polyPoints = (poly: Point[]) =>
              poly.map(p => `${(p.x / 100) * bounds.rw},${(p.y / 100) * bounds.rh}`).join(" ");
            return (
              <svg
                aria-hidden
                style={{
                  position: "absolute",
                  left: bounds.ox, top: bounds.oy,
                  width: bounds.rw, height: bounds.rh,
                  pointerEvents: "none",
                  zIndex: 6,
                  overflow: "visible",
                }}
              >
                <defs>
                  <filter id="cb-feather-window" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={settings.window.feather} />
                  </filter>
                  <filter id="cb-feather-pool" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={settings.lampPool.feather} />
                  </filter>
                  <filter id="cb-feather-bulb" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={settings.lampBulb.feather} />
                  </filter>
                  <radialGradient id="cb-grad-window" cx="0.5" cy="0.55" r="0.7">
                    <stop offset="0%" stopColor="rgba(255,210,140,1)" />
                    <stop offset="60%" stopColor="rgba(255,190,110,0.55)" />
                    <stop offset="100%" stopColor="rgba(255,180,90,0)" />
                  </radialGradient>
                  <radialGradient id="cb-grad-pool" cx="0.5" cy="0.5" r="0.6">
                    <stop offset="0%" stopColor="rgba(255,205,135,1)" />
                    <stop offset="55%" stopColor="rgba(255,185,105,0.55)" />
                    <stop offset="100%" stopColor="rgba(255,165,80,0)" />
                  </radialGradient>
                  <radialGradient id="cb-grad-bulb" cx="0.5" cy="0.5" r="0.55">
                    <stop offset="0%" stopColor="rgba(255,240,190,1)" />
                    <stop offset="55%" stopColor="rgba(255,215,150,0.7)" />
                    <stop offset="100%" stopColor="rgba(255,200,130,0)" />
                  </radialGradient>
                </defs>

                {/* Window glow — base + flicker bloom */}
                <g opacity={settings.window.opacity / 100} style={{ mixBlendMode: "screen" }}>
                  {shapes.window.map((poly, i) => (
                    <polygon
                      key={`w-${i}`}
                      points={polyPoints(poly)}
                      fill="url(#cb-grad-window)"
                      filter="url(#cb-feather-window)"
                      style={{
                        animation: `cbCityFlicker ${(7.5 / settings.window.freq).toFixed(2)}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </g>
                <g opacity={settings.window.opacity / 100} style={{ mixBlendMode: "screen" }}>
                  {shapes.window.map((poly, i) => (
                    <polygon
                      key={`wf-${i}`}
                      points={polyPoints(poly)}
                      fill="url(#cb-grad-window)"
                      filter="url(#cb-feather-window)"
                      style={{
                        animation: `cbWindowFlicker ${(11 / settings.window.freq).toFixed(2)}s steps(1, end) infinite`,
                      }}
                    />
                  ))}
                </g>

                {/* Lamp pool */}
                <g opacity={settings.lampPool.opacity / 100} style={{ mixBlendMode: "screen" }}>
                  {shapes.lampPool.map((poly, i) => (
                    <polygon
                      key={`p-${i}`}
                      points={polyPoints(poly)}
                      fill="url(#cb-grad-pool)"
                      filter="url(#cb-feather-pool)"
                      style={{
                        animation: `cbLampBreathe ${(6 / settings.lampPool.freq).toFixed(2)}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </g>

                {/* Lamp bulb */}
                <g opacity={settings.lampBulb.opacity / 100} style={{ mixBlendMode: "screen" }}>
                  {shapes.lampBulb.map((poly, i) => (
                    <polygon
                      key={`b-${i}`}
                      points={polyPoints(poly)}
                      fill="url(#cb-grad-bulb)"
                      filter="url(#cb-feather-bulb)"
                      style={{
                        animation: `cbLampBreathe ${(6 / settings.lampBulb.freq).toFixed(2)}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </g>
              </svg>
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

        {/* Light dev pen tool — toggle with ?lightDev=true */}
        {lightDev && !previewMode && bounds.rw > 0 && (() => {
          const toPct = (clientX: number, clientY: number) => {
            const el = containerRef.current;
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const px = ((clientX - rect.left - bounds.ox) / bounds.rw) * 100;
            const py = ((clientY - rect.top - bounds.oy) / bounds.rh) * 100;
            return { x: +px.toFixed(2), y: +py.toFixed(2) };
          };
          const toSvgX = (xPct: number) => bounds.ox + (xPct / 100) * bounds.rw;
          const toSvgY = (yPct: number) => bounds.oy + (yPct / 100) * bounds.rh;
          const polyStr = (poly: Point[]) => poly.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(" ");

          const commitShape = (poly: Point[]) => {
            if (!selectedLight || poly.length < 3) return;
            setShapes((prev) => ({
              ...prev,
              [selectedLight]: [...prev[selectedLight], poly],
            }));
            setDraftPoints([]);
          };

          return (
            <svg
              width="100%" height="100%"
              style={{
                position: "absolute", inset: 0, zIndex: 98,
                cursor: selectedLight ? "crosshair" : "default",
                pointerEvents: selectedLight ? "all" : "none",
              }}
              onClick={(e) => {
                if (!selectedLight) return;
                const p = toPct(e.clientX, e.clientY);
                if (!p) return;
                // Check close condition against current draft (read, not in updater)
                if (draftPoints.length >= 3) {
                  const first = draftPoints[0];
                  const dx = p.x - first.x, dy = p.y - first.y;
                  if (dx * dx + dy * dy < 4) {
                    commitShape(draftPoints);
                    return;
                  }
                }
                setDraftPoints((prev) => [...prev, p]);
              }}
              onDoubleClick={() => commitShape(draftPoints)}
            >
              {/* Transparent click-catcher — SVG needs a painted element to fire events on empty space */}
              <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
              {/* Existing shapes for all lights — faded for non-selected */}
              {(["window", "lampPool", "lampBulb"] as LightKey[]).map((key) => {
                const info = LIGHT_INFO[key];
                const isSelected = selectedLight === key;
                return shapes[key].map((poly, i) => (
                  <polygon
                    key={`${key}-${i}`}
                    points={polyStr(poly)}
                    fill={isSelected ? `${info.color}22` : `${info.color}10`}
                    stroke={info.color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? "none" : "4 4"}
                    opacity={isSelected ? 1 : 0.5}
                  />
                ));
              })}

              {/* Light name labels at centroid */}
              {(["window", "lampPool", "lampBulb"] as LightKey[]).map((key) => {
                const info = LIGHT_INFO[key];
                return shapes[key].map((poly, i) => {
                  const c = polyCentroid(poly);
                  return (
                    <text
                      key={`label-${key}-${i}`}
                      x={toSvgX(c.x)} y={toSvgY(c.y)}
                      fontFamily='"DM Mono", monospace'
                      fontSize={10}
                      fill={info.color}
                      stroke="#000"
                      strokeWidth={3}
                      paintOrder="stroke"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", letterSpacing: "0.1em" }}
                    >
                      {info.label.toUpperCase()}{shapes[key].length > 1 ? ` ${i + 1}` : ""}
                    </text>
                  );
                });
              })}

              {/* Draft polygon in progress */}
              {selectedLight && draftPoints.length > 0 && (
                <>
                  <polyline
                    points={polyStr(draftPoints)}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  {draftPoints.map((p, i) => (
                    <circle
                      key={i}
                      cx={toSvgX(p.x)} cy={toSvgY(p.y)}
                      r={i === 0 ? 6 : 4}
                      fill={i === 0 ? "#FFE34F" : "#fff"}
                      stroke="#000"
                      strokeWidth={1}
                    />
                  ))}
                </>
              )}
            </svg>
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
            color: "#fff", width: 340, lineHeight: 1.55,
            pointerEvents: "auto",
            maxHeight: "92vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#F72585", letterSpacing: "0.14em", fontSize: 10 }}>
                LIGHT PEN
              </span>
              <button
                onClick={() => { setPreviewMode(!previewMode); setDraftPoints([]); }}
                style={{
                  background: previewMode ? "#FFE34F" : "transparent",
                  color: previewMode ? "#000" : "#FFE34F",
                  border: "1px solid #FFE34F", borderRadius: 3,
                  padding: "4px 10px", fontFamily: '"DM Mono", monospace',
                  fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {previewMode ? "◀ Edit" : "▶ Run preview"}
              </button>
            </div>
            <div style={{ opacity: 0.65, fontSize: 10, marginBottom: 12, lineHeight: 1.5 }}>
              {previewMode
                ? "Lights are rendering live. Hit Edit to keep drawing."
                : "Pick a light → click points around it on the room. Click the YELLOW start dot or double-click to close the shape. Repeat for multiple shapes."}
            </div>

            {(["window", "lampPool", "lampBulb"] as LightKey[]).map((key) => {
              const info = LIGHT_INFO[key];
              const isSelected = selectedLight === key;
              const count = shapes[key].length;
              return (
                <div
                  key={key}
                  style={{
                    padding: "10px 12px",
                    marginBottom: 8,
                    border: `1px solid ${isSelected ? info.color : "rgba(255,255,255,0.12)"}`,
                    borderLeft: `4px solid ${info.color}`,
                    borderRadius: 3,
                    background: isSelected ? "rgba(255,255,255,0.04)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    onClick={() => { setSelectedLight(isSelected ? null : key); setDraftPoints([]); }}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
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
                      {isSelected ? "DRAWING" : "click to draw"}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4, lineHeight: 1.45 }}>
                    {info.description}
                  </div>

                  {/* Sliders */}
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {([
                      { key: "feather" as const, label: "Feather", min: 0, max: 60, step: 1, unit: "" },
                      { key: "opacity" as const, label: "Opacity", min: 0, max: 100, step: 1, unit: "%" },
                      { key: "freq" as const, label: "Frequency", min: 0.2, max: 3, step: 0.1, unit: "x" },
                    ]).map(({ key: s, label, min, max, step, unit }) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9 }}>
                        <span style={{ width: 58, opacity: 0.65, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
                        <input
                          type="range"
                          min={min} max={max} step={step}
                          value={settings[key][s]}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setSettings((prev) => ({ ...prev, [key]: { ...prev[key], [s]: v } }));
                          }}
                          style={{ flex: 1, accentColor: info.color, height: 4 }}
                        />
                        <span style={{ width: 36, textAlign: "right", color: "#FFE34F", fontFamily: '"DM Mono", monospace' }}>
                          {settings[key][s]}{unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#FFE34F" }}>
                      {count} shape{count === 1 ? "" : "s"}
                    </span>
                    <div style={{ flex: 1 }} />
                    {isSelected && draftPoints.length > 0 && (
                      <button
                        onClick={() => setDraftPoints([])}
                        style={{
                          background: "transparent", border: "1px solid rgba(255,255,255,0.22)",
                          color: "#fff", padding: "3px 8px", borderRadius: 2,
                          fontFamily: '"DM Mono", monospace', fontSize: 9,
                          cursor: "pointer", letterSpacing: "0.1em",
                        }}
                      >
                        Cancel draft ({draftPoints.length})
                      </button>
                    )}
                    {count > 0 && (
                      <button
                        onClick={() => setShapes(prev => ({ ...prev, [key]: prev[key].slice(0, -1) }))}
                        style={{
                          background: "transparent", border: "1px solid rgba(255,255,255,0.22)",
                          color: "#fff", padding: "3px 8px", borderRadius: 2,
                          fontFamily: '"DM Mono", monospace', fontSize: 9,
                          cursor: "pointer", letterSpacing: "0.1em",
                        }}
                      >
                        Undo
                      </button>
                    )}
                    {count > 0 && (
                      <button
                        onClick={() => setShapes(prev => ({ ...prev, [key]: [] }))}
                        style={{
                          background: "transparent", border: "1px solid rgba(255,80,80,0.4)",
                          color: "#ff8080", padding: "3px 8px", borderRadius: 2,
                          fontFamily: '"DM Mono", monospace', fontSize: 9,
                          cursor: "pointer", letterSpacing: "0.1em",
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                const out = `const DEFAULT_SHAPES: LightShapes = ${JSON.stringify(shapes, null, 2)};\n\nconst DEFAULT_SETTINGS: Record<LightKey, LightSettings> = ${JSON.stringify(settings, null, 2)};`;
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
              Copy shapes + settings
            </button>
            <button
              onClick={() => { setShapes(DEFAULT_SHAPES); setSettings(DEFAULT_SETTINGS); setDraftPoints([]); }}
              style={{
                width: "100%", marginTop: 6, padding: "6px 12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.55)", cursor: "pointer", borderRadius: 3,
                fontFamily: '"DM Mono", monospace', fontSize: 9,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}
            >
              Reset all
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
                    <LazyVideo
                      src={p.heroImage}
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
