import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'StudySharper - AI-Powered Study Assistant',
  description: 'Transform your learning with AI-driven study plans, spaced repetition, and intelligent recommendations.',
  keywords: ['study', 'education', 'AI', 'spaced repetition', 'learning', 'notes', 'flashcards'],
  authors: [{ name: 'StudySharper Team' }],
  creator: 'StudySharper',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'StudySharper - AI-Powered Study Assistant',
    description: 'Transform your learning with AI-driven study plans, spaced repetition, and intelligent recommendations.',
    siteName: 'StudySharper',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudySharper - AI-Powered Study Assistant',
    description: 'Transform your learning with AI-driven study plans, spaced repetition, and intelligent recommendations.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}