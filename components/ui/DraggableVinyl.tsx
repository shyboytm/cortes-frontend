"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DraggableVinylProps {
  children: React.ReactNode;
  className?: string;
}

// A few pixels of wiggle room before a pointer-down counts as an actual
// drag rather than a plain click/tap.
const DRAG_THRESHOLD_PX = 4;

// Per-frame velocity decay (tuned against a 16ms/60fps frame, then scaled
// by each frame's real elapsed time so the feel doesn't change on
// higher/lower refresh-rate displays) and the speed (px/ms) below which the
// throw is considered stopped.
const FRICTION_PER_16MS = 0.94;
const MIN_VELOCITY = 0.02;

// A little "pick it up and throw it" toy for the Music page's spinning
// vinyl. Click/tap-drag detaches it from its normal spot in the layout and
// lets it follow the pointer to anywhere in the viewport — `position: fixed`
// is measured and applied in viewport coordinates (same space
// getBoundingClientRect reports), so the handoff from normal flow to fixed
// is seamless, and it escapes any parent's `overflow-hidden` or column
// layout instead of being clipped at the edge of whatever container it
// started in. Releasing it mid-drag carries its recent pointer velocity
// into a short, decelerating "throw" (a single requestAnimationFrame loop —
// cheap, since it only runs on this one small element while it's actually
// still moving). A same-size invisible placeholder holds its original spot
// open in the layout so nothing else reflows while it's picked up. Resets
// back to its default position on every route change — this is a
// page-local plaything, not something that should trail the visitor from
// page to page.
export default function DraggableVinyl({ children, className }: DraggableVinylProps) {
  const pathname = usePathname();
  // Tracks the pathname the drag state was last computed for. When the
  // route changes, reset right during render rather than in an effect —
  // same "reset state when a prop changes" pattern PrimaryNav uses for its
  // own menu-open state, which avoids an extra render pass an effect would
  // cause here.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const throwFrameRef = useRef<number | null>(null);

  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setPosition(null);
    setIsDragging(false);
    // draggedRef/throwFrameRef aren't touched here (mutating a ref during
    // render isn't safe) — the effect below handles canceling any in-flight
    // throw animation on route change, and handlePointerDown always clears
    // draggedRef at the start of every new drag anyway.
  }

  // Stop any in-flight throw animation the moment the route changes —
  // otherwise its still-scheduled setPosition calls could stomp right back
  // over the position reset above.
  useEffect(() => {
    return () => {
      if (throwFrameRef.current !== null) {
        cancelAnimationFrame(throwFrameRef.current);
        throwFrameRef.current = null;
      }
    };
  }, [pathname]);

  const startThrow = () => {
    let lastFrameTime: number | null = null;

    const step = (time: number) => {
      if (lastFrameTime === null) lastFrameTime = time;
      const dt = time - lastFrameTime;
      lastFrameTime = time;

      const { x: vx, y: vy } = velocityRef.current;
      if (Math.hypot(vx, vy) < MIN_VELOCITY) {
        throwFrameRef.current = null;
        return;
      }

      setPosition((prev) => (prev ? { x: prev.x + vx * dt, y: prev.y + vy * dt } : prev));

      const decay = Math.pow(FRICTION_PER_16MS, dt / 16);
      velocityRef.current = { x: vx * decay, y: vy * decay };
      throwFrameRef.current = requestAnimationFrame(step);
    };

    throwFrameRef.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    if (throwFrameRef.current !== null) {
      cancelAnimationFrame(throwFrameRef.current);
      throwFrameRef.current = null;
    }

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    draggedRef.current = false;
    velocityRef.current = { x: 0, y: 0 };
    lastMoveRef.current = null;
    const startPointer = { x: e.clientX, y: e.clientY };
    const startBox = { x: position?.x ?? rect.left, y: position?.y ?? rect.top };
    if (!size) setSize({ width: rect.width, height: rect.height });

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointer.x;
      const dy = moveEvent.clientY - startPointer.y;

      if (!draggedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        draggedRef.current = true;
        setIsDragging(true);
      }

      if (draggedRef.current) {
        setPosition({ x: startBox.x + dx, y: startBox.y + dy });
      }

      const now = performance.now();
      if (lastMoveRef.current) {
        const dt = now - lastMoveRef.current.t;
        if (dt > 0) {
          velocityRef.current = {
            x: (moveEvent.clientX - lastMoveRef.current.x) / dt,
            y: (moveEvent.clientY - lastMoveRef.current.y) / dt,
          };
        }
      }
      lastMoveRef.current = { x: moveEvent.clientX, y: moveEvent.clientY, t: now };
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (draggedRef.current) {
        startThrow();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // A real drag's trailing `click` still fires afterward (browsers dispatch
  // it on pointerup regardless) — swallow it when a genuine drag happened,
  // in case this ever wraps something clickable again.
  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {position && size && <div aria-hidden style={{ width: size.width, height: size.height }} />}
      <div
        ref={nodeRef}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        className={cn(
          "touch-none select-none",
          position ? "fixed z-[60]" : "relative",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        {children}
      </div>
    </>
  );
}
