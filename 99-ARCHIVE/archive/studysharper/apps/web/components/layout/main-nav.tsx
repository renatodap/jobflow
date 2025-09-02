'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  Upload,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MainNavProps {
  user: any
  onSignOut: () => void
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick actions'
  },
  {
    title: 'Study Hub',
    href: '/(dashboard)/study',
    icon: Brain,
    description: 'AI-powered study planning',
    badge: 'NEW'
  },
  {
    title: 'Academic',
    href: '/dashboard/academic',
    icon: BookOpen,
    description: 'Manage schools, courses & subjects'
  },
  {
    title: 'Content',
    href: '/dashboard/content',
    icon: Upload,
    description: 'Upload & manage study materials'
  },
  {
    title: 'Flashcards',
    href: '/cards',
    icon: GraduationCap,
    description: 'Spaced repetition learning'
  },
  {
    title: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'Ask questions about your materials'
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: TrendingUp,
    description: 'Track your learning'
  }
]

export function MainNav({ user, onSignOut }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">StudySharper</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'h-4 w-4',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className={cn(
                  'text-xs',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {user?.user_metadata?.full_name || 'User'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}