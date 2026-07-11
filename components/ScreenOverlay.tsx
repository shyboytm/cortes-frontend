'use client'

import { useEffect, useState } from 'react'
import { Shader, SolidColor, FilmGrain, CRTScreen } from 'shaders/react'

export default function ScreenOverlay() {

  return (
    <Shader className="fixed inset-0 z-50 w-screen h-screen pointer-events-none opacity-[0.2]">
        <SolidColor color="#000000" />

        {/* Animated film grain, riding on top of the solid base */}
        <FilmGrain strength={0.9} bias={2} animated />

        {/* CRT scanlines, slight color fringing, and a vignette */}
        <CRTScreen
          pixelSize={256}
          colorShift={0.8}
          scanlineIntensity={0.5}
          scanlineFrequency={220}
          brightness={1}
          contrast={1}
          vignetteIntensity={0.5}
          vignetteRadius={0.6}
        />
    </Shader>
  )
}
