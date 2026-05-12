"use client";

import { useState, useEffect } from "react";

const FONT = '"DM Mono", "Courier New", monospace';
const SHADOW = "1px 1px 0 #1b120b";

export function OpeningExperience({
  onLookAround,
  onGoToWork,
}: {
  onLookAround: () => void;
  onGoToWork: () => void;
}) {
  const [phase, setPhase] = useState<"yerr" | "choice">("yerr");
  const [yerrLeaving, setYerrLeaving] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setYerrLeaving(true), 3600);
    const t2 = setTimeout(() => setPhase("choice"), 4100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleLookAround() {
    setExiting(true);
    setTimeout(onLookAround, 600);
  }
  function handleGoToWork() {
    setExiting(true);
    setTimeout(onGoToWork, 600);
  }

  const buttonStyle = {
    fontFamily: FONT,
    fontSize: 13,
    letterSpacing: "0.10em",
    textTransform: "uppercase" as const,
    padding: "10px 22px",
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontWeight: 400,
    transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
    textShadow: SHADOW,
  };

  return (
    <div
      className="cb-opening-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(13, 11, 8, 0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: exiting ? "introExit 0.6s ease-out forwards" : "introFade 0.5s ease-out",
        pointerEvents: "auto",
      }}
    >
      {phase === "yerr" && (
        <h1
          onClick={() => { setYerrLeaving(true); setTimeout(() => setPhase("choice"), 400); }}
          style={{
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 400,
            color: "#FFFFFF",
            textShadow: SHADOW,
            cursor: "pointer",
            opacity: yerrLeaving ? 0 : 1,
            transition: "opacity 0.4s ease-out",
            animation: "slinky 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
            transformOrigin: "center bottom",
            userSelect: "none",
            margin: 0,
            letterSpacing: "0.04em",
          }}
        >
          yyerrrrrr!
        </h1>
      )}

      {phase === "choice" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            animation: "introFade 0.5s ease-out",
          }}
        >
          <button
            onClick={handleLookAround}
            style={buttonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "#FFFFFF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
            }}
          >
            look around
          </button>
          <button
            onClick={handleGoToWork}
            style={buttonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "#FFFFFF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
            }}
          >
            go straight to the work
          </button>
        </div>
      )}
    </div>
  );
}

export function CenterNotification({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 5000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 60,
        maxWidth: 540,
        padding: "0 32px",
        textAlign: "center",
        pointerEvents: "none",
        animation: "notifFade 5s ease-in-out forwards",
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontSize: 13,
          color: "rgba(255,255,255,0.92)",
          textShadow: SHADOW,
          lineHeight: 1.6,
          letterSpacing: "0.06em",
          margin: 0,
        }}
      >
        look around, take ur time,
        <br />
        or go straight to the work.
        <br />
        <span style={{ opacity: 0.7 }}>up to you, ill brb</span>
      </p>
    </div>
  );
}
