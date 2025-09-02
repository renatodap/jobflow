'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function MorningMist() {
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = window.innerHeight
      const progress = Math.min(scrollY / maxScroll, 1)
      setScrollProgress(progress)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <>
      <motion.div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(ellipse at center top, 
            rgba(255, 255, 255, ${0.6 - scrollProgress * 0.6}) 0%,
            rgba(255, 255, 255, ${0.3 - scrollProgress * 0.3}) 40%,
            transparent 100%)`,
          filter: `blur(${20 - scrollProgress * 20}px)`,
          opacity: 1 - scrollProgress
        }}
      />
      
      <svg className="fixed inset-0 pointer-events-none z-40" style={{ opacity: 1 - scrollProgress }}>
        <defs>
          <filter id="mist">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.01" 
              numOctaves="2" 
              result="turbulence"
            />
            <feColorMatrix in="turbulence" type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.1 0.1 0.2 0.2 0.3 0.2 0.1 0"/>
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="10"/>
            <feBlend mode="screen"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#mist)" opacity={0.4 - scrollProgress * 0.4}/>
      </svg>
    </>
  )
}