"use client";

import { useState } from "react";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";

const FONT = '"DM Mono", "Courier New", monospace';
const DARK = "#1b120b";
const OFF_WHITE = "#f3ead6";
const SHADOW = `1px 1px 0 ${DARK}`;
const WHITE_BOX = "rgba(255,255,255,0.5)";

const isVideoSrc = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

function ToggleLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: FONT,
        fontSize: 11,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "4px 10px",
        background: active ? WHITE_BOX : "transparent",
        color: active ? DARK : OFF_WHITE,
        textShadow: active ? "none" : SHADOW,
        fontWeight: 500,
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {label}
    </Link>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT,
        fontSize: 12,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        padding: "5px 12px",
        background: active ? WHITE_BOX : "transparent",
        color: active ? DARK : OFF_WHITE,
        textShadow: active ? "none" : SHADOW,
        border: "none",
        cursor: "pointer",
        fontWeight: 500,
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const heroIsVideo = !!project.heroImage && isVideoSrc(project.heroImage);
  const accent = project.brandColor || "#FFE34F";

  return (
    <Link
      href={`/work/${project.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        marginBottom: 56,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          marginBottom: 14,
          transition: "border-color 0.2s ease",
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
      >
        {project.heroImage && heroIsVideo && (
          <video
            src={project.heroImage}
            autoPlay muted loop playsInline preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {project.heroImage && !heroIsVideo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.heroImage}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>
      <div style={{
        fontFamily: FONT,
        lineHeight: 1.3,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: accent,
          textShadow: SHADOW,
        }}>
          {project.client || project.title}
        </div>
        {project.campaign && (
          <div style={{
            fontSize: 13,
            color: OFF_WHITE,
            textShadow: SHADOW,
            marginTop: 3,
          }}>
            {project.title}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function GridViewPage() {
  const [tab, setTab] = useState<"brand" | "freelance" | "about">("brand");

  const active = projects.filter((p) => p.active);
  const brand = active.filter((p) => p.tier === "agency" && p.id !== "noah-album-launch");
  const freelance = active.filter((p) => p.id === "noah-album-launch" || p.id === "ai-creations");
  const about = active.find((p) => p.id === "about-me");
  const showing = tab === "brand" ? brand : tab === "freelance" ? freelance : [];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b08" }}>
      {/* Locked top black bar — name on left, toggle on right (desktop only) */}
      <div className="grid-top-bar" style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#000",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <Link
          href="/"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: "clamp(11px, 1vw, 15px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            textDecoration: "none",
            lineHeight: 1,
          }}
        >
          cameron bell
          <span style={{ color: "rgba(247,37,133,0.55)", margin: "0 8px", fontWeight: 300 }}>|</span>
          creative director
          <span style={{ color: "rgba(247,37,133,0.55)", margin: "0 8px", fontWeight: 300 }}>|</span>
          los angeles
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{
            fontFamily: FONT,
            fontSize: 9,
            color: "rgba(243,234,214,0.42)",
            textShadow: SHADOW,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            the work
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ToggleLink href="/" label="Room View" active={false} />
            <span style={{ color: "rgba(243,234,214,0.35)", fontFamily: FONT, fontSize: 11, textShadow: SHADOW }}>|</span>
            <ToggleLink href="/work" label="Grid View" active={true} />
          </div>
        </div>
      </div>

      <div className="grid-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px 200px" }}>
        {/* Tab nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 48, flexWrap: "wrap" }}>
          <Tab label="Brand Work" active={tab === "brand"} onClick={() => setTab("brand")} />
          <span style={{ color: "rgba(243,234,214,0.35)", fontFamily: FONT, fontSize: 12, textShadow: SHADOW }}>|</span>
          <Tab label="Freelance x AI" active={tab === "freelance"} onClick={() => setTab("freelance")} />
          <span style={{ color: "rgba(243,234,214,0.35)", fontFamily: FONT, fontSize: 12, textShadow: SHADOW }}>|</span>
          <Tab label="About Me" active={tab === "about"} onClick={() => setTab("about")} />
        </div>

        {/* Cards (Brand Work / Freelance) */}
        {tab !== "about" && (
          <div>
            {showing.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* About Me — inline picture + headline-led bio */}
        {tab === "about" && about && (() => {
          const paragraphs = about.writeup.split(/\n\n+/).filter(Boolean);
          const first = paragraphs[0] || "";
          const rest = paragraphs.slice(1);
          return (
            <div style={{ maxWidth: 760 }}>
              {about.heroImage && (
                <div style={{
                  width: "100%",
                  maxWidth: 420,
                  aspectRatio: "1/1",
                  background: "rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  marginBottom: 40,
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={about.heroImage}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <h2 style={{
                fontFamily: FONT,
                fontSize: "clamp(26px, 3.6vw, 42px)",
                fontWeight: 600,
                color: about.brandColor || "#00b8b8",
                textShadow: "2px 2px 0 #1b120b",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "0 0 16px",
                lineHeight: 1.15,
              }}>
                cam is a creative director in los angeles.
              </h2>
              {first && (
                <p style={{
                  fontFamily: FONT,
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  fontWeight: 500,
                  color: "rgba(255,250,240,0.92)",
                  textShadow: "1px 1px 0 #1b120b",
                  lineHeight: 1.4,
                  marginBottom: 28,
                }}>
                  {first}
                </p>
              )}
              {rest.map((para, i) => (
                <p key={i} style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: "clamp(15px, 1.3vw, 18px)",
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.75,
                  marginBottom: 18,
                }}>
                  {para}
                </p>
              ))}
            {about.links && about.links.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 14, marginTop: 36,
                fontFamily: FONT, fontSize: 13, color: "#00b8b8",
                textShadow: SHADOW,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {about.links.map((l, i) => (
                  <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {i > 0 && <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>}
                    <a
                      href={l.url}
                      target={l.url.startsWith("http") ? "_blank" : undefined}
                      rel={l.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ color: "#00b8b8", textDecoration: "none" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "#f5d84a")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#00b8b8")}
                    >
                      {l.label}
                    </a>
                  </span>
                ))}
              </div>
            )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
