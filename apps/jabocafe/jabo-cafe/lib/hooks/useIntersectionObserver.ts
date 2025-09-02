import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true
  } = options
  
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element || (triggerOnce && hasIntersected)) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const intersecting = entry.isIntersecting
          setIsIntersecting(intersecting)
          
          if (intersecting && !hasIntersected) {
            setHasIntersected(true)
          }
        })
      },
      { threshold, root, rootMargin }
    )
    
    observer.observe(element)
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, root, rootMargin, triggerOnce, hasIntersected])
  
  return { ref, isIntersecting, hasIntersected: triggerOnce ? hasIntersected : isIntersecting }
}