'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressiveImage } from '../storytelling/ProgressiveImage'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import { ChevronLeft, ChevronRight, Calendar, Users, Award, Leaf } from 'lucide-react'

const timelineEvents = [
  {
    year: 1938,
    title: 'A Fundação',
    description: 'João Batista inicia o cultivo de café nas terras férteis de Guaxupé, plantando as primeiras mudas que dariam origem à Fazenda Jaboticabeiras.',
    image: '/images/IMAGE_history(oldpic).webp',
    icon: Calendar,
    details: [
      'Primeiras 100 mudas plantadas',
      'Área inicial de 5 hectares',
      'Técnicas tradicionais de cultivo'
    ]
  },
  {
    year: 1955,
    title: 'Expansão Familiar',
    description: 'A segunda geração assume parte das operações, expandindo a área cultivada e introduzindo novas variedades de café arábica.',
    image: '/images/IMAGE_fazenda_vista_aerea.webp',
    icon: Users,
    details: [
      'Área expandida para 50 hectares',
      'Introdução de varietais Bourbon',
      'Primeira estrutura de beneficiamento'
    ]
  },
  {
    year: 1978,
    title: 'Reconhecimento',
    description: 'Primeira premiação em concurso regional de qualidade, marcando o início do reconhecimento do café Jabô.',
    image: '/images/IMAGE_SECAGEM.webp',
    icon: Award,
    details: [
      'Medalha de ouro regional',
      'Início das exportações',
      'Certificação de origem'
    ]
  },
  {
    year: 1998,
    title: 'Sustentabilidade',
    description: 'Adoção pioneira de práticas regenerativas e cultivo orgânico, tornando-se referência em sustentabilidade.',
    image: '/images/IMAGE_graos.webp',
    icon: Leaf,
    details: [
      'Certificação orgânica',
      'Sistema agroflorestal implementado',
      'Redução de 70% no uso de água'
    ]
  },
  {
    year: 2015,
    title: 'Inovação',
    description: 'Terceira geração traz tecnologia e inovação, mantendo a tradição e elevando a qualidade a patamares internacionais.',
    image: '/images/IMAGE_funcionarioReginaldo.webp',
    icon: Award,
    details: [
      'Tecnologia de precisão no cultivo',
      'Rastreabilidade blockchain',
      'Programa de capacitação de funcionários'
    ]
  },
  {
    year: 2024,
    title: 'Legado Vivo',
    description: 'Mais de 80 anos de história, três gerações unidas pelo amor ao café e compromisso com a excelência.',
    image: '/images/IMAGE_hero_people_fazenda.webp',
    icon: Users,
    details: [
      '200 hectares cultivados',
      '50 famílias empregadas',
      'Carbono negativo certificado'
    ]
  }
]

export function HistoryTimeline() {
  const [activeEvent, setActiveEvent] = useState(0)
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  
  const nextEvent = () => {
    setActiveEvent((prev) => (prev + 1) % timelineEvents.length)
  }
  
  const prevEvent = () => {
    setActiveEvent((prev) => (prev - 1 + timelineEvents.length) % timelineEvents.length)
  }
  
  const currentEvent = timelineEvents[activeEvent]
  const Icon = currentEvent.icon
  
  return (
    <section ref={ref} className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-coffee-600 uppercase tracking-wider text-sm mb-4">
            Nossa Jornada
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-coffee-900 mb-6">
            Três Gerações de História
          </h2>
        </motion.div>
        
        {/* Timeline Navigation */}
        <div className="relative mb-12">
          <div className="absolute left-0 right-0 h-1 bg-coffee-200 top-1/2 transform -translate-y-1/2" />
          <div className="relative flex justify-between">
            {timelineEvents.map((event, index) => (
              <button
                key={event.year}
                onClick={() => setActiveEvent(index)}
                className="relative group"
              >
                <motion.div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    index === activeEvent
                      ? 'bg-coffee-700 border-coffee-700 scale-150'
                      : index < activeEvent
                      ? 'bg-coffee-500 border-coffee-500'
                      : 'bg-white border-coffee-300'
                  }`}
                  whileHover={{ scale: 1.3 }}
                />
                <span className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
                  index === activeEvent ? 'text-coffee-900 font-bold' : 'text-coffee-600'
                }`}>
                  {event.year}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Event Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEvent}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center mt-20"
          >
            {/* Image Side */}
            <div className="relative">
              <motion.div 
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                layoutId="timeline-image"
              >
                <ProgressiveImage
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  fill
                  className="h-full"
                />
                
                {/* Year Overlay */}
                <motion.div 
                  className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-coffee-700" />
                    <div>
                      <p className="text-3xl font-bold text-coffee-900">{currentEvent.year}</p>
                      <p className="text-sm text-coffee-600">
                        {activeEvent === 0 ? 'Início' : `${2024 - currentEvent.year} anos atrás`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Content Side */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-3xl font-serif text-coffee-900 mb-4">
                  {currentEvent.title}
                </h3>
                <p className="text-lg text-coffee-700 leading-relaxed mb-6">
                  {currentEvent.description}
                </p>
              </motion.div>
              
              {/* Details List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-coffee-50 rounded-xl p-6"
              >
                <h4 className="font-semibold text-coffee-900 mb-4">Marcos Importantes</h4>
                <ul className="space-y-2">
                  {currentEvent.details.map((detail, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start space-x-2"
                    >
                      <span className="text-coffee-600 mt-1">•</span>
                      <span className="text-coffee-700">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <button
                  onClick={prevEvent}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                  aria-label="Evento anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-coffee-700" />
                </button>
                
                <div className="flex-1 text-center">
                  <p className="text-sm text-coffee-600">
                    {activeEvent + 1} de {timelineEvents.length}
                  </p>
                </div>
                
                <button
                  onClick={nextEvent}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                  aria-label="Próximo evento"
                >
                  <ChevronRight className="w-5 h-5 text-coffee-700" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}