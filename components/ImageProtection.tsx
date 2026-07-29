"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    const isImageTarget = (target: EventTarget | null) =>
      target instanceof Element && target.closest("img, picture") !== null;

    const handleContextMenu = (event: MouseEvent) => {
      if (isImageTarget(event.target)) event.preventDefault();
    };

    const handleDragStart = (event: DragEvent) => {
      if (isImageTarget(event.target)) event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, []);

  return null;
}
