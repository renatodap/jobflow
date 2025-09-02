'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, Translations, getTranslations } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')
  const [translations, setTranslations] = useState<Translations>(getTranslations('pt'))
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check for saved language preference
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language
      if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
        setLanguageState(savedLang)
        setTranslations(getTranslations(savedLang))
      } else {
        // Detect browser language
        const browserLang = navigator.language.toLowerCase()
        const detectedLang: Language = browserLang.startsWith('pt') ? 'pt' : 'en'
        setLanguageState(detectedLang)
        setTranslations(getTranslations(detectedLang))
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setTranslations(getTranslations(lang))
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
      // Update HTML lang attribute
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return default values during SSR or when context is not available
    return {
      language: 'pt' as Language,
      setLanguage: () => {},
      t: getTranslations('pt')
    }
  }
  return context
}