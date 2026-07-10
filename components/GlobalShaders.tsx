'use client'

import { useEffect, useState } from 'react'
import { Shader, ChromaFlow, DOMTexture, CursorTrail, Ascii } from 'shaders/react'

function useIsDark() {
  const [isDark, setIsDark] = useState(true) // match your default look

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsDark(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isDark
}

export default function GlobalShader() {

    const isDark = useIsDark()

  const theme = isDark
    ? { base: '#000000', ink: '#ffffff' }
    : { base: '#ffffff', ink: '#000000' }

  return (
      <Shader className="w-full h-auto absolute inset-0 z-0 pointer-events-none">
        <ChromaFlow
          baseColor="#000000"
          upColor="#00ffff"
          downColor="#ff00ff"
          leftColor="#3300ff"
          rightColor="#ffee00"
          intensity={1}
          radius={1}
        />

      </Shader>
  )
}