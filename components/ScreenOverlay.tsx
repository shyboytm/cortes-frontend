'use client'

import { useEffect, useState } from 'react'
import { Shader, SolidColor, FilmGrain, CRTScreen, Bulge } from 'shaders/react'

export default function ScreenOverlay() {

  return (
    <Shader className="fixed inset-0 z-50 w-screen h-screen pointer-events-none opacity-[0.2]">
      {/* Bulge curves the grain/scanline/vignette texture outward slightly,
          like an old CRT tube, at a low strength for a subtle warp. */}
      <Bulge strength={0.12} radius={1.2} falloff={0.6} edges="stretch">
        <SolidColor color="#000000" />

        <FilmGrain strength={1} bias={2} animated />

        <CRTScreen
          pixelSize={256}
          colorShift={0.8}
          scanlineIntensity={0.7}
          scanlineFrequency={350}
          brightness={0.9}
          contrast={1}
          vignetteIntensity={1}
          vignetteRadius={1}
        />
      </Bulge>
    </Shader>
  )
}
