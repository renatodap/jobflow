'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ProgressiveImage } from './ProgressiveImage'
import { CoffeeSteam } from '../ambient/CoffeeSteam'
import { useParallax } from '@/lib/hooks/useParallax'
import { useLanguage } from '@/contexts/LanguageContext'

export function HeroSection() {
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { scrollY } = useScroll()
  const { opacity } = useParallax(100)
  const { t } = useLanguage()
  
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.2])
  const textY = useTransform(scrollY, [0, 300], [0, -50])
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const velocity = currentScrollY - lastScrollY
      setScrollVelocity(velocity)
      setLastScrollY(currentScrollY)
      
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setScrollVelocity(0), 150)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [lastScrollY])
  
  return (
    <motion.section 
      className="relative h-screen w-full overflow-hidden"
      style={{ opacity: heroOpacity }}
    >
      {/* Hero Image with Ken Burns effect */}
      <motion.div 
        className="absolute inset-0"
        style={{ scale: heroScale }}
      >
        <ProgressiveImage
          src="/images/IMAGE_hero_people_fazenda.webp"
          alt="Família na Fazenda Jaboticabeiras"
          fill
          priority
          kenBurns
          quality={95}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/30 to-transparent" />
      </motion.div>
      
      {/* Coffee Steam Animation */}
      <CoffeeSteam 
        active={true} 
        scrollVelocity={scrollVelocity}
        originX={50}
        originY={70}
      />
      
      {/* Hero Content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Subtitle */}
          <motion.p 
            className="text-xs md:text-sm tracking-[0.3em] uppercase mb-6 font-light"
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.3em' }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            {t.hero.since} • {t.hero.location}
          </motion.p>
          
          {/* Logo Image */}
          <motion.div
            className="relative w-64 md:w-96 h-32 md:h-48 mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <ProgressiveImage
              src="/images/IMAGE_jabo_logo.png"
              alt="Jabô Café Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
          
          {/* Video Section */}
          <motion.div
            className="relative w-full max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative aspect-video bg-black/20">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/jabo-cafe-intro.mp4" type="video/mp4" />
                <source src="/videos/jabo-cafe-intro.webm" type="video/webm" />
                {/* Fallback for browsers that don't support video */}
                Seu navegador não suporta vídeos HTML5.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>
          
          {/* Tagline */}
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {t.hero.tagline}
            <br />{t.hero.taglinePart2}
          </motion.p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          style={{ opacity }}
        >
          <motion.div 
            className="w-6 h-10 border border-white/40 rounded-full flex justify-center cursor-pointer hover:border-white/60 transition-colors"
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div 
              className="w-0.5 h-3 bg-white/60 rounded-full mt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}