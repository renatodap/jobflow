'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, MapPin } from 'lucide-react'

const recentPurchases = [
  { name: 'Maria S.', location: 'São Paulo, SP', time: '2 minutos atrás' },
  { name: 'João P.', location: 'Rio de Janeiro, RJ', time: '5 minutos atrás' },
  { name: 'Ana C.', location: 'Belo Horizonte, MG', time: '8 minutos atrás' },
  { name: 'Carlos M.', location: 'Curitiba, PR', time: '12 minutos atrás' },
  { name: 'Beatriz L.', location: 'Porto Alegre, RS', time: '15 minutos atrás' },
  { name: 'Roberto F.', location: 'Brasília, DF', time: '18 minutos atrás' },
  { name: 'Juliana R.', location: 'Salvador, BA', time: '22 minutos atrás' },
  { name: 'Pedro A.', location: 'Fortaleza, CE', time: '25 minutos atrás' }
]

export function PurchaseNotification() {
  const [currentPurchase, setCurrentPurchase] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 5000)
    
    // Cycle through purchases
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentPurchase((prev) => (prev + 1) % recentPurchases.length)
        setIsVisible(true)
      }, 500)
      
      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 4000)
    }, 15000) // Show every 15 seconds
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])
  
  const purchase = recentPurchases[currentPurchase]
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100, y: 0 }}
          className="fixed bottom-8 left-8 bg-white rounded-xl shadow-2xl p-4 z-40 max-w-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-coffee-900">
                {purchase.name} comprou Café Jabô
              </p>
              <div className="flex items-center text-sm text-coffee-600 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{purchase.location}</span>
                <span className="mx-2">•</span>
                <span>{purchase.time}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}