import type { Metadata } from "next";
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feel Sharper | Your Sharpest Self, Every Day",
  description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
  keywords: ["fitness tracking", "workout log", "nutrition", "AI coaching", "performance", "health metrics", "recovery", "evidence-based"],
  authors: [{ name: "Feel Sharper" }],
  creator: "Feel Sharper",
  publisher: "Feel Sharper",
  metadataBase: new URL('https://feelsharper.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
    url: 'https://feelsharper.com',
    siteName: 'Feel Sharper',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Feel Sharper - Your Sharpest Self, Every Day',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery with AI-driven coaching.",
    images: ['/images/og-default.jpg'],
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
};

/**
 * Root layout component - ensures single header/footer rendering
 * Provides consistent typography, theming, and layout structure
 * Fixed: Removed duplicate AskFeelSharper to prevent layout conflicts
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen bg-bg text-text-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
