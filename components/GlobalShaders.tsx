'use client'

import { Shader, ChromaFlow, ChromaticAberration, Ascii, CursorTrail } from 'shaders/react'
import { useIsDark } from '@/lib/hooks/useIsDark'

// Site-wide ambient background: a ChromaFlow color wash nested inside
// ChromaticAberration for an RGB-fringed liquid-color-split effect, plus an
// Ascii-ified cursor trail layered on top so ASCII characters follow the
// cursor around the site. Colors for both switch with the user's OS-level
// light/dark preference. Fixed positioning pins the effect to the viewport
// so it covers whatever is currently visible on any page length.
export default function GlobalShader() {
  const isDark = useIsDark()

  return (
    <Shader className="fixed inset-0 z-0 w-screen h-screen pointer-events-none opacity-80">
      <ChromaticAberration strength={0.6} angle={45}>
        <ChromaFlow
          baseColor={isDark ? '#000000' : '#ffffff'}
          upColor="#00ffff"
          downColor="#ff00ff"
          leftColor="#3300ff"
          rightColor="#ffee00"
          intensity={0.5}
          radius={1}
        />
      </ChromaticAberration>

      {/* ASCII characters trailing the cursor, layered on top of the background */}
      <Ascii characters="@#*+=-:." cellSize={16} fontFamily="JetBrains" alphaThreshold={0.05}>
        <CursorTrail
          colorA={isDark ? '#141414' : '#e5e5e5'}
          colorB={isDark ? '#ffffff' : '#141414'}
          radius={0.2}
          length={0.5}
          shrink={0.5}
        />
      </Ascii>
    </Shader>
  )
}
