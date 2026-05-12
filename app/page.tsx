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

          {/* Window ambient light — warm daylight pulse over the window */}
          {bounds.rw > 0 && (() => {
            const wx = 0.41, wy = 0.07, ww = 0.16, wh = 0.27;
            const winLeft = bounds.ox + wx * bounds.rw;
            const winTop = bounds.oy + wy * bounds.rh;
            const winW = ww * bounds.rw;
            const winH = wh * bounds.rh;
            return (
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

                {/* Dot — white core with pink radiating pulse */}
                <div style={{
                  width: isHovered ? 14 : 9,
                  height: isHovered ? 14 : 9,
                  borderRadius: "50%",
                  background: isHovered ? color : "rgba(255,255,255,0.95)",
                  border: isHovered
                    ? `1.5px solid ${color}`
                    : "1.5px solid rgba(255,255,255,0.95)",
                  boxShadow: isHovered
                    ? `0 0 0 4px ${color}20, 0 0 14px ${color}45`
                    : undefined,
                  filter: "drop-shadow(0 0 2px rgba(0,0,0,0.7))",
                  opacity: isHovered ? 1 : undefined,
                  transition: "width 0.22s ease, height 0.22s ease, opacity 0.18s ease",
                  cursor: "pointer",
                  animation: isHovered
                    ? "none"
                    : introPhase === "sync"
                    ? "dotSyncPulse 1.5s ease-out 1 forwards"
                    : `dotPulse 6s ease-in-out ${(projects.indexOf(p) / projects.length) * 6}s infinite`,
                }} />
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
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: "clamp(11px, 1vw, 16px)",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: p.brandColor || "#1b120b",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.55)",
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
        marginTop: "56.25vw", background: "#0d0b08",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "28px 20px 60px",
      }}>
        <p style={{
          fontFamily: '"DM Mono", monospace', fontSize: 9,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)", marginBottom: 24,
        }}>
          Work
        </p>
        {projects.filter(p => p.active).map((p) => (
          <Link key={p.id} href={`/work/${p.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <ProjectLabel project={p} size="md" />
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: 11,
                color: "#f3ead6", opacity: 0.55, letterSpacing: "0.04em",
                textShadow: "1px 1px 0 #1b120b",
              }}>
                {p.year || "→"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
