'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  opacity: number
  size: number
}

export function CoffeeSteam({ 
  active = true, 
  scrollVelocity = 0,
  originX = 50,
  originY = 80
}: { 
  active?: boolean
  scrollVelocity?: number
  originX?: number
  originY?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  
  useEffect(() => {
    if (!active || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const createParticle = (): Particle => ({
      x: (originX / 100) * canvas.width + (Math.random() - 0.5) * 20,
      y: (originY / 100) * canvas.height,
      vx: (Math.random() - 0.5) * 0.5 + scrollVelocity * 0.01,
      vy: -Math.random() * 1.5 - 0.5,
      life: 1,
      opacity: 0,
      size: Math.random() * 15 + 5
    })
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Add new particles
      if (Math.random() < 0.3) {
        particles.current.push(createParticle())
      }
      
      // Update and draw particles
      particles.current = particles.current.filter(particle => {
        particle.x += particle.vx + Math.sin(particle.life * 5) * 0.3
        particle.y += particle.vy
        particle.life -= 0.008
        
        // Fade in and out
        if (particle.life > 0.7) {
          particle.opacity = (1 - particle.life) * 3
        } else {
          particle.opacity = particle.life
        }
        
        // Wind effect
        particle.vx += (Math.random() - 0.5) * 0.02
        
        // Draw particle as steam
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.3})`)
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${particle.opacity * 0.2})`)
        gradient.addColorStop(1, `rgba(150, 150, 150, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        return particle.life > 0
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, scrollVelocity, originX, originY])
  
  return (
    <AnimatePresence>
      {active && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
    </AnimatePresence>
  )
}