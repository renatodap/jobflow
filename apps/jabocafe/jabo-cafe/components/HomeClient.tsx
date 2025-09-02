'use client'

import { useEffect, useState } from 'react'
import { SubscriptionModal } from '@/components/ecommerce/SubscriptionModal'
import { PurchaseNotification } from '@/components/ecommerce/PurchaseNotification'
import { HeroSection } from '@/components/storytelling/HeroSection'
import { CoffeeJourney } from '@/components/interactive/CoffeeJourney'
import { EmployeeSpotlight } from '@/components/storytelling/EmployeeSpotlight'
import { MorningMist } from '@/components/ambient/MorningMist'
import { CoffeeBeanRain } from '@/components/ambient/CoffeeBeanRain'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { motion } from 'framer-motion'
import { ProgressiveImage } from '@/components/storytelling/ProgressiveImage'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import { Coffee, Leaf, Heart, Award, ArrowRight, ShoppingCart, Package, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function HomeClient() {
  const [isDayMode, setIsDayMode] = useState(true)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const { t } = useLanguage()
  
  // Time-based theme
  useEffect(() => {
    const hour = new Date().getHours()
    setIsDayMode(hour >= 6 && hour < 18)
  }, [])
  
  return (
    <div className={`min-h-screen ${isDayMode ? 'bg-cream' : 'bg-coffee-900'} transition-colors duration-1000`}>
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Ambient Effects */}
      <MorningMist />
      <CoffeeBeanRain />
      
      {/* Social Proof Notifications */}
      <PurchaseNotification />
      
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      {/* Grain Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Quick Purchase CTA - Premium placement */}
      <section className="py-12 bg-gradient-to-r from-coffee-800 to-coffee-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">{t.quickPurchase.title}</h3>
              <p className="text-coffee-200">{t.quickPurchase.subtitle}</p>
            </div>
            <div className="flex gap-4">
              <motion.a
                href="#produtos"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-coffee-900 px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:shadow-xl transition-shadow"
              >
                <ShoppingCart className="w-5 h-5" />
                {t.quickPurchase.buyNow}
              </motion.a>
              <motion.a
                href="https://wa.me/5511984153337?text=Olá! Gostaria de saber mais sobre o Café Jabô Especial"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                {t.quickPurchase.whatsapp}
              </motion.a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Introduction */}
      <section className="py-20 bg-gradient-to-b from-white to-cream relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <ProductShowcase />
        </div>
      </section>
      
      {/* Coffee Journey */}
      <CoffeeJourney />
      
      {/* History Section */}
      <section className="py-20 bg-gradient-to-b from-cream to-white">
        <HistorySection />
      </section>
      
      {/* Product Section */}
      <ProductSection onOpenSubscription={() => setShowSubscriptionModal(true)} />
      
      {/* Employee Spotlight */}
      <EmployeeSpotlight />
      
      {/* Sustainability Section */}
      <SustainabilitySection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Contact CTA */}
      <ContactSection />
    </div>
  )
}

function ProductShowcase() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.3 })
  const { t } = useLanguage()
  
  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <p className="text-coffee-700 uppercase tracking-wider text-sm mb-4 font-semibold">
          {t.productShowcase.subtitle}
        </p>
        <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
          {t.productShowcase.title}
        </h2>
        <p className="text-lg text-coffee-800 mb-8 leading-relaxed font-medium">
          {t.productShowcase.description}
        </p>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="flex items-start space-x-3">
            <Coffee className="w-6 h-6 text-coffee-600 mt-1" />
            <div>
              <h4 className="font-semibold text-coffee-900">{t.productShowcase.arabica}</h4>
              <p className="text-sm text-coffee-600">{t.productShowcase.arabicaDesc}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Leaf className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h4 className="font-semibold text-coffee-900">{t.productShowcase.sustainable}</h4>
              <p className="text-sm text-coffee-600">{t.productShowcase.sustainableDesc}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Heart className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h4 className="font-semibold text-coffee-900">{t.productShowcase.artisanal}</h4>
              <p className="text-sm text-coffee-600">{t.productShowcase.artisanalDesc}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold text-coffee-900">{t.productShowcase.awarded}</h4>
              <p className="text-sm text-coffee-600">{t.productShowcase.awardedDesc}</p>
            </div>
          </div>
        </div>
        
        <motion.a
          href="#produtos"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-coffee-700 to-coffee-900 text-white px-8 py-4 rounded-full font-medium inline-flex items-center space-x-2 hover:shadow-xl transition-shadow"
        >
          <span>{t.productShowcase.knowOurCoffee}</span>
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <ProgressiveImage
            src="/images/IMAGE_SECAGEM.webp"
            alt="Processo de secagem do café"
            fill
            className="h-full"
            kenBurns
          />
        </div>
      </motion.div>
    </div>
  )
}

