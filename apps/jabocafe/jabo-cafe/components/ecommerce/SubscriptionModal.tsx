'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coffee, Package, Calendar, Gift, CheckCircle } from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')
  const [quantity, setQuantity] = useState(1)
  
  const prices = {
    weekly: 40.50, // 10% discount
    biweekly: 42.75, // 5% discount  
    monthly: 40.50 // 10% discount
  }
  
  const savings = {
    weekly: '10%',
    biweekly: '5%',
    monthly: '10%'
  }
  
  const handleSubscribe = () => {
    const message = `Olá! Quero assinar o Café Jabô:\n📦 ${quantity} pacote(s)\n📅 Entrega ${frequency === 'weekly' ? 'semanal' : frequency === 'biweekly' ? 'quinzenal' : 'mensal'}\n💰 R$ ${(prices[frequency] * quantity).toFixed(2)} por entrega`
    const whatsappUrl = `https://wa.me/5511984153337?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-coffee-700 to-coffee-900 text-white p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Coffee className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Assinatura Jabô</h2>
                  <p className="text-coffee-200">Nunca fique sem seu café especial</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Gift className="w-8 h-8 text-coffee-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-coffee-900">Até 10% OFF</p>
                  <p className="text-xs text-coffee-600">Em todas entregas</p>
                </div>
                <div className="text-center">
                  <Package className="w-8 h-8 text-coffee-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-coffee-900">Frete Grátis</p>
                  <p className="text-xs text-coffee-600">Sempre incluso</p>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-coffee-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-coffee-900">Flexível</p>
                  <p className="text-xs text-coffee-600">Pause quando quiser</p>
                </div>
              </div>
              
              {/* Frequency Selection */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  Frequência de entrega:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'weekly', label: 'Semanal', desc: 'Para grandes apreciadores' },
                    { value: 'biweekly', label: 'Quinzenal', desc: 'Consumo moderado' },
                    { value: 'monthly', label: 'Mensal', desc: 'Ideal para começar' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFrequency(option.value as 'weekly' | 'biweekly' | 'monthly')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        frequency === option.value
                          ? 'border-coffee-600 bg-coffee-50'
                          : 'border-gray-200 hover:border-coffee-300'
                      }`}
                    >
                      <p className="font-medium text-coffee-900">{option.label}</p>
                      <p className="text-xs text-coffee-600 mt-1">{option.desc}</p>
                      <p className="text-sm font-bold text-green-600 mt-2">
                        -{savings[option.value as keyof typeof savings]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  Quantidade por entrega:
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-coffee-300 text-coffee-600 hover:bg-coffee-50"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-coffee-900 w-20 text-center">
                    {quantity} {quantity === 1 ? 'pacote' : 'pacotes'}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-coffee-300 text-coffee-600 hover:bg-coffee-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-coffee-700">Preço por entrega:</span>
                  <div className="text-right">
                    <span className="text-sm text-coffee-500 line-through">
                      R$ {(45 * quantity).toFixed(2)}
                    </span>
                    <span className="text-xl font-bold text-coffee-900 ml-2">
                      R$ {(prices[frequency] * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  Você economiza R$ {((45 - prices[frequency]) * quantity).toFixed(2)} por entrega!
                </p>
              </div>
              
              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-medium text-lg flex items-center justify-center space-x-2 hover:shadow-xl transition-shadow"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Assinar via WhatsApp</span>
              </motion.button>
              
              <p className="text-xs text-center text-coffee-600">
                Cancele ou pause a qualquer momento • Sem taxas ocultas • Garantia de satisfação
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}