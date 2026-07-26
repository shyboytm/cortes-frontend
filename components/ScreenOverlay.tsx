'use client'

import { Shader, SolidColor, FilmGrain, CRTScreen } from 'shaders/react'
import { useIsDark } from '@/lib/hooks/useIsDark'
import { useIsTabVisible } from '@/lib/hooks/useIsTabVisible'

export default function ScreenOverlay() {
  const isDark = useIsDark()
  const isTabVisible = useIsTabVisible()

  if (!isTabVisible) return null

  return (
    <Shader
      className="fixed inset-0 z-50 w-screen h-screen pointer-events-none opacity-[0.2]"
      disableTelemetry
    >
      <SolidColor color={isDark ? '#000000' : '#ffffff'} />

      <FilmGrain strength={1} bias={2} animated />

      <CRTScreen
        pixelSize={50}
        colorShift={0}
        scanlineIntensity={isDark ? 0.7 : 0.35}
        scanlineFrequency={350}
        brightness={1}
        contrast={1}
        vignetteIntensity={1}
      />
    </Shader>
  )
}
