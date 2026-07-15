"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MODES = ["normal", "dither", "ascii", "halftone", "hue"] as const;
type Mode = (typeof MODES)[number];

const MODE_LABELS: Record<Mode, string> = {
  normal: "Normal",
  dither: "Dithered",
  ascii: "ASCII",
  halftone: "Halftone",
  hue: "Color Shift",
};

// Light -> dark character ramp, sampled by luminance per cell.
const ASCII_RAMP = " .:-=+*#%@";
const ASCII_CELL = 15; // px font size — bigger, chunkier characters

const DITHER_CELL = 5; // px per dither block, so dots read as visible blocks
const HALFTONE_CELL = 16; // px per halftone grid cell

// Classic 4x4 Bayer ordered-dithering matrix (values 0-15, normalized below).
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// The canvas buffer is pre-cropped to this exact aspect ratio at load time
// (matching object-top's "keep the top, crop the bottom/sides" behavior) —
// must match the wrapping box's aspect-[3/4] class below. Baking the crop
// into the buffer itself (rather than relying on CSS object-fit on the
// canvas) keeps mouse-to-pixel math for the liquify effect a plain linear
// scale, with no separate crop-offset math to get wrong.
const TARGET_ASPECT = 3 / 4;
const BUFFER_WIDTH = 640;
const BUFFER_HEIGHT = Math.round(BUFFER_WIDTH / TARGET_ASPECT);

// How far (in buffer pixels) the cursor's swirl reaches, and how strong the
// twist is at the very center of that radius.
const LIQUIFY_RADIUS = 160;
const LIQUIFY_STRENGTH = 4.5;

export interface InteractivePortraitProps {
  src: string;
  alt: string;
  className?: string;
}

