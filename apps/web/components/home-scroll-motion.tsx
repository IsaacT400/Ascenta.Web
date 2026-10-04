"use client";

import { useEffect } from "react";

export function HomeScrollMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".home-hero");
    if (!hero) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const heroProgress = Math.min(Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
      const pageRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const pageProgress = Math.min(Math.max(window.scrollY / pageRange, 0), 1);

      hero.style.setProperty("--hero-scroll", heroProgress.toFixed(4));
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
      document.documentElement.style.removeProperty("--page-scroll");
    };
  }, []);

  return <div className="home-scroll-progress" aria-hidden="true"><span /></div>;
}
