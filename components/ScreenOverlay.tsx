'use client'

import { Shader, SolidColor, FilmGrain, CRTScreen, Bulge } from 'shaders/react'
import { useIsDark } from '@/lib/hooks/useIsDark'

// Site-wide film grain + CRT scanline/vignette overlay, layered above every
// page at low opacity. Theme-aware like GlobalShaders: the base color (and
// the CRT effect's color-shift/scanline strength) flip for light mode. This
// overlay used to always composite over a solid black base regardless of
// theme — invisible-ish blended with dark mode's own dark background, but
// on light mode that same animated grain/scanline noise was swinging a
// black layer's opacity over a white page every frame, which read as
// random flashing/glitching. Tuned down instead of just flipped, since a
// CRT-tube look reads correctly dark but gets harsh at full strength on white.
export default function ScreenOverlay() {
  const isDark = useIsDark()

  return (
    <Shader className="fixed inset-0 z-50 w-screen h-screen pointer-events-none opacity-[0.2]">
      {/* Bulge curves the grain/scanline/vignette texture outward slightly,
          like an old CRT tube, at a low strength for a subtle warp. */}
      <Bulge strength={0.12} radius={1.2} falloff={0.6} edges="stretch">
        <SolidColor color={isDark ? '#000000' : '#ffffff'} />

        <FilmGrain strength={1} bias={2} animated />

        <CRTScreen
          pixelSize={256}
          colorShift={isDark ? 0.8 : 0.3}
          scanlineIntensity={isDark ? 0.7 : 0.35}
          scanlineFrequency={350}
          brightness={0.9}
          contrast={1}
          vignetteIntensity={isDark ? 1 : 0.5}
          vignetteRadius={1}
        />
      </Bulge>
    </Shader>
  )
}
