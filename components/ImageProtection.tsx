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

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return null;
}
