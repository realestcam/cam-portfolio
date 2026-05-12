"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FONT = '"DM Mono", "Courier New", monospace';
const DARK = "#1b120b";
const OFF_WHITE = "#f3ead6";
const SHADOW = `1px 1px 0 ${DARK}`;
const WHITE_BOX = "rgba(255,255,255,0.5)";

const SOCIALS = [
  { label: "Email", url: "mailto:cameronanthonybell@gmail.com?subject=Inquiry" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/cabell/" },
  { label: "Instagram", url: "https://www.instagram.com/realestcam/" },
];

function ToggleButton({ href, label, active }: { href: string; label: string; active: boolean }) {
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
        pointerEvents: "auto",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {label}
    </Link>
  );
}

function SocialLink({ label, url }: { label: string; url: string }) {
  const external = url.startsWith("http");
  return (
    <a
      href={url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        fontFamily: FONT,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(243,234,214,0.62)",
        textShadow: SHADOW,
        textDecoration: "none",
        pointerEvents: "auto",
        transition: "color 0.15s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = "#f5d84a")}
      onMouseOut={(e) => (e.currentTarget.style.color = "rgba(243,234,214,0.62)")}
    >
      {label}
    </a>
  );
}

export function IdentityPlate() {
  const path = usePathname();
  const onRoom = path === "/";
  const onGrid = path === "/work";

  return (
    <>
      {/* Top-center: "the work" toggle */}
      <div
        className="identity-plate identity-plate-top"
        style={{
          position: "fixed",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <p
          style={{
            fontFamily: FONT,
            fontSize: 9,
            color: "rgba(243,234,214,0.42)",
            textShadow: SHADOW,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          the work
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ToggleButton href="/" label="Room View" active={onRoom} />
          <span
            style={{
              color: "rgba(243,234,214,0.35)",
              fontFamily: FONT,
              fontSize: 11,
              textShadow: SHADOW,
            }}
          >
            |
          </span>
          <ToggleButton href="/work" label="Grid View" active={onGrid} />
        </div>
      </div>

      {/* Bottom-center: name + quote + social */}
      <div
        className="identity-plate identity-plate-bottom"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: "clamp(12px, 1.2vw, 18px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 6,
            lineHeight: 1,
          }}
        >
          cameron bell
          <span style={{ color: "rgba(247,37,133,0.55)", margin: "0 8px", fontWeight: 300 }}>|</span>
          creative director
          <span style={{ color: "rgba(247,37,133,0.55)", margin: "0 8px", fontWeight: 300 }}>|</span>
          los angeles
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 10,
            color: "goldenrod",
            opacity: 0.65,
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}
        >
          shoes off but make urself comfortable.
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 9,
            color: "#FFE34F",
            opacity: 0.85,
            letterSpacing: "0.04em",
            fontStyle: "italic",
            marginBottom: 10,
            maxWidth: 380,
            margin: "0 auto 10px",
          }}
        >
          *pardon the mess, we launched this week and are still tidying things like formatting and spelling.*
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          {SOCIALS.map((s, i) => (
            <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i > 0 && (
                <span style={{ color: "rgba(243,234,214,0.28)", fontFamily: FONT, fontSize: 10, textShadow: SHADOW }}>|</span>
              )}
              <SocialLink label={s.label} url={s.url} />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
