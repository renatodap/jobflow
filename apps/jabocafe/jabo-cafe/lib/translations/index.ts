import { pt } from './pt'
import { en } from './en'

export type Language = 'pt' | 'en'
export type Translations = typeof pt

export const translations = {
  pt,
  en,
} as const

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}