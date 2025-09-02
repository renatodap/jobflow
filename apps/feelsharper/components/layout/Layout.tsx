import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  image?: string
  url?: string
}

/**
 * Main layout component - ensures single header/footer rendering
 * Integrates AI assistant as a prominent banner feature
 * Fixed: Clean structure prevents duplicate components
 */
export default function Layout({ 
  children, 
  title, 
  description, 
  image, 
  url 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main navbar with dark theme */}
      <Navbar />
      
      {/* Main content with proper spacing */}
      <main className="flex-grow pt-16">
        {children}
      </main>
      
      {/* Fixed: Single footer instance */}
      <Footer />

      {/* Mobile bottom navigation */}
      <div className="sm:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
