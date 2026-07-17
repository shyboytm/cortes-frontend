"use client";

import { useEffect, useState } from "react";
import { Shader, DotGrid } from "shaders/react";

// Tracks whether the OS is set to dark mode via the prefers-color-scheme
// media query.
function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDark;
}

// Renders a faint dot-grid texture across the nav bar's background,
// absolutely positioned so it stays confined to the nav pill.
export default function NavDotGrid() {
  const isDark = useIsDark();

  return (
    // DotGrid's shader reads only the RGB channels of `color`; the visible
    // opacity is controlled by the `opacity` prop rather than any alpha
    // channel in the color string.
    <Shader className="pointer-events-none absolute opacity-10 inset-0 z-0">
      {/* DotGrid's cell size is canvas-height ÷ density. A low density and
          larger dotSize produce cells and dots that are visible at the nav
          bar's ~60px height. */}
      <DotGrid
        color={isDark ? "#ffffff" : "#000000"}
        density={8}
        dotSize={0.1}
        twinkle={1}
        opacity={1}
      />
    </Shader>
  );
}