// A photo that cycles through a few canvas-based effects on click — the
// original image, an ordered (Bayer) black & white dither, a monospace
// ASCII-art render, a circle halftone, and a continuously hue-shifting
// version — and swirls locally around the cursor while hovered, in whichever
// mode is currently showing. A real next/image sits underneath at all times
// (so there's always a proper, optimized photo, including before JS/the
// canvas is ready), with the canvas layered on top and only shown once it
// has something to draw.
export default function InteractivePortrait({ src, alt, className }: InteractivePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<ImageData | null>(null);
  const workingRef = useRef<ImageData | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [modeIndex, setModeIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const mode = MODES[modeIndex];
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Renders `source` pixel data to the canvas using whichever mode is
  // passed in — shared by the mode-switch effect and every liquify frame,
  // so both always draw the exact same way.
  const renderMode = useCallback((modeToRender: Mode, source: ImageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width, height, data } = source;

    if (modeToRender === "normal" || modeToRender === "hue") {
      ctx.putImageData(source, 0, 0);
      return;
    }

    if (modeToRender === "dither") {
      const out = ctx.createImageData(width, height);
      for (let by = 0; by < height; by += DITHER_CELL) {
        const my = Math.floor(by / DITHER_CELL) % 4;
        for (let bx = 0; bx < width; bx += DITHER_CELL) {
          const mx = Math.floor(bx / DITHER_CELL) % 4;
          const i = (by * width + bx) * 4;
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const threshold = ((BAYER_4X4[my][mx] + 0.5) / 16) * 255;
          const value = gray > threshold ? 255 : 0;
          for (let yy = 0; yy < DITHER_CELL && by + yy < height; yy++) {
            for (let xx = 0; xx < DITHER_CELL && bx + xx < width; xx++) {
              const oi = ((by + yy) * width + (bx + xx)) * 4;
              out.data[oi] = value;
              out.data[oi + 1] = value;
              out.data[oi + 2] = value;
              out.data[oi + 3] = 255;
            }
          }
        }
      }
      ctx.putImageData(out, 0, 0);
      return;
    }

    if (modeToRender === "ascii") {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${ASCII_CELL}px monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff";
      // Monospace glyphs don't necessarily advance exactly ASCII_CELL px —
      // measuring the real advance width keeps each sampled row's character
      // count matching the canvas width instead of falling short of it.
      const charWidth = ctx.measureText("0").width || ASCII_CELL * 0.6;
      for (let y = 0; y < height; y += ASCII_CELL) {
        let row = "";
        for (let x = 0; x < width; x += charWidth) {
          const sx = Math.min(width - 1, Math.round(x));
          const i = (y * width + sx) * 4;
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const charIndex = Math.floor((gray / 255) * (ASCII_RAMP.length - 1));
          row += ASCII_RAMP[charIndex];
        }
        ctx.fillText(row, 0, y);
      }
      return;
    }

    if (modeToRender === "halftone") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#000";
      for (let by = 0; by < height; by += HALFTONE_CELL) {
        const cy = by + HALFTONE_CELL / 2;
        for (let bx = 0; bx < width; bx += HALFTONE_CELL) {
          const cx = bx + HALFTONE_CELL / 2;
          const sx = Math.min(width - 1, Math.round(cx));
          const sy = Math.min(height - 1, Math.round(cy));
          const i = (sy * width + sx) * 4;
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const darkness = 1 - gray / 255;
          const radius = (HALFTONE_CELL / 2) * darkness;
          if (radius < 0.4) continue;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, []);

  // Load the source image once, baking in a crop to TARGET_ASPECT (anchored
  // to the top, matching the fallback <Image>'s object-top) so the buffer's
  // own aspect ratio always matches the box it's displayed in.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    let cancelled = false;
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (cancelled) return;

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcAspect = srcW / srcH;

      let cropW = srcW;
      let cropH = srcH;
      let cropX = 0;
      const cropY = 0; // top-anchored — crop off the bottom/sides, never the top

      if (srcAspect > TARGET_ASPECT) {
        cropW = srcH * TARGET_ASPECT;
        cropX = (srcW - cropW) / 2;
      } else {
        cropH = srcW / TARGET_ASPECT;
      }

      canvas.width = BUFFER_WIDTH;
      canvas.height = BUFFER_HEIGHT;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);

      const original = ctx.getImageData(0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);
      originalRef.current = original;
      workingRef.current = new ImageData(
        new Uint8ClampedArray(original.data),
        BUFFER_WIDTH,
        BUFFER_HEIGHT
      );
      setReady(true);
    };

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Re-render (from a clean, un-swirled copy) whenever the mode changes.
  useEffect(() => {
    if (!ready || !originalRef.current || !workingRef.current) return;
    workingRef.current.data.set(originalRef.current.data);
    renderMode(mode, workingRef.current);
  }, [mode, ready, renderMode]);

  // Swirls the working buffer around (cx, cy), starting fresh from the
  // pristine original each time — so the distortion follows the cursor
  // live rather than permanently deforming the image.
  const applySwirl = useCallback((cx: number, cy: number) => {
    const original = originalRef.current;
    const working = workingRef.current;
    if (!original || !working) return;

    working.data.set(original.data);

    const { width, height, data } = original;
    const minX = Math.max(0, Math.floor(cx - LIQUIFY_RADIUS));
    const maxX = Math.min(width - 1, Math.ceil(cx + LIQUIFY_RADIUS));
    const minY = Math.max(0, Math.floor(cy - LIQUIFY_RADIUS));
    const maxY = Math.min(height - 1, Math.ceil(cy + LIQUIFY_RADIUS));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= LIQUIFY_RADIUS) continue;

        const falloff = 1 - dist / LIQUIFY_RADIUS;
        const angle = falloff * falloff * LIQUIFY_STRENGTH;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const srcX = cx + dx * cosA - dy * sinA;
        const srcY = cy + dx * sinA + dy * cosA;
        const sx = Math.min(width - 1, Math.max(0, Math.round(srcX)));
        const sy = Math.min(height - 1, Math.max(0, Math.round(srcY)));

        const srcI = (sy * width + sx) * 4;
        const dstI = (y * width + x) * 4;
        working.data[dstI] = data[srcI];
        working.data[dstI + 1] = data[srcI + 1];
        working.data[dstI + 2] = data[srcI + 2];
        working.data[dstI + 3] = 255;
      }
    }

    renderMode(modeRef.current, working);
  }, [renderMode]);

  const scheduleSwirl = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const point = pointerRef.current;
      if (point) applySwirl(point.x, point.y);
    });
  }, [applySwirl]);

  const handlePointerMove: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    scheduleSwirl();
  };

  const handlePointerLeave = () => {
    pointerRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!ready || !originalRef.current || !workingRef.current) return;
    workingRef.current.data.set(originalRef.current.data);
    renderMode(mode, workingRef.current);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const cycle = () => setModeIndex((i) => (i + 1) % MODES.length);

  return (
    <button
      type="button"
      onClick={cycle}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={cn(
        "group relative block w-full cursor-pointer overflow-hidden rounded-sm border border-black/10 text-left dark:border-white/10",
        className
      )}
      aria-label={`Portrait photo, click to cycle effects — currently ${MODE_LABELS[mode]}`}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 340px"
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200",
            ready && "opacity-100",
            mode === "hue" && "animate-hue-cycle"
          )}
        />
      </div>

      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] tracking-widest text-white uppercase opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        {MODE_LABELS[mode]}
      </span>
    </button>
  );
}
