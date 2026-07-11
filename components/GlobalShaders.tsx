'use client'

import { useEffect, useState } from 'react'
import { Shader, ChromaFlow, ChromaticAberration, Ascii, CursorTrail } from 'shaders/react'

function useIsDark() {
  const [isDark, setIsDark] = useState(true) // match the default look before the listener attaches

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsDark(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isDark
}

// Site-wide ambient background: the original ChromaFlow wash, nested inside
// ChromaticAberration for a bit of RGB-fringed liquid-color-split character
// (per the shaders.com docs pattern of <Effect><Generator /></Effect>),
// plus an Ascii-ified cursor trail layered on top so ASCII characters
// follow the cursor around the site. Colors for both switch with the
// user's OS-level light/dark preference so neither washes out against
// the page background.
//
// `fixed` (not `absolute`) is what makes this cover the whole page: with
// no positioned ancestor, `absolute inset-0` sizes against the initial
// containing block, which is exactly one viewport tall — so on any page
// taller than the screen, the effect stopped at the fold. `fixed` pins it
// to the viewport itself, which always covers what's currently visible.
export default function GlobalShader() {
  const isDark = useIsDark()

  return (
    <Shader className="fixed inset-0 z-0 w-screen h-screen pointer-events-none opacity-80">
      <ChromaticAberration strength={0.6} angle={45}>
        {/* <ChromaFlow
          baseColor={isDark ? '#000000' : '#ffffff'}
          upColor="#00ffff"
          downColor="#ff00ff"
          leftColor="#3300ff"
          rightColor="#ffee00"
          intensity={1}
          radius={1}
        /> */}
      </ChromaticAberration>

      {/* ASCII characters trailing the cursor, layered on top of the background */}
      <Ascii characters="@#*+=-:." cellSize={16} fontFamily="JetBrains" alphaThreshold={0.05}>
        <CursorTrail
          colorA={isDark ? '#141414' : '#e5e5e5'}
          colorB={isDark ? '#ffffff' : '#141414'}
          radius={0.2}
          length={0.25}
          shrink={0.5}
        />
      </Ascii>
    </Shader>
  )
}
