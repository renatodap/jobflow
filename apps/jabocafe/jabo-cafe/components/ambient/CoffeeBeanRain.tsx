'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Bean {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  duration: number
}

export function CoffeeBeanRain() {
  const [isActive, setIsActive] = useState(false)
  const [beans, setBeans] = useState<Bean[]>([])
  const [typedSequence, setTypedSequence] = useState('')
  
  const triggerRain = useCallback(() => {
    setIsActive(true)
    
    // Generate beans
    const newBeans: Bean[] = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      duration: 3 + Math.random() * 2
    }))
    
    setBeans(newBeans)
    
    // Auto-hide after animation
    setTimeout(() => {
      setIsActive(false)
      setBeans([])
    }, 6000)
  }, [])
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const newSequence = typedSequence + key
      
      // Check if "jabo" was typed
      if ('jabo'.startsWith(newSequence)) {
        setTypedSequence(newSequence)
        
        if (newSequence === 'jabo') {
          triggerRain()
          setTypedSequence('')
        }
      } else {
        setTypedSequence(key === 'j' ? 'j' : '')
      }
    }
    
    window.addEventListener('keypress', handleKeyPress)
    
    // Reset sequence after 2 seconds of no typing
    const resetTimeout = setTimeout(() => {
      if (typedSequence) setTypedSequence('')
    }, 2000)
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      clearTimeout(resetTimeout)
    }
  }, [typedSequence, triggerRain])
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
        >
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-coffee-700 to-coffee-900 text-white px-8 py-4 rounded-full shadow-2xl"
          >
            <p className="text-lg font-medium">☕ Você descobriu o segredo do Jabô! ☕</p>
          </motion.div>
          
          {/* Coffee Beans */}
          {beans.map((bean) => (
            <motion.div
              key={bean.id}
              className="absolute text-4xl"
              initial={{
                x: `${bean.x}vw`,
                y: `${bean.y}vh`,
                rotate: bean.rotation,
                scale: 0
              }}
              animate={{
                x: `${bean.x}vw`,
                y: '110vh',
                rotate: bean.rotation + 360,
                scale: bean.scale
              }}
              transition={{
                duration: bean.duration,
                ease: 'easeIn'
              }}
              style={{
                left: 0,
                top: 0,
                transform: `translateX(${bean.x}vw)`
              }}
            >
              ☕
            </motion.div>
          ))}
          
          {/* Particle Effects */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <radialGradient id="beanGlow">
                <stop offset="0%" stopColor="rgba(139, 69, 19, 0.8)" />
                <stop offset="100%" stopColor="rgba(139, 69, 19, 0)" />
              </radialGradient>
            </defs>
            {beans.map((bean) => (
              <motion.circle
                key={`glow-${bean.id}`}
                cx={`${bean.x}%`}
                initial={{ cy: '-5%', r: 0, opacity: 0 }}
                animate={{ 
                  cy: '105%', 
                  r: 20, 
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: bean.duration,
                  ease: 'easeIn'
                }}
                fill="url(#beanGlow)"
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}