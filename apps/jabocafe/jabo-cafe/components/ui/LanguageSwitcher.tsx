'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <motion.div 
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-1"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Globe className="w-4 h-4 text-coffee-600 ml-2" />
      <button
        onClick={() => setLanguage('pt')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          language === 'pt'
            ? 'bg-coffee-700 text-white'
            : 'text-coffee-700 hover:bg-coffee-100'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-coffee-700 text-white'
            : 'text-coffee-700 hover:bg-coffee-100'
        }`}
      >
        EN
      </button>
    </motion.div>
  )
}