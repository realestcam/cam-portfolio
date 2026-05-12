import type { Project } from "@/data/projects";

type Size = "sm" | "md" | "lg" | "xl";

const FONT = '"DM Mono", "Courier New", monospace';
const SHADOW = "1px 1px 0 #1b120b";
const TEAL = "#00b8b8";
const OFF_WHITE = "#f3ead6";

const SIZES: Record<Size, { brand: string; title: string; gap: number }> = {
  sm: { brand: "clamp(12px, 0.95vw, 16px)", title: "clamp(10px, 0.72vw, 13px)", gap: 3 },
  md: { brand: "16px", title: "13px", gap: 4 },
  lg: { brand: "22px", title: "17px", gap: 5 },
  xl: { brand: "32px", title: "24px", gap: 6 },
};

export function ProjectLabel({
  project,
  size = "md",
  className,
}: {
  project: Project;
  size?: Size;
  className?: string;
}) {
  const sz = SIZES[size];
  const isUtility = project.tier === "utility";
  const titleColor = isUtility ? TEAL : OFF_WHITE;

  // No brand line — render title in the brand slot (uppercase, teal, prominent)
  if (!project.client) {
    return (
      <div className={className} style={{ fontFamily: FONT, lineHeight: 1, display: "inline-block" }}>
        <div style={{
          fontSize: sz.brand,
          fontWeight: 500,
          color: TEAL,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          textShadow: SHADOW,
        }}>
          {project.title}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ fontFamily: FONT, lineHeight: 1, display: "inline-block" }}>
      <div style={{
        fontSize: sz.brand,
        fontWeight: 500,
        color: TEAL,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        textShadow: SHADOW,
        marginBottom: sz.gap,
      }}>
        {project.client}
      </div>
      <div style={{
        fontSize: sz.title,
        fontWeight: 400,
        color: titleColor,
        letterSpacing: 0,
        textShadow: SHADOW,
      }}>
        {project.title}
      </div>
    </div>
  );
}
