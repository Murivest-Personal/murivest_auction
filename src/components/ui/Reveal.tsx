"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Reveal hook — threshold 0.15, once triggered stays triggered
    (brand guide §7.4). */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** Section reveal — opacity 0→1 and translateY(28px)→0, 900ms
    ease-out, once only. Motion is limited to opacity and
    translation; prefers-reduced-motion is respected in CSS. */
export function Reveal({
  children,
  className,
  delay = 0,
  hero = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hero?: boolean;
  as?: "div" | "section" | "article" | "li" | "span";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn(hero ? "reveal-hero" : "reveal", inView && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
