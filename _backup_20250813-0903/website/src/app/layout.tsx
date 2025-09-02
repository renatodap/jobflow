import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sharpened - Your edge, sharpened by AI',
  description: 'AI-powered systems that help you learn, improve, and achieve with precision — in your body, mind, and skills.',
  keywords: ['AI', 'learning', 'fitness', 'performance', 'productivity', 'coaching'],
  authors: [{ name: 'Sharpened' }],
  creator: 'Sharpened',
  publisher: 'Sharpened',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sharpened.ai',
    title: 'Sharpened - Your edge, sharpened by AI',
    description: 'AI-powered systems that help you learn, improve, and achieve with precision — in your body, mind, and skills.',
    siteName: 'Sharpened',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sharpened - Your edge, sharpened by AI',
    description: 'AI-powered systems that help you learn, improve, and achieve with precision — in your body, mind, and skills.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}