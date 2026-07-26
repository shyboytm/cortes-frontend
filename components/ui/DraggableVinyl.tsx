"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DraggableVinylProps {
  children: React.ReactNode;
  className?: string;
}

const DRAG_THRESHOLD_PX = 4;

const FRICTION_PER_16MS = 0.94;
const MIN_VELOCITY = 0.02;

export default function DraggableVinyl({ children, className }: DraggableVinylProps) {
  const pathname = usePathname();
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const throwFrameRef = useRef<number | null>(null);
  const activeListenersRef = useRef<{
    move: (moveEvent: PointerEvent) => void;
    up: () => void;
  } | null>(null);

  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setPosition(null);
    setIsDragging(false);
  }

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
