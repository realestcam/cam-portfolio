import Link from "next/link";

const FONT = '"DM Mono", "Courier New", monospace';
const SHADOW = "2px 2px 0 #1b120b";

// 8-bit wizard — pure SVG rects on a 22×30 grid
const HAT = "#3a4d8c";
const HAT_DARK = "#2a3a6c";
const HAT_BAND = "#FFE34F";
const SKIN = "#e8c5a0";
const SKIN_SHADE = "#c9a47e";
const BEARD = "#f0f0f0";
const ROBE = "#3a4d8c";
const ROBE_DARK = "#2a3a6c";
const SHADOW_COL = "#1b120b";
const STAFF = "#7a5230";
const ORB = "#FFE34F";
const ORB_GLOW = "rgba(255,227,79,0.55)";

const PX = 8;
const W = 22;
const H = 30;

function P({ x, y, w = 1, h = 1, c }: { x: number; y: number; w?: number; h?: number; c: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} />;
}

function Wizard() {
  return (
    <svg
      width={W * PX}
      height={H * PX}
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
      aria-hidden
    >
      {/* Hat tip */}
      <P x={10} y={1} w={2} c={HAT} />
      <P x={9}  y={2} w={4} c={HAT} />
      <P x={8}  y={3} w={6} c={HAT} />
      <P x={7}  y={4} w={8} c={HAT} />
      <P x={6}  y={5} w={10} c={HAT} />
      {/* Hat band */}
      <P x={6}  y={6} w={10} c={HAT_BAND} />
      {/* Hat brim */}
      <P x={5}  y={7} w={12} c={HAT_DARK} />

      {/* Face */}
      <P x={8}  y={8} w={6} c={SKIN} />
      <P x={8}  y={9} w={6} c={SKIN} />
      {/* Eyes */}
      <P x={9}  y={9} c={SHADOW_COL} />
      <P x={12} y={9} c={SHADOW_COL} />

      {/* Beard (white, taper down) */}
      <P x={7}  y={10} w={8} c={BEARD} />
      <P x={6}  y={11} w={10} c={BEARD} />
      <P x={6}  y={12} w={10} c={BEARD} />
      <P x={7}  y={13} w={8} c={BEARD} />
      <P x={8}  y={14} w={6} c={BEARD} />
      <P x={9}  y={15} w={4} c={BEARD} />

      {/* Robes */}
      <P x={5}  y={15} w={2} c={ROBE} />
      <P x={15} y={15} w={2} c={ROBE} />
      <P x={5}  y={16} w={12} c={ROBE} />
      <P x={4}  y={17} w={14} c={ROBE} />
      <P x={4}  y={18} w={14} c={ROBE} />
      <P x={4}  y={19} w={14} c={ROBE} />
      <P x={3}  y={20} w={16} c={ROBE} />
      <P x={3}  y={21} w={16} c={ROBE} />
      <P x={3}  y={22} w={16} c={ROBE} />
      <P x={2}  y={23} w={18} c={ROBE} />
      <P x={2}  y={24} w={18} c={ROBE_DARK} />
      <P x={2}  y={25} w={18} c={ROBE_DARK} />

      {/* Feet */}
      <P x={5}  y={26} w={3} c={SHADOW_COL} />
      <P x={14} y={26} w={3} c={SHADOW_COL} />

      {/* Staff (right hand) */}
      <P x={19} y={3} w={3} h={3} c={ORB_GLOW} />
      <P x={20} y={4} c={ORB} />
      <P x={20} y={5} c={ORB} />
      <P x={20} y={6}  c={STAFF} />
      <P x={20} y={7}  c={STAFF} />
      <P x={20} y={8}  c={STAFF} />
      <P x={20} y={9}  c={STAFF} />
      <P x={20} y={10} c={STAFF} />
      <P x={20} y={11} c={STAFF} />
      <P x={20} y={12} c={STAFF} />
      <P x={20} y={13} c={STAFF} />
      <P x={20} y={14} c={STAFF} />
      <P x={20} y={15} c={STAFF} />
      <P x={20} y={16} c={STAFF} />
      <P x={20} y={17} c={STAFF} />
      <P x={20} y={18} c={STAFF} />
      <P x={20} y={19} c={STAFF} />
      <P x={20} y={20} c={STAFF} />
      <P x={20} y={21} c={STAFF} />
      <P x={20} y={22} c={STAFF} />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0b08",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: FONT,
          fontSize: 11,
          color: "rgba(243,234,214,0.4)",
          textShadow: SHADOW,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        404
      </p>

      <div style={{ marginBottom: 36, filter: "drop-shadow(2px 2px 0 #000)" }}>
        <Wizard />
      </div>

      <h1
        style={{
          fontFamily: FONT,
          fontSize: "clamp(22px, 3.4vw, 38px)",
          fontWeight: 600,
          color: "#FFFFFF",
          textShadow: SHADOW,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: "0 0 14px",
          lineHeight: 1.2,
          maxWidth: 720,
        }}
      >
        you shall not pass,
      </h1>

      <Link
        href="/"
        style={{
          fontFamily: FONT,
          fontSize: "clamp(16px, 2.2vw, 24px)",
          fontWeight: 500,
          color: "#FFE34F",
          textShadow: SHADOW,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textDecoration: "none",
          borderBottom: "1px solid rgba(255,227,79,0.55)",
          paddingBottom: 2,
          transition: "color 0.18s ease, border-color 0.18s ease",
        }}
      >
        go back to the shadow!
      </Link>

      <p
        style={{
          fontFamily: FONT,
          fontSize: 10,
          color: "rgba(243,234,214,0.32)",
          textShadow: SHADOW,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginTop: 48,
        }}
      >
        wrong room.
      </p>
    </div>
  );
}
