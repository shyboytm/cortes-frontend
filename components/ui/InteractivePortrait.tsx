"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MODES = ["dither", "ascii", "halftone", "normal"] as const;
type Mode = (typeof MODES)[number];

const MODE_LABELS: Record<Mode, string> = {
  normal: "Normal",
  dither: "Dithered",
  ascii: "ASCII",
  halftone: "Halftone",
};

const ASCII_RAMP = " .:-=+*#%@";
const ASCII_CELL = 15;

const DITHER_CELL = 5;
const HALFTONE_CELL = 16;

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const TARGET_ASPECT = 3 / 4;
const BUFFER_WIDTH = 640;
const BUFFER_HEIGHT = Math.round(BUFFER_WIDTH / TARGET_ASPECT);

const LIQUIFY_RADIUS = 160;
const LIQUIFY_STRENGTH = 4.5;

const CYCLE_INTERVAL_MS = 6000;
const DISSOLVE_MS = 1200;

export interface InteractivePortraitProps {
  src: string | string[];
  alt: string;
  className?: string;
}

function cropImageToBuffer(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): ImageData {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const srcAspect = srcW / srcH;

  let cropW = srcW;
  let cropH = srcH;
  let cropX = 0;
  const cropY = 0;

  if (srcAspect > TARGET_ASPECT) {
    cropW = srcH * TARGET_ASPECT;
    cropX = (srcW - cropW) / 2;
  } else {
    cropH = srcW / TARGET_ASPECT;
  }

  canvas.width = BUFFER_WIDTH;
  canvas.height = BUFFER_HEIGHT;
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);
  return ctx.getImageData(0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);
}

export default function InteractivePortrait({ src, alt, className }: InteractivePortraitProps) {
  const srcs = useMemo(() => (Array.isArray(src) ? src : [src]), [src]);
  const containerRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transitionCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<ImageData | null>(null);
  const workingRef = useRef<ImageData | null>(null);
  const rafRef = useRef<number | null>(null);
  const dissolveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDissolvingRef = useRef(false);
  const lastCommittedSrcRef = useRef<string | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [modeIndex, setModeIndex] = useState(0);
  const [srcIndex, setSrcIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const mode = MODES[modeIndex];
  const currentSrc = srcs[srcIndex % srcs.length];
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const srcIndexRef = useRef(srcIndex);
  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const renderMode = useCallback((modeToRender: Mode, source: ImageData, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, data } = source;

    if (modeToRender === "normal") {
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

  useEffect(() => {
    if (lastCommittedSrcRef.current === currentSrc && originalRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    let cancelled = false;
    const img = new window.Image();
    img.src = currentSrc;
    img.onload = () => {
      if (cancelled) return;

      const original = cropImageToBuffer(img, canvas, ctx);
      originalRef.current = original;
      workingRef.current = new ImageData(
        new Uint8ClampedArray(original.data),
        BUFFER_WIDTH,
        BUFFER_HEIGHT
      );
      lastCommittedSrcRef.current = currentSrc;
      setReady(true);
    };

    return () => {
      cancelled = true;
    };
  }, [currentSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ready || !originalRef.current || !workingRef.current || !canvas) return;
    workingRef.current.data.set(originalRef.current.data);
    renderMode(mode, workingRef.current, canvas);
  }, [mode, ready, renderMode]);

  const startDissolve = useCallback(() => {
    if (srcs.length <= 1 || isDissolvingRef.current) return;
    const transitionCanvas = transitionCanvasRef.current;
    const tctx = transitionCanvas?.getContext("2d", { willReadFrequently: true });
    if (!transitionCanvas || !tctx) return;

    const nextIndex = (srcIndexRef.current + 1) % srcs.length;
    const nextSrc = srcs[nextIndex];

    isDissolvingRef.current = true;

    const img = new window.Image();
    img.src = nextSrc;
    img.onload = () => {
      const nextOriginal = cropImageToBuffer(img, transitionCanvas, tctx);
      renderMode(modeRef.current, nextOriginal, transitionCanvas);

      transitionCanvas.style.transition = "none";
      transitionCanvas.style.opacity = "0";
      void transitionCanvas.offsetHeight;
      transitionCanvas.style.transition = `opacity ${DISSOLVE_MS}ms ease-in-out`;
      transitionCanvas.style.opacity = "1";

      dissolveTimeoutRef.current = setTimeout(() => {
        const mainCanvas = canvasRef.current;
        originalRef.current = nextOriginal;
        workingRef.current = new ImageData(
          new Uint8ClampedArray(nextOriginal.data),
          BUFFER_WIDTH,
          BUFFER_HEIGHT
        );
        if (mainCanvas) renderMode(modeRef.current, workingRef.current, mainCanvas);

        lastCommittedSrcRef.current = nextSrc;
        setSrcIndex(nextIndex);

        transitionCanvas.style.transition = "none";
        transitionCanvas.style.opacity = "0";
        isDissolvingRef.current = false;
      }, DISSOLVE_MS);
    };
  }, [srcs, renderMode]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (srcs.length <= 1 || !isIntersecting) return;

    const interval = setInterval(() => {
      startDissolve();
    }, CYCLE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (dissolveTimeoutRef.current) clearTimeout(dissolveTimeoutRef.current);
    };
  }, [srcs.length, startDissolve, isIntersecting]);

  const applySwirl = useCallback((cx: number, cy: number) => {
    const original = originalRef.current;
    const working = workingRef.current;
    const canvas = canvasRef.current;
    if (!original || !working || !canvas) return;

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

    renderMode(modeRef.current, working, canvas);
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
    const canvas = canvasRef.current;
    if (!ready || !originalRef.current || !workingRef.current || !canvas) return;
    workingRef.current.data.set(originalRef.current.data);
    renderMode(mode, workingRef.current, canvas);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const cycle = () => setModeIndex((i) => (i + 1) % MODES.length);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={cycle}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      data-cuelume-hover="tick"
      data-cuelume-press
      className={cn(
        "group relative block w-full cursor-pointer rounded-sm border border-black/10 text-left dark:border-white/10",
        className
      )}
      aria-label={`Portrait photo, click to cycle effects — currently ${MODE_LABELS[mode]}`}
    >
      <div className="relative aspect-[3/4] w-full shadow-2xl">
    
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className="object-cover object-top opacity-0"
          sizes="(max-width: 1024px) 100vw, 340px"
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200",
            ready && "opacity-100"
          )}
        />
        <canvas
          ref={transitionCanvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      </div>

      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] tracking-widest text-white uppercase opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        {MODE_LABELS[mode]}
      </span>
    </button>
  );
}
