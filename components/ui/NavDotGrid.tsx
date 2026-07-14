"use client";

import { useEffect, useState } from "react";
import { Shader, DotGrid } from "shaders/react";

// Same "match the OS preference" approach as GlobalShaders/ScreenOverlay —
// no in-app theme toggle exists, so light/dark is read straight off
// prefers-color-scheme.
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

// A faint dot-grid texture across the nav bar's own background — same
// shaders/react library GlobalShaders/ScreenOverlay use site-wide, scoped
// with `absolute` (not `fixed`) so it stays confined to the nav pill
// instead of covering the whole viewport. Formerly lived in the footer
// (FooterDotGrid) — moved here instead.
export default function NavDotGrid() {
  const isDark = useIsDark();

  return (
    // Note: DotGrid's fragment shader only reads the RGB channels of
    // `color` and computes its own alpha from the dot mask/twinkle — any
    // alpha baked into the color string itself (e.g. an rgba() value) gets
    // silently discarded. The `opacity` prop is the one that's actually
    // threaded through to the rendered output, so that's what controls the
    // visible opacity here rather than the color value.
    <Shader className="pointer-events-none absolute opacity-10 inset-0 z-0">
      {/* DotGrid's cell size is always canvas-height ÷ density (density
          maps to the un-stretched axis), never the width — the nav bar is
          only ~60px tall but very wide, so density=20 was producing ~3px
          cells with sub-pixel dots that never showed up. A much smaller
          density (bigger cells) plus a larger dotSize is what actually
          makes the dots visible at this bar's height. */}
      <DotGrid
        color={isDark ? "#ffffff" : "#000000"}
        density={8}
        dotSize={0.35}
        twinkle={0.75}
        opacity={1}
      />
    </Shader>
  );
}
