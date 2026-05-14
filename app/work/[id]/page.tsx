"use client";

import { useState, use } from "react";
import Link from "next/link";
import { getProject, projects, type Project } from "@/data/projects";
import { ProjectLabel } from "../../components/ProjectLabel";

const isVideoSrc = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

function RichText({ text, accent }: { text: string; accent: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/);
        if (m) {
          return (
            <strong key={i} style={{ color: accent, fontWeight: 600 }}>
              {m[1]}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function CarouselItemLabel({ project, item }: { project: Project; item: Project["carousel"][number] }) {
  const accent = project.brandColor || "#FFE34F";
  return (
    <div style={{
      fontFamily: '"DM Mono", "Courier New", monospace',
      fontSize: 11,
      lineHeight: 1.45,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      margin: "0 0 16px",
    }}>
      <div style={{ color: accent, textShadow: "1px 1px 0 #1b120b" }}>
        {project.client}
      </div>
      {project.campaign && (
        <div style={{ color: "rgba(243,234,214,0.65)", textShadow: "1px 1px 0 #1b120b" }}>
          {project.campaign}
        </div>
      )}
      {(item.label || item.runtime) && (
        <div style={{ color: "rgba(243,234,214,0.85)", textShadow: "1px 1px 0 #1b120b" }}>
          {item.label}{item.runtime ? ` : ${item.runtime}` : ""}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = getProject(id);
  const [idx, setIdx] = useState(0);

  const backStyle = {
    fontFamily: '"DM Mono", monospace', fontSize: 9,
    letterSpacing: "0.15em", textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.38)", textDecoration: "none",
  };

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0908", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Link href="/" style={backStyle}>← Back to Room</Link>
      </div>
    );
  }

  const hasCarousel = project.carousel.length > 0;
  const hasHero = !!project.heroImage;
  const heroIsVideo = hasHero && isVideoSrc(project.heroImage);
  const currentItem = hasCarousel ? project.carousel[idx] : null;
  const writeupParagraphs = project.writeup.split(/\n\n+/).filter(Boolean);
  const accent = project.brandColor || "#FFE34F";

  // Prev / Next navigation across active projects (wraps around)
  const activeProjects = projects.filter((p) => p.active);
  const currentIdx = activeProjects.findIndex((p) => p.id === project.id);
  const prevProject = currentIdx >= 0
    ? activeProjects[(currentIdx - 1 + activeProjects.length) % activeProjects.length]
    : null;
  const nextProject = currentIdx >= 0
    ? activeProjects[(currentIdx + 1) % activeProjects.length]
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0908" }}>
      {/* Header */}
      <header className="project-page-header" style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", gap: 18, padding: "20px 48px",
        background: "rgba(10,9,8,0.93)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Link href="/" style={backStyle}
          onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
          onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          ← Back to Room
        </Link>
        <span style={{
          color: "rgba(255,255,255,0.18)", fontFamily: '"DM Mono", monospace', fontSize: 11,
        }}>|</span>
        <Link href="/work" style={backStyle}
          onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
          onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          ← Back to Grid
        </Link>
      </header>

      {/* Hero */}
      {hasHero && (
        <div style={{
          width: "100%", aspectRatio: "16/9",
          background: "rgba(255,255,255,0.03)", overflow: "hidden",
        }}>
          {heroIsVideo ? (
            <video
              src={project.heroImage}
              autoPlay muted loop playsInline
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.heroImage}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 48px 100px" }}>

        {/* Standardized project label: CLIENT / Campaign */}
        <div style={{
          fontFamily: '"DM Mono", "Courier New", monospace',
          lineHeight: 1.15,
          margin: "0 0 28px",
        }}>
          <div style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: accent,
            textShadow: "2px 2px 0 #1b120b",
          }}>
            {project.client || project.title}
          </div>
          {project.campaign && (
            <div style={{
              fontSize: "clamp(18px, 2.2vw, 26px)",
              fontWeight: 500,
              color: "rgba(243,234,214,0.88)",
              textShadow: "2px 2px 0 #1b120b",
              marginTop: 6,
            }}>
              {project.title}
            </div>
          )}
        </div>

        {/* Identity links (About-only) */}
        {project.links && project.links.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            fontFamily: '"DM Mono", "Courier New", monospace',
            fontSize: 13, color: "#00b8b8",
            textShadow: "1px 1px 0 #1b120b",
            textTransform: "uppercase", letterSpacing: "0.04em",
            margin: "0 0 40px",
          }}>
            {project.links.map((l, i) => (
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

        {/* Meta — only show if year/role present, hide for about-me */}
        {project.id !== "about-me" && (project.year || project.role) && (
          <div style={{
            display: "grid",
            gridTemplateColumns: project.year ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: 24,
            paddingBottom: 32, marginBottom: 36,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            {project.year && (
              <div>
                <div style={{
                  fontFamily: '"DM Mono", monospace', fontSize: 8,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)", marginBottom: 8,
                }}>Year</div>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.68)",
                }}>{project.year}</div>
              </div>
            )}
            <div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: 8,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)", marginBottom: 8,
              }}>Role</div>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.68)",
              }}>{project.role}</div>
            </div>
            <div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: 8,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)", marginBottom: 8,
              }}>Type</div>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.68)",
              }}>{project.type}</div>
            </div>
          </div>
        )}

        {/* Writeup — multi-paragraph with **bold** highlights in brand color */}
        <div style={{ maxWidth: 720, margin: "0 0 56px" }}>
          {writeupParagraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: "clamp(16px, 1.35vw, 19px)", fontWeight: 400,
              color: "rgba(255,255,255,0.68)", lineHeight: 1.75,
              marginBottom: 20,
            }}>
              <RichText text={para} accent={accent} />
            </p>
          ))}
        </div>

        {/* Vimeo */}
        {project.vimeoUrl && (
          <div style={{ width: "100%", aspectRatio: "16/9", marginBottom: 56 }}>
            <iframe
              src={project.vimeoUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Carousel */}
        {hasCarousel && currentItem && (
          <div style={{ marginBottom: 80 }}>
            <CarouselItemLabel project={project} item={currentItem} />

            <div style={{
              width: "100%", aspectRatio: "16/9",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden", marginBottom: 16,
            }}>
              {isVideoSrc(currentItem.src) ? (
                <video
                  key={currentItem.src}
                  src={currentItem.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentItem.src}
                  src={currentItem.src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>

            {/* Per-item writeup */}
            {currentItem.writeup && (
              <div style={{ maxWidth: 720, margin: "16px 0 24px" }}>
                {currentItem.writeup.split(/\n\n+/).map((para, i) => (
                  <p key={i} style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: 16, fontWeight: 400,
                    color: "rgba(255,255,255,0.65)", lineHeight: 1.7,
                    marginBottom: 14,
                  }}>
                    <RichText text={para} accent={accent} />
                  </p>
                ))}
              </div>
            )}

            {project.carousel.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {(["←", "→"] as const).map((arrow, i) => (
                  <button key={arrow}
                    onClick={() => setIdx(prev =>
                      i === 0
                        ? (prev === 0 ? project.carousel.length - 1 : prev - 1)
                        : (prev === project.carousel.length - 1 ? 0 : prev + 1)
                    )}
                    style={{
                      background: "none", border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.55)", fontFamily: '"DM Mono", monospace',
                      fontSize: 13, padding: "8px 20px", cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    {arrow}
                  </button>
                ))}
                <span style={{
                  fontFamily: '"DM Mono", monospace', fontSize: 10,
                  color: "rgba(255,255,255,0.32)",
                }}>
                  {idx + 1} / {project.carousel.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Storyboard — 3×2 grid (e.g. ai-creations "Scary Movie") */}
        {project.storyboard && project.storyboard.length > 0 && (
          <div style={{ marginBottom: 80 }}>
            <div style={{
              fontFamily: '"DM Mono", monospace', fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: accent, marginBottom: 16,
              textShadow: "1px 1px 0 #1b120b",
            }}>
              Scary Movie / Storyboard
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 4,
              background: "#0a0908",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: 4,
            }}>
              {project.storyboard.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    display: "block",
                    background: "#000",
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next project nav — bright, obvious, with titles */}
        {(prevProject || nextProject) && (
          <nav className="project-nav" aria-label="Project navigation">
            {prevProject && (
              <Link
                href={`/work/${prevProject.id}`}
                style={{
                  display: "block", textDecoration: "none",
                  padding: "18px 22px",
                  background: "rgba(247,37,133,0.08)",
                  border: "1px solid rgba(247,37,133,0.35)",
                  borderRadius: 4,
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(247,37,133,0.18)";
                  e.currentTarget.style.borderColor = "#F72585";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(247,37,133,0.08)";
                  e.currentTarget.style.borderColor = "rgba(247,37,133,0.35)";
                }}
              >
                <div style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#F72585",
                  marginBottom: 8,
                }}>
                  ← Previous Project
                </div>
                <div style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 14, fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: prevProject.brandColor || "rgba(255,255,255,0.85)",
                  textShadow: "1px 1px 0 #1b120b",
                }}>
                  {prevProject.client || prevProject.title}
                </div>
                {prevProject.campaign && (
                  <div style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 12, fontWeight: 400,
                    color: "rgba(243,234,214,0.68)",
                    textShadow: "1px 1px 0 #1b120b",
                    marginTop: 2,
                  }}>
                    {prevProject.title}
                  </div>
                )}
              </Link>
            )}
            {nextProject && (
              <Link
                href={`/work/${nextProject.id}`}
                style={{
                  display: "block", textDecoration: "none",
                  padding: "18px 22px",
                  background: "rgba(247,37,133,0.08)",
                  border: "1px solid rgba(247,37,133,0.35)",
                  borderRadius: 4,
                  textAlign: "right",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(247,37,133,0.18)";
                  e.currentTarget.style.borderColor = "#F72585";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(247,37,133,0.08)";
                  e.currentTarget.style.borderColor = "rgba(247,37,133,0.35)";
                }}
              >
                <div style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#F72585",
                  marginBottom: 8,
                }}>
                  Next Project →
                </div>
                <div style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 14, fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: nextProject.brandColor || "rgba(255,255,255,0.85)",
                  textShadow: "1px 1px 0 #1b120b",
                }}>
                  {nextProject.client || nextProject.title}
                </div>
                {nextProject.campaign && (
                  <div style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 12, fontWeight: 400,
                    color: "rgba(243,234,214,0.68)",
                    textShadow: "1px 1px 0 #1b120b",
                    marginTop: 2,
                  }}>
                    {nextProject.title}
                  </div>
                )}
              </Link>
            )}
          </nav>
        )}

        {/* Small back-out links under the nav */}
        <div style={{
          display: "flex", gap: 14, marginTop: 24,
          alignItems: "center", justifyContent: "center",
        }}>
          <Link href="/" style={backStyle}
            onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >
            ← Back to Room
          </Link>
          <span style={{ color: "rgba(255,255,255,0.18)", fontFamily: '"DM Mono", monospace', fontSize: 11 }}>|</span>
          <Link href="/work" style={backStyle}
            onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseOut={(e)  => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >
            ← Back to Grid
          </Link>
        </div>

        {/* Credits — last line */}
        {project.credits && (
          <div style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontFamily: '"DM Mono", "Courier New", monospace',
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.32)",
            textShadow: "1px 1px 0 #1b120b",
          }}>
            {project.credits}
          </div>
        )}
      </div>
    </div>
  );
}
