'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCw, Info } from 'lucide-react'

interface FlavorNote {
  angle: number
  label: string
  description: string
  intensity: number
}

const flavorNotes: FlavorNote[] = [
  { angle: 0, label: 'Chocolate', description: 'Notas de cacau amargo', intensity: 0.8 },
  { angle: 45, label: 'Caramelo', description: 'Doçura natural equilibrada', intensity: 0.7 },
  { angle: 90, label: 'Frutas Vermelhas', description: 'Acidez vibrante e frutada', intensity: 0.6 },
  { angle: 135, label: 'Nozes', description: 'Sabor amendoado suave', intensity: 0.5 },
  { angle: 180, label: 'Floral', description: 'Aroma delicado de jasmim', intensity: 0.4 },
  { angle: 225, label: 'Mel', description: 'Doçura natural complexa', intensity: 0.6 },
  { angle: 270, label: 'Especiarias', description: 'Toque de canela e cravo', intensity: 0.3 },
  { angle: 315, label: 'Cítrico', description: 'Acidez brilhante de limão', intensity: 0.5 }
]

export function BeanInspector() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [selectedNote, setSelectedNote] = useState<FlavorNote | null>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 400
    canvas.height = 400
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    const drawBean = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Save context state
      ctx.save()
      
      // Move to center and rotate
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // Draw coffee bean shape
      ctx.beginPath()
      ctx.ellipse(0, 0, 80, 120, 0, 0, Math.PI * 2)
      
      // Gradient fill
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 120)
      gradient.addColorStop(0, '#8B4513')
      gradient.addColorStop(0.5, '#654321')
      gradient.addColorStop(1, '#3E2723')
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Draw center line (crack)
      ctx.beginPath()
      ctx.moveTo(0, -115)
      ctx.quadraticCurveTo(-10, 0, 0, 115)
      ctx.quadraticCurveTo(10, 0, 0, -115)
      ctx.strokeStyle = '#2E1A0F'
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Add texture dots
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 70
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius * 1.5
        
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(46, 26, 15, ${Math.random() * 0.3})`
        ctx.fill()
      }
      
      // Restore context
      ctx.restore()
      
      // Draw flavor notes around the bean
      flavorNotes.forEach(note => {
        const noteAngle = (note.angle + rotation) * Math.PI / 180
        const noteRadius = 150
        const noteX = centerX + Math.cos(noteAngle) * noteRadius
        const noteY = centerY + Math.sin(noteAngle) * noteRadius
        
        // Draw connection line
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(noteX, noteY)
        ctx.strokeStyle = `rgba(139, 69, 19, ${note.intensity * 0.3})`
        ctx.lineWidth = note.intensity * 2
        ctx.stroke()
        
        // Draw note circle
        ctx.beginPath()
        ctx.arc(noteX, noteY, 8 + note.intensity * 10, 0, Math.PI * 2)
        ctx.fillStyle = selectedNote === note 
          ? 'rgba(199, 111, 46, 0.8)' 
          : `rgba(139, 69, 19, ${note.intensity})`
        ctx.fill()
        
        // Draw label
        ctx.save()
        ctx.font = '12px sans-serif'
        ctx.fillStyle = '#5c2b1d'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(note.label, noteX, noteY + 25)
        ctx.restore()
      })
    }
    
    drawBean()
  }, [rotation, selectedNote])
  
  useEffect(() => {
    if (!isAutoRotating) return
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
    }, 30)
    
    return () => clearInterval(interval)
  }, [isAutoRotating])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Check if click is near any flavor note
    flavorNotes.forEach(note => {
      const noteAngle = (note.angle + rotation) * Math.PI / 180
      const noteRadius = 150
      const noteX = centerX + Math.cos(noteAngle) * noteRadius
      const noteY = centerY + Math.sin(noteAngle) * noteRadius
      
      const distance = Math.sqrt((x - noteX) ** 2 + (y - noteY) ** 2)
      if (distance < 20) {
        setSelectedNote(note)
        setIsAutoRotating(false)
      }
    })
  }
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-coffee-900 mb-2">
          Explorador de Sabores
        </h3>
        <p className="text-coffee-600">
          Clique nas notas ao redor do grão para descobrir os sabores
        </p>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(139, 69, 19, 0.3))' }}
        />
        
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label={isAutoRotating ? 'Parar rotação' : 'Iniciar rotação'}
        >
          <RotateCw className={`w-5 h-5 text-coffee-700 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {selectedNote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-coffee-50 rounded-xl p-6 max-w-md"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-coffee-600 mt-1" />
            <div>
              <h4 className="font-semibold text-coffee-900 mb-1">
                {selectedNote.label}
              </h4>
              <p className="text-coffee-700 text-sm mb-2">
                {selectedNote.description}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-coffee-600">Intensidade:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < Math.round(selectedNote.intensity * 5)
                          ? 'bg-coffee-600'
                          : 'bg-coffee-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}