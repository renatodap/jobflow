import { ReactNode } from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle, Lightbulb } from 'lucide-react'

interface CalloutProps {
  children: ReactNode
  type?: 'info' | 'warning' | 'success' | 'error' | 'tip'
  title?: string
}

const calloutStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900'
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    titleColor: 'text-green-900'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: XCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-900'
  },
  tip: {
    container: 'bg-brand-amber/10 border-brand-amber/30 text-brand-navy',
    icon: Lightbulb,
    iconColor: 'text-brand-amber',
    titleColor: 'text-brand-navy'
  }
}

export default function Callout({ children, type = 'info', title }: CalloutProps) {
  const style = calloutStyles[type]
  const Icon = style.icon

  return (
    <div className={`not-prose my-6 rounded-lg border-l-4 p-4 ${style.container}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-2 ${style.titleColor}`}>
              {title}
            </h4>
          )}
          <div className="text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
