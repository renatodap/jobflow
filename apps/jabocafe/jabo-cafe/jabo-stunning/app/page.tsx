'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Coffee, Leaf, Heart, Star, ArrowRight, ChevronDown, Award, Users, Globe, Package } from 'lucide-react'
import Image from 'next/image'

function ParallaxSection({ children, offset = 50 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
  
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const products = [
    {
      name: "Jabô Premium",
      description: "Notas de chocolate e caramelo",
      price: "R$ 89,90",
      rating: 5,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=500&fit=crop"
    },
    {
      name: "Jabô Especial",
      description: "Acidez cítrica e floral",
      price: "R$ 79,90",
      rating: 5,
      image: "https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&h=500&fit=crop"
    },
    {
      name: "Jabô Clássico",
      description: "Equilibrado e suave",
      price: "R$ 69,90",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=500&fit=crop"
    }
  ]

  const testimonials = [
    {
      name: "Barbara Grings",
      text: "Um café frutado, leve, muito saboroso que traz consigo tanta história e cuidado.",
      rating: 5
    },
    {
      name: "Isabella Salton",
      text: "Perfeito! Delicioso! Uma experiência única.",
      rating: 5
    }
  ]

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center mesh-bg">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-coffee-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Mouse Follow Effect */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-radial from-coffee-300/20 to-transparent rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">
              <span className="text-gradient">Jabô Café</span>
            </h1>
            <p className="text-xl md:text-2xl text-coffee-700 mb-8 max-w-2xl mx-auto">
              Três gerações cultivando excelência em cada grão desde 1938
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-coffee-600 text-white rounded-full font-semibold hover:bg-coffee-700 transition-colors shimmer"
              >
                Explorar Produtos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-coffee-600 text-coffee-600 rounded-full font-semibold hover:bg-coffee-50 transition-colors"
              >
                Nossa História
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Coffee, value: "87", label: "Pontos SCA" },
                { icon: Leaf, value: "100%", label: "Sustentável" },
                { icon: Award, value: "86", label: "Anos de Tradição" },
                { icon: Heart, value: "500+", label: "Clientes Felizes" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-coffee-500" />
                  <div className="text-3xl font-bold text-coffee-800">{stat.value}</div>
                  <div className="text-sm text-coffee-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-coffee-600" />
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-gradient-to-b from-white to-sand-50">
        <div className="container mx-auto px-6">
          <ParallaxSection>
            <h2 className="text-5xl font-display font-bold text-center mb-4">
              Nossos Cafés <span className="text-gradient">Especiais</span>
            </h2>
            <p className="text-center text-coffee-600 mb-16 max-w-2xl mx-auto">
              Cada blend é cuidadosamente selecionado para proporcionar uma experiência única
            </p>
          </ParallaxSection>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover-lift">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                      <p className="text-sm opacity-90">{product.description}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-coffee-400 text-coffee-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-coffee-700">{product.price}</span>
                    </div>
                    <button className="w-full py-3 bg-coffee-600 text-white rounded-lg font-semibold hover:bg-coffee-700 transition-colors shimmer">
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ParallaxSection offset={30}>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop"
                    alt="Fazenda Jaboticabeiras"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-coffee-200 rounded-3xl -z-10" />
              </div>
            </ParallaxSection>

            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl font-display font-bold mb-6">
                  Nossa <span className="text-gradient">História</span>
                </h2>
                <p className="text-coffee-700 mb-6 text-lg leading-relaxed">
                  Desde 1938, a Fazenda Jaboticabeiras tem sido sinônimo de qualidade e tradição 
                  na produção de café especial. Localizada em Guaxupé, Minas Gerais, nossa fazenda 
                  combina técnicas tradicionais com inovação sustentável.
                </p>
                <p className="text-coffee-700 mb-8 text-lg leading-relaxed">
                  Três gerações de dedicação resultam em cafés com pontuação superior a 87 pontos 
                  na escala SCA, reconhecidos internacionalmente pela qualidade excepcional.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { icon: Globe, text: "Reconhecimento Internacional" },
                    { icon: Users, text: "Produção Familiar" },
                    { icon: Leaf, text: "100% Sustentável" },
                    { icon: Package, text: "Rastreabilidade Total" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-6 h-6 text-coffee-500" />
                      <span className="text-coffee-700">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-600 text-white rounded-full font-semibold hover:bg-coffee-700 transition-colors">
                  Conhecer Mais
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-sand-50 to-white">
        <div className="container mx-auto px-6">
          <ParallaxSection>
            <h2 className="text-5xl font-display font-bold text-center mb-16">
              O que dizem nossos <span className="text-gradient">clientes</span>
            </h2>
          </ParallaxSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-coffee-400 text-coffee-400" />
                  ))}
                </div>
                <p className="text-coffee-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-coffee-900">— {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-display font-bold mb-6">
              Experimente a Tradição
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Descubra o sabor único do café cultivado com paixão e cuidado há mais de 80 anos
            </p>
            <button className="px-8 py-4 bg-white text-coffee-700 rounded-full font-bold text-lg hover:bg-sand-50 transition-colors shimmer">
              Comprar Agora
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-coffee-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold mb-4">Jabô Café</h3>
            <p className="opacity-80 mb-6">Fazenda Jaboticabeiras • Guaxupé, MG • Desde 1938</p>
            <div className="flex justify-center gap-8 text-sm opacity-70">
              <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
              <a href="#" className="hover:opacity-100 transition-opacity">WhatsApp</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Email</a>
            </div>
            <p className="mt-8 text-sm opacity-50">© 2025 Jabô Café. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}