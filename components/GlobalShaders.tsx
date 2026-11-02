'use client'

import dynamic from 'next/dynamic'
import { useShaderEligible } from '@/lib/hooks/useShaderEligible'

const GlobalShaderCanvas = dynamic(() => import('@/components/GlobalShaderCanvas'), { ssr: false })

export default function GlobalShader() {
  const eligible = useShaderEligible()

  if (!eligible) return null

  return <GlobalShaderCanvas />
}
