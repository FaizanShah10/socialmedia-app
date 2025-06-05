"use client";

import { useEffect, useRef } from "react";
import LocomotiveScroll from 'locomotive-scroll'
import "locomotive-scroll/dist/locomotive-scroll.css";

export default function LocoScrollWrapper({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;

    if (!scrollEl) return;

    const scroll = new LocomotiveScroll({
      el: scrollEl as HTMLElement,
      smooth: true,
      lerp: 0.4, // optional: smoothness level
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <div data-scroll-container ref={scrollRef}>
      {children}
    </div>
  );
}
