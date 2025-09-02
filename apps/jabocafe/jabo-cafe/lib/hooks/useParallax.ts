import { useEffect, useState } from 'react'
import { useMotionValue, useTransform } from 'framer-motion'

export function useParallax(offset = 50) {
  const [scrollY, setScrollY] = useState(0)
  const motionScrollY = useMotionValue(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      motionScrollY.set(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [motionScrollY])
  
  const y = useTransform(motionScrollY, [0, 1000], [0, offset])
  const opacity = useTransform(motionScrollY, [0, 300], [1, 0])
  const scale = useTransform(motionScrollY, [0, 500], [1, 1.1])
  
  return { scrollY, y, opacity, scale }
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const calculateProgress = () => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }
    
    window.addEventListener('scroll', calculateProgress, { passive: true })
    calculateProgress()
    
    return () => window.removeEventListener('scroll', calculateProgress)
  }, [])
  
  return progress
}