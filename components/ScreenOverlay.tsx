'use client'

import { Shader, SolidColor, FilmGrain, CRTScreen } from 'shaders/react'
import { useIsDark } from '@/lib/hooks/useIsDark'
import { useIsTabVisible } from '@/lib/hooks/useIsTabVisible'

// Site-wide film grain + CRT scanline overlay, layered above every page at
// low opacity. Theme-aware like GlobalShaders: the base color (and
// the CRT effect's color-shift/scanline strength) flip for light mode. This
// overlay used to always composite over a solid black base regardless of
// theme — invisible-ish blended with dark mode's own dark background, but
// on light mode that same animated grain/scanline noise was swinging a
// black layer's opacity over a white page every frame, which read as
// random flashing/glitching. Tuned down instead of just flipped, since a
// CRT-tube look reads correctly dark but gets harsh at full strength on white.
//
// Also a permanently-mounted, GPU-backed canvas like GlobalShaders, so it's
// unmounted whenever the tab isn't visible rather than left rendering in
// the background indefinitely.
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
