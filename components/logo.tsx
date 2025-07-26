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
  
  const handleLogoClick = () => {
    window.open('https://transformo.io', '_blank', 'noopener,noreferrer')
  }
  
  return (
    <button
      onClick={handleLogoClick}
      className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
      aria-label="Visit Transformo.io"
    >
      <Image
        src={logoSrc}
        alt="Transformo Logo"
        width={width}
        height={height}
        className={className}
      />
    </button>
  )
}