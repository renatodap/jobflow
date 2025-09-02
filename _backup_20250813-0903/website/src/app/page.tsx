'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import ParticleBackground from '@/components/ParticleBackground'
import WaitlistOptimizer from '@/components/WaitlistOptimizer'
import { 
  ChevronDown, 
  Brain, 
  Zap, 
  Target,
  Twitter,
  Github,
  Linkedin,
  ArrowRight,
  CheckCircle,
  Activity,
  BookOpen,
  Plus,
  Minus
} from 'lucide-react'

export default function Home() {
  const [manifestoExpanded, setManifestoExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-charcoal text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-charcoal/95 backdrop-blur-xl border-b border-deep-gray" : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sharpened
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('products')}
                className="hover:text-electric-blue transition-colors"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('manifesto')}
                className="hover:text-electric-blue transition-colors"
              >
                Manifesto
              </button>
              <motion.a 
                href={`mailto:${BRAND.contact.email}`}
                className="bg-electric-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Particle Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/50 to-charcoal pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <span className="block">Your edge,</span>
              <span className="block bg-gradient-to-r from-electric-blue to-cyan-pulse bg-clip-text text-transparent">
                sharpened by AI
              </span>
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {BRAND.corePromise}
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.button
                onClick={() => scrollToSection('waitlist')}
                className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center gap-2 group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join the waitlist
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('promise')}
                className="border-2 border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn more
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-zinc-600" />
          </motion.div>
        </div>

        {/* Request for background video */}
        <div className="absolute top-20 left-6 bg-deep-gray/90 backdrop-blur p-4 rounded-lg border border-zinc-800 max-w-xs">
          <p className="text-sm text-zinc-400">
            <strong className="text-white">Media Request:</strong> Please provide a looping background video (15-30s, abstract/tech-themed, 1920x1080) for the hero section in <code>/public/brand/hero-bg.mp4</code>
          </p>
        </div>
      </section>

      {/* The Promise Section */}
      <section id="promise" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Promise</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Technology becomes transformation when applied with precision and purpose.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Data-Driven Insights", text: "Reveal what's actually working with AI-powered analysis" },
              { icon: Zap, title: "Pattern Recognition", text: "Spot improvement opportunities you'd miss on your own" },
              { icon: Target, title: "Measurable Progress", text: "Track and celebrate every gain with precision metrics" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-deep-gray/50 backdrop-blur border border-zinc-800 rounded-xl p-8 hover:border-electric-blue/50 transition-all group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-16 h-16 bg-electric-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-electric-blue/20 transition-colors">
                  <item.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-zinc-400">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Request for icons */}
          <div className="mt-8 bg-deep-gray/90 backdrop-blur p-4 rounded-lg border border-zinc-800 max-w-md mx-auto">
            <p className="text-sm text-zinc-400">
              <strong className="text-white">Media Request:</strong> Custom icon set or illustration style reference for promise cards in <code>/public/brand/icons/</code>
            </p>
          </div>
        </div>
      </section>

      {/* Product Cards Section */}
      <section id="products" className="py-24">
        <div className="max-w-7xl mx-auto">
          {/* FeelSharper */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center mb-24 px-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-vibrant-red/20 to-transparent p-12 rounded-2xl border border-vibrant-red/20">
                <Activity className="w-12 h-12 text-vibrant-red mb-6" />
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-vibrant-red">
                  {BRAND.products.feelSharper.name}
                </h3>
                <p className="text-lg text-zinc-300 mb-8">
                  {BRAND.products.feelSharper.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {BRAND.products.feelSharper.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-vibrant-red flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button 
                  className="bg-vibrant-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Coming Soon
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-deep-gray/50 rounded-2xl p-8 border border-zinc-800 aspect-video flex items-center justify-center">
                <p className="text-zinc-500 text-center">
                  <strong className="text-white block mb-2">Media Request:</strong>
                  Product screenshot or video demo for FeelSharper<br/>
                  <code className="text-xs">/public/brand/feelsharper-preview.mp4</code>
                </p>
              </div>
            </div>
          </motion.div>

          {/* StudySharper */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center px-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <div className="bg-deep-gray/50 rounded-2xl p-8 border border-zinc-800 aspect-video flex items-center justify-center">
                <p className="text-zinc-500 text-center">
                  <strong className="text-white block mb-2">Media Request:</strong>
                  Product screenshot or video demo for StudySharper<br/>
                  <code className="text-xs">/public/brand/studysharper-preview.mp4</code>
                </p>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-cyan-pulse/20 to-transparent p-12 rounded-2xl border border-cyan-pulse/20">
                <BookOpen className="w-12 h-12 text-cyan-pulse mb-6" />
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-pulse">
                  {BRAND.products.studySharper.name}
                </h3>
                <p className="text-lg text-zinc-300 mb-8">
                  {BRAND.products.studySharper.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {BRAND.products.studySharper.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-pulse flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button 
                  className="bg-cyan-pulse hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Coming Soon
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-gray/20 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Manifesto</h2>
            
            <div className="bg-deep-gray/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={manifestoExpanded ? 'expanded' : 'collapsed'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-electric-blue">Vision</h3>
                      <p className="text-lg text-zinc-300">{BRAND.vision}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-electric-blue">Mission</h3>
                      <p className="text-lg text-zinc-300">{BRAND.mission}</p>
                    </div>

                    {manifestoExpanded && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-xl font-semibold mb-3 text-electric-blue">Why Now</h3>
                          <p className="text-lg text-zinc-300">{BRAND.whyNow}</p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <h3 className="text-xl font-semibold mb-3 text-electric-blue">Origin</h3>
                          <p className="text-lg text-zinc-300">{BRAND.origin}</p>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.button
                onClick={() => setManifestoExpanded(!manifestoExpanded)}
                className="mt-8 text-electric-blue hover:text-blue-400 font-semibold inline-flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {manifestoExpanded ? (
                  <>
                    <Minus className="w-5 h-5" />
                    Show less
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Read full manifesto
                  </>
                )}
              </motion.button>
            </div>

            {/* Values */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {BRAND.values.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-deep-gray/50 backdrop-blur px-6 py-3 rounded-full border border-zinc-800 hover:border-electric-blue/50 transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  title={value.description}
                >
                  <span className="font-semibold">{value.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Request for background */}
          <div className="mt-12 bg-deep-gray/90 backdrop-blur p-4 rounded-lg border border-zinc-800 max-w-md mx-auto">
            <p className="text-sm text-zinc-400 text-center">
              <strong className="text-white">Media Request:</strong> Background texture or abstract image for manifesto section in <code>/public/brand/manifesto-bg.jpg</code>
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-24 relative overflow-hidden" id="waitlist">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-cyan-pulse/10 to-electric-blue/10 animate-gradient bg-[length:200%_200%]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {BRAND.taglines.tertiary}
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Join the waitlist to be among the first to experience AI coaching that tracks real progress, not just activity.
            </p>
          </motion.div>

          <WaitlistOptimizer />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-deep-gray/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">Sharpened</div>
              <p className="text-zinc-400">
                {BRAND.taglines.primary}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">FeelSharper</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">StudySharper</a>
                </li>
                <li className="text-zinc-600">WorkSharper (Coming Soon)</li>
                <li className="text-zinc-600">MindSharper (Coming Soon)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
              </div>
              <p className="text-zinc-500 text-sm mt-4">
                Please provide social media links to activate
              </p>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
            <div>© 2024 Sharpened. All rights reserved.</div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}