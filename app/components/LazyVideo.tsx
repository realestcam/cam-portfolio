"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  rootMargin?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
};

/**
 * Defers loading the video src until the element is near the viewport.
 * Avoids the browser fetching N videos on first paint when most of them
 * are hidden (mobile thumbnails on desktop, offscreen grid cards, etc).
 */
export function LazyVideo({
  src,
  rootMargin = "300px",
  controls = false,
  loop = true,
  muted = true,
  autoPlay = true,
  playsInline = true,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || load) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [load, rootMargin]);

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      preload={load ? "metadata" : "none"}
      muted={muted}
      playsInline={playsInline}
      loop={loop}
      autoPlay={autoPlay}
      controls={controls}
      {...rest}
    />
  );
}
