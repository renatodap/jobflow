'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  kenBurns?: boolean
  parallax?: boolean
  blurDataURL?: string
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  priority = false,
  quality = 90,
  sizes,
  fill = false,
  width,
  height,
  kenBurns = false,
  parallax = false,
  blurDataURL
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority)
  const { ref, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.01,
    rootMargin: '100px'
  })
  
  useEffect(() => {
    if (hasIntersected && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [hasIntersected, shouldLoad])
  
  const imageProps = fill 
    ? { fill: true }
    : { width: width || 1920, height: height || 1080 }
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-coffee-100 to-coffee-200"
            style={{
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
        )}
      </AnimatePresence>
      
      {shouldLoad && (
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.02
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`${fill ? 'absolute inset-0' : 'relative'} ${kenBurns ? 'ken-burns' : ''}`}
        >
          <Image
            {...imageProps}
            src={src}
            alt={alt}
            quality={quality}
            sizes={sizes}
            priority={priority}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            onLoad={() => setIsLoaded(true)}
            className={`${fill ? 'object-cover' : ''} ${parallax ? 'will-change-transform' : ''}`}
          />
        </motion.div>
      )}
      
      <style jsx>{`
        .ken-burns {
          animation: kenBurns 20s infinite alternate;
        }
        
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(-2%, -2%);
          }
        }
      `}</style>
    </div>
  )
}