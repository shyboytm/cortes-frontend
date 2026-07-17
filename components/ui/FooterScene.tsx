"use client";

import { useEffect, useRef, useState } from "react";
import { useIsDark } from "@/lib/hooks/useIsDark";

const BASE_OPACITY = 0.08;
const FADE_DURATION_MS = 1400;

// A large, faint wireframe shape that drifts toward the cursor and
// occasionally dissolves into a different geometry. Purely decorative: sits
// behind the footer's content (pointer-events-none, aria-hidden) and
// dynamically imports three.js — deferred until the container first nears
// the viewport (see the IntersectionObserver effect below) since it's below
// the fold on first paint.
export default function FooterScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const isDarkRef = useRef(isDark);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  // Only start downloading/booting three.js once the footer's container is
  // within (or close to) the viewport, rather than unconditionally on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNearViewport) return;

    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed || !container) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.z = 9;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Shape pool the background cycles through: box, tetrahedron, and
      // octahedron.
      const geometries = [
        () => new THREE.BoxGeometry(3.4, 3.4, 3.4),
        () => new THREE.TetrahedronGeometry(3.2, 0),
        () => new THREE.OctahedronGeometry(3, 0),
      ];

      const makeMaterial = () =>
        new THREE.MeshBasicMaterial({
          color: isDarkRef.current ? 0xffffff : 0x000000,
          wireframe: true,
          transparent: true,
          opacity: 0,
        });

      // Two meshes cross-fade (dissolve) between shapes: one is the visible
      // mesh at rest, the other sits pre-loaded at opacity 0 with whichever
      // shape comes next.
      const materials = [makeMaterial(), makeMaterial()];
      const meshes = [
        new THREE.Mesh(geometries[0](), materials[0]),
        new THREE.Mesh(geometries[1 % geometries.length](), materials[1]),
      ];
      const geomIdx = [0, 1 % geometries.length];
      materials[0].opacity = BASE_OPACITY;
      meshes.forEach((mesh) => scene.add(mesh));

      const resize = () => {
        const { clientWidth, clientHeight } = container;
        if (clientWidth === 0 || clientHeight === 0) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
      };
      resize();

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      // Cursor position (normalized -1..1), tracked across the whole
      // viewport.
      const pointer = { x: 0, y: 0 };
      const targetRotation = { x: 0, y: 0 };
      const rotationState = { x: 0, y: 0 };
      const handlePointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", handlePointerMove);

      let frameId = 0;
      let activeIdx = 0;
      let fading = false;
      let fadeStart = 0;
      let lastSwap = performance.now();
      let nextSwapDelay = 6000 + Math.random() * 4000;

      const pickNextGeometryIndex = (excludeIdx: number) => {
        if (geometries.length === 1) return 0;
        let next = excludeIdx;
        while (next === excludeIdx) {
          next = Math.floor(Math.random() * geometries.length);
        }
        return next;
      };

      const animate = (time: number) => {
        frameId = requestAnimationFrame(animate);

        materials.forEach((material) => {
          material.color.set(isDarkRef.current ? 0xffffff : 0x000000);
        });

        if (!prefersReducedMotion) {
          targetRotation.y = pointer.x * 0.6;
          targetRotation.x = pointer.y * 0.4;
          rotationState.y += (targetRotation.y - rotationState.y) * 0.03 + 0.0015;
          rotationState.x += (targetRotation.x - rotationState.x) * 0.03 + 0.0008;
          meshes.forEach((mesh) => {
            mesh.rotation.y = rotationState.y;
            mesh.rotation.x = rotationState.x;
          });

          if (!fading && time - lastSwap > nextSwapDelay) {
            fading = true;
            fadeStart = time;
            lastSwap = time;
            nextSwapDelay = 6000 + Math.random() * 5000;
          }

          if (fading) {
            const t = Math.min(1, (time - fadeStart) / FADE_DURATION_MS);
            const hiddenIdx = 1 - activeIdx;
            materials[activeIdx].opacity = BASE_OPACITY * (1 - t);
            materials[hiddenIdx].opacity = BASE_OPACITY * t;

            if (t >= 1) {
              fading = false;
              activeIdx = hiddenIdx;
              // Pre-load a fresh shape into the now-hidden mesh, ready for
              // the next dissolve.
              const staleIdx = 1 - activeIdx;
              const nextGeomIdx = pickNextGeometryIndex(geomIdx[activeIdx]);
              geomIdx[staleIdx] = nextGeomIdx;
              meshes[staleIdx].geometry.dispose();
              meshes[staleIdx].geometry = geometries[nextGeomIdx]();
            }
          }
        } else {
          rotationState.y += 0.0008;
          meshes.forEach((mesh) => {
            mesh.rotation.y = rotationState.y;
          });
        }

        renderer.render(scene, camera);
      };
      frameId = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("pointermove", handlePointerMove);
        resizeObserver.disconnect();
        meshes.forEach((mesh) => mesh.geometry.dispose());
        materials.forEach((material) => material.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [isNearViewport]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
