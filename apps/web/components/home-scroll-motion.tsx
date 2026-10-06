"use client";

import { useEffect } from "react";

export function HomeScrollMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".home-hero");
    const statement = document.querySelector<HTMLElement>(".home-statement");
    if (!hero) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const heroProgress = Math.min(Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
      const pageRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const pageProgress = Math.min(Math.max(window.scrollY / pageRange, 0), 1);

      hero.style.setProperty("--hero-scroll", heroProgress.toFixed(4));
      if (statement) {
        const rect = statement.getBoundingClientRect();
        const progress = Math.min(Math.max((window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.2), 0), 1);
        statement.style.setProperty("--statement-progress", progress.toFixed(4));
      }
      document.documentElement.style.setProperty("--page-scroll", pageProgress.toFixed(4));
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      hero.style.removeProperty("--hero-scroll");
      statement?.style.removeProperty("--statement-progress");
      document.documentElement.style.removeProperty("--page-scroll");
    };
  }, []);

  return <div className="home-scroll-progress" aria-hidden="true"><span /></div>;
}
