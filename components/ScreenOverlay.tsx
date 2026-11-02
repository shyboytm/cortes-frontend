'use client'

import dynamic from 'next/dynamic'
import { useShaderEligible } from '@/lib/hooks/useShaderEligible'

const ScreenOverlayCanvas = dynamic(() => import('@/components/ScreenOverlayCanvas'), { ssr: false })

export default function ScreenOverlay() {
  const eligible = useShaderEligible()

  if (!eligible) return null

  return <ScreenOverlayCanvas />
}
