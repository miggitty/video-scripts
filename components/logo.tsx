'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/theme-context'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 200, height = 60, className = "h-auto" }: LogoProps) {
  const { theme } = useTheme()
  
  // Use dark logo for light theme (better visibility on light background)
  // Use light logo for dark theme (better visibility on dark background)
  const logoSrc = theme === 'light' 
    ? '/transformo logo dark.png' 
    : '/transformo logo light.png'
  
  return (
    <Image
      src={logoSrc}
      alt="Transformo Logo"
      width={width}
      height={height}
      className={className}
    />
  )
}