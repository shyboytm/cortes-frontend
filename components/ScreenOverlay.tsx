'use client'

import { useEffect, useState } from 'react'
import { Shader, SolidColor, FilmGrain, CRTScreen } from 'shaders/react'

export default function ScreenOverlay() {

  return (
    <Shader className="fixed inset-0 z-50 w-screen h-screen pointer-events-none opacity-[0.2]">
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
    </Shader>
  )
}
