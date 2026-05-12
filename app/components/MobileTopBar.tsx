import Link from "next/link";

const FONT = '"DM Mono", "Courier New", monospace';
const SHADOW = "1px 1px 0 #1b120b";

export function MobileTopBar() {
  return (
    <div className="mobile-top-bar">
      <Link
        href="/"
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,0.92)",
          textDecoration: "none",
          letterSpacing: "0.02em",
        }}
      >
        Cam
      </Link>
      <span style={{ color: "rgba(243,234,214,0.45)", fontFamily: FONT, fontSize: 11 }}>|</span>
      <span
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.04em",
        }}
      >
        Creative Director
      </span>
      <span style={{ color: "rgba(243,234,214,0.45)", fontFamily: FONT, fontSize: 11 }}>|</span>
      <a
        href="mailto:cameronanthonybell@gmail.com?subject=Inquiry"
        style={{
          fontFamily: FONT,
          fontSize: 11,
          color: "#FFE34F",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          textShadow: SHADOW,
        }}
      >
        Contact
      </a>
    </div>
  );
}
