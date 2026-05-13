"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectLabel } from "./components/ProjectLabel";
import { IdentityPlate } from "./components/IdentityPlate";
import { OpeningExperience, CenterNotification } from "./components/OpeningExperience";

type IntroPhase = "intro" | "notification" | "sync" | "normal";

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
  const [devCoords, setDevCoords] = useState<{ x: number; y: number } | null>(null);
  // Always start in "intro" — the pre-hydration script in layout.tsx adds
  // `cb-skip-intro` to <html> for repeat visitors, and CSS hides the overlay.
  // No SSR/client hydration mismatch this way.
  const [introPhase, setIntroPhase] = useState<IntroPhase>("intro");
  const [roomSrc, setRoomSrc] = useState("/Clean.webp");
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bounds = useImageBounds(containerRef, naturalSize);

  useEffect(() => {
    setDevMode(new URLSearchParams(window.location.search).get("dev") === "true");
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

          {/* Window ambient light + interior light source + car sweep */}
          {bounds.rw > 0 && (() => {
            const wx = 0.41, wy = 0.07, ww = 0.16, wh = 0.27;
            const winLeft = bounds.ox + wx * bounds.rw;
            const winTop = bounds.oy + wy * bounds.rh;
            const winW = ww * bounds.rw;
            const winH = wh * bounds.rh;
            const winCenterX = winLeft + winW / 2;
            const winCenterY = winTop + winH / 2;
            return (
              <>
                {/* Warm daylight glow over the window */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: winLeft, top: winTop, width: winW, height: winH,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse at 50% 45%, rgba(255,225,170,0.55), rgba(255,225,170,0.20) 55%, transparent 78%)",
                    animation: "cityFlicker 7.5s ease-in-out infinite",
                    zIndex: 6,
                  }}
                />

                {/* Outside-the-window car sweep — passes occasionally */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: winLeft, top: winTop, width: winW, height: winH,
                    pointerEvents: "none",
                    overflow: "hidden",
                    zIndex: 7,
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "38%", height: "22%", width: "55%", left: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,245,210,0.72) 45%, rgba(255,220,160,0.55) 55%, transparent 100%)",
                    filter: "blur(2.5px)",
                    animation: "carSweep 22s linear infinite",
                  }} />
                </div>

                {/* Window flicker pulse — subtle bright bloom inside window */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: winLeft, top: winTop, width: winW, height: winH,
                    pointerEvents: "none",
                    background: "radial-gradient(circle at 65% 35%, rgba(255,250,220,0.45), transparent 40%)",
                    mixBlendMode: "screen",
                    animation: "windowFlicker 11s steps(1, end) infinite",
                    zIndex: 7,
                  }}
                />

                {/* Interior light source — sun beam fanning from window into the room */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: winCenterX, top: winCenterY,
                    width: bounds.rw * 0.9, height: bounds.rh * 0.9,
                    transform: "translate(-12%, -20%) rotate(22deg)",
                    transformOrigin: "0% 0%",
                    pointerEvents: "none",
                    background: "linear-gradient(110deg, rgba(255,225,170,0.28) 0%, rgba(255,210,140,0.14) 22%, rgba(255,200,120,0.06) 50%, transparent 78%)",
                    filter: "blur(14px)",
                    mixBlendMode: "screen",
                    animation: "sunBeam 9s ease-in-out infinite",
                    zIndex: 6,
                  }}
                />

                {/* Soft warm wash from window direction (top-left source ambient) */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: bounds.ox, top: bounds.oy,
                    width: bounds.rw, height: bounds.rh,
                    pointerEvents: "none",
                    background: `radial-gradient(ellipse 70% 60% at ${(wx + ww * 0.5) * 100}% ${(wy + wh * 0.7) * 100}%, rgba(255,220,160,0.18), transparent 60%)`,
                    mixBlendMode: "screen",
                    zIndex: 5,
                  }}
                />

                {/* Far-corner shadow falloff to sell the directional light */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: bounds.ox, top: bounds.oy,
                    width: bounds.rw, height: bounds.rh,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse 80% 70% at 95% 95%, rgba(0,0,0,0.32), transparent 55%)",
                    mixBlendMode: "multiply",
                    zIndex: 5,
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