function HistorySection() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const { t } = useLanguage()
  
  return (
    <div ref={ref} className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <p className="text-coffee-600 uppercase tracking-wider text-sm mb-4">
          {t.history.subtitle}
        </p>
        <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
          {t.history.title}
        </h2>
      </motion.div>
      
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <ProgressiveImage
                src="/images/IMAGE_history(oldpic).webp"
                alt="História da Fazenda Jaboticabeiras"
                fill
                className="h-full sepia-[0.3]"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {t.history.timeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-coffee-600 to-coffee-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-coffee-900">{item.title}</h3>
                    <p className="text-coffee-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SustainabilitySection() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const { t } = useLanguage()
  
  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-cream">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-coffee-600 uppercase tracking-wider text-sm mb-4">
            {t.sustainability.subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
            {t.sustainability.title}
          </h2>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            {t.sustainability.description}
          </p>
        </motion.div>
        
        {/* Impact Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-lg text-center"
          >
            <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-coffee-900 mb-2">{t.sustainability.carbonNegative}</h3>
            <p className="text-coffee-600">{t.sustainability.carbonNegativeDesc}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg text-center"
          >
            <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>
            <h3 className="text-xl font-semibold text-coffee-900 mb-2">{t.sustainability.waterPreserved}</h3>
            <p className="text-coffee-600">{t.sustainability.waterPreservedDesc}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg text-center"
          >
            <Heart className="w-12 h-12 text-coffee-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-coffee-900 mb-2">{t.sustainability.biodiversity}</h3>
            <p className="text-coffee-600">{t.sustainability.biodiversityDesc}</p>
          </motion.div>
        </div>
        
        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={hasIntersected ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-coffee-900 mb-6">
            {t.sustainability.certifications}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {t.sustainability.certs.map((cert, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg px-6 py-3 shadow-md border border-coffee-200"
              >
                <p className="text-coffee-800 font-medium">{cert}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const { t, language } = useLanguage()
  
  const testimonials = [
    {
      text: language === 'pt' 
        ? "Ter experimentado o Café Jabô foi uma sensação de nostalgia com emoções. Um café frutado, leve, muito saboroso e que traz consigo tanta história, selos e cuidado que é impossível tomar com pressa ou tomar sem sentir alguma coisa. Parabéns à família produtora e à fazenda Jaboticabeiras por terem criado esse patrimônio brasileiro."
        : "Experiencing Jabô Coffee was a feeling of nostalgia with emotions. A fruity, light, very tasty coffee that carries so much history, seals and care that it's impossible to drink in a hurry or drink without feeling something. Congratulations to the producing family and Fazenda Jaboticabeiras for creating this Brazilian heritage.",
      author: "Barbara Grings",
      role: t.testimonials.customer,
      rating: 5
    },
    {
      text: language === 'pt'
        ? "Perfeito! Obrigada!!!! Delicioso!"
        : "Perfect! Thank you!!!! Delicious!",
      author: "Isabella Salton",
      role: t.testimonials.customer,
      rating: 5
    }
  ]
  
  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-cream to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-coffee-600 uppercase tracking-wider text-sm mb-4">
            {t.testimonials.subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
            {t.testimonials.title}
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={hasIntersected ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-coffee-100"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-coffee-700 mb-6 italic leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="border-t border-coffee-100 pt-4">
                <p className="font-semibold text-coffee-900">{testimonial.author}</p>
                <p className="text-coffee-600 text-sm">{testimonial.role} {t.testimonials.verified}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductSection({ onOpenSubscription }: { onOpenSubscription: () => void }) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const [selectedType, setSelectedType] = useState<'graos' | 'moido'>('graos')
  const [quantity, setQuantity] = useState(1)
  const [showCart, setShowCart] = useState(false)
  const { t, language } = useLanguage()
  
  const basePrice = 45.00
  const totalPrice = basePrice * quantity
  
  const handleAddToCart = () => {
    setShowCart(true)
    setTimeout(() => setShowCart(false), 3000)
  }
  
  const handleWhatsAppOrder = () => {
    const typeText = selectedType === 'graos' ? t.product.beans : t.product.ground
    const message = language === 'pt'
      ? `Olá! Gostaria de comprar ${quantity} ${quantity > 1 ? t.product.units : t.product.unit} de Café Jabô Especial (${typeText}) - Total: ${t.product.price} ${totalPrice.toFixed(2)}`
      : `Hello! I would like to buy ${quantity} ${quantity > 1 ? t.product.units : t.product.unit} of Jabô Special Coffee (${typeText}) - Total: ${t.product.price} ${totalPrice.toFixed(2)}`
    const whatsappUrl = `https://wa.me/5511984153337?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  return (
    <section ref={ref} id="produtos" className="py-20 bg-gradient-to-b from-white to-cream">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-coffee-600 uppercase tracking-wider text-sm mb-4">
            {t.product.subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
            {t.product.title}
          </h2>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            {t.product.description}
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Product Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <ProgressiveImage
                src="/images/nature-package.png"
                alt="Café Jabô Especial - Embalagem Premium"
                fill
                className="h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                {t.product.limitedLot}
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-coffee-900 font-bold">{t.product.premium}</p>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <Package className="w-8 h-8 text-coffee-600 mx-auto mb-2" />
                <p className="text-xs text-coffee-700 font-medium">{t.product.freeShipping}</p>
                <p className="text-xs text-coffee-500">{t.product.freeShippingDesc}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-coffee-700 font-medium">{t.product.guarantee}</p>
                <p className="text-xs text-coffee-500">{t.product.guaranteeDesc}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <Coffee className="w-8 h-8 text-coffee-600 mx-auto mb-2" />
                <p className="text-xs text-coffee-700 font-medium">{t.product.roasted}</p>
                <p className="text-xs text-coffee-500">{t.product.roastedDesc}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Product Details & Purchase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={hasIntersected ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Price */}
            <div>
              <p className="text-3xl font-bold text-coffee-900 mb-2">
                {t.product.price} {totalPrice.toFixed(2)}
              </p>
              <p className="text-coffee-600">250g - {quantity} {quantity > 1 ? t.product.units : t.product.unit}</p>
            </div>
            
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                {t.product.chooseType}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedType('graos')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedType === 'graos'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                      : 'border-gray-200 text-coffee-600 hover:border-coffee-300'
                  }`}
                >
                  <Coffee className="w-5 h-5 mx-auto mb-1" />
                  <span className="block font-medium">{t.product.beans}</span>
                  <span className="text-xs">{t.product.beansDesc}</span>
                </button>
                <button
                  onClick={() => setSelectedType('moido')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedType === 'moido'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                      : 'border-gray-200 text-coffee-600 hover:border-coffee-300'
                  }`}
                >
                  <Package className="w-5 h-5 mx-auto mb-1" />
                  <span className="block font-medium">{t.product.ground}</span>
                  <span className="text-xs">{t.product.groundDesc}</span>
                </button>
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                {t.product.quantity}
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-coffee-300 text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-coffee-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border-2 border-coffee-300 text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Purchase Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{t.product.buyViaWhatsApp}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-coffee-700 to-coffee-900 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-xl transition-shadow"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t.product.addToCart}</span>
              </motion.button>
            </div>
            
            {/* Product Features */}
            <div className="border-t border-coffee-200 pt-6 space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-coffee-900">{t.product.chocolateNotes}</p>
                  <p className="text-sm text-coffee-600">{t.product.chocolateNotesDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-coffee-900">{t.product.citricAcidity}</p>
                  <p className="text-sm text-coffee-600">{t.product.citricAcidityDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-coffee-900">{t.product.velvetyBody}</p>
                  <p className="text-sm text-coffee-600">{t.product.velvetyBodyDesc}</p>
                </div>
              </div>
            </div>
            
            {/* Subscription Option */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-coffee-900">{t.product.subscribeAndSave}</h4>
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">{t.product.new}</span>
              </div>
              <p className="text-sm text-coffee-700 mb-3">{t.product.subscribeDesc}</p>
              <button 
                onClick={onOpenSubscription}
                className="text-coffee-800 font-medium text-sm hover:text-coffee-600 transition-colors"
              >
                {t.product.learnMore} →
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Success Toast */}
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 z-50"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">{t.product.productAdded}</span>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function ContactSection() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.3 })
  const { t } = useLanguage()
  
  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-coffee-800 to-coffee-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={hasIntersected ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            {t.contact.title}
          </h2>
          <p className="text-xl text-coffee-200 mb-8 max-w-2xl mx-auto">
            {t.contact.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="mailto:renatofap@jabo.cafe"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-coffee-900 px-8 py-4 rounded-full font-medium hover:shadow-2xl transition-shadow"
            >
              {t.contact.talkToUs}
            </motion.a>
            <motion.a
              href="tel:+5511984153337"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-coffee-900 transition-colors"
            >
              {t.contact.phone}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}