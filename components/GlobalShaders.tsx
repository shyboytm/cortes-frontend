'use client'

import { Shader, ChromaFlow, ChromaticAberration, Ascii, CursorTrail } from 'shaders/react'
import { useIsDark } from '@/lib/hooks/useIsDark'
import { useIsTabVisible } from '@/lib/hooks/useIsTabVisible'

export default function GlobalShader() {
  const isDark = useIsDark()
  const isTabVisible = useIsTabVisible()

  if (!isTabVisible) return null

  return (
    <Shader
      className="fixed inset-0 z-0 w-screen h-screen pointer-events-none opacity-80"
      disableTelemetry
    >
      <ChromaticAberration strength={0} angle={45}>
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
