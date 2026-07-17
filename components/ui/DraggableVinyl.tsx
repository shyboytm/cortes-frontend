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

// Per-frame velocity decay, scaled by each frame's real elapsed time, and
// the speed (px/ms) below which the throw is considered stopped.
const FRICTION_PER_16MS = 0.94;
const MIN_VELOCITY = 0.02;

// Lets its children be picked up and dragged anywhere in the viewport, such
// as the Music page's spinning vinyl. A click/tap-drag detaches the element
// from its normal spot in the layout and moves it via `position: fixed`,
// measured and applied in viewport coordinates, so it can be dragged outside
// any parent's `overflow-hidden` or column layout. Releasing mid-drag
// carries the recent pointer velocity into a short, decelerating "throw"
// animated with a single requestAnimationFrame loop. A same-size invisible
// placeholder holds its original spot open in the layout while it's picked
// up. It resets back to its default position on every route change.
export default function DraggableVinyl({ children, className }: DraggableVinylProps) {
  const pathname = usePathname();
  // Tracks the pathname the drag state was last computed for; reset happens
  // directly during render when the route changes.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const throwFrameRef = useRef<number | null>(null);
  // Holds the currently-attached pointermove/pointerup handlers while a drag
  // is in progress, so a mid-drag unmount/route-change can remove them even
  // though handlePointerUp (which normally removes them) never fires.
  const activeListenersRef = useRef<{
    move: (moveEvent: PointerEvent) => void;
    up: () => void;
  } | null>(null);

  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setPosition(null);
    setIsDragging(false);
    // draggedRef/throwFrameRef are left untouched here; the effect below
    // cancels any in-flight throw animation on route change, and
    // handlePointerDown clears draggedRef at the start of every new drag.
  }

  // Cancels any in-flight throw animation when the route changes, and
  // removes any still-attached drag listeners if the route changed (or the
  // component unmounted) mid-drag, since handlePointerUp never got a chance
  // to remove them itself.
  useEffect(() => {
    return () => {
      if (throwFrameRef.current !== null) {
        cancelAnimationFrame(throwFrameRef.current);
        throwFrameRef.current = null;
      }
      if (activeListenersRef.current) {
        window.removeEventListener("pointermove", activeListenersRef.current.move);
        window.removeEventListener("pointerup", activeListenersRef.current.up);
        activeListenersRef.current = null;
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
      activeListenersRef.current = null;

      if (draggedRef.current) {
        startThrow();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    activeListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
  };

  // Suppresses the click event that follows a real drag's pointerup, for
  // cases where this wraps a clickable element.
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
