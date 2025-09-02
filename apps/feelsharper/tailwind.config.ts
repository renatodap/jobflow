import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark-first Feel Sharper Theme
        // Background colors (dark primary)
        bg: '#0A0A0A',              // Pure black background
        surface: '#111418',         // Near-black surface
        'surface-2': '#161A1F',     // Elevated surface
        'surface-3': '#1D2127',     // Higher elevation
        
        // Text colors (white primary)
        'text-primary': '#FFFFFF',   // Primary text (white)
        'text-secondary': '#C7CBD1', // Secondary text (light gray)  
        'text-muted': '#8B9096',     // Muted text (mid gray)
        'text-disabled': '#6B6F76',  // Disabled text
        
        // Brand colors (navy focus)
        navy: '#0B2A4A',            // Primary brand navy
        'navy-600': '#123B69',      // Darker navy
        'navy-400': '#1F5798',      // Lighter navy  
        'navy-50': '#EBF2F9',       // Very light navy (for light mode)
        
        // Semantic colors
        'success': '#10B981',       // Success green
        'warning': '#F59E0B',       // Warning amber
        'error': '#EF4444',         // Error red
        'info': '#3B82F6',          // Info blue
        
        // Functional colors
        border: '#23272E',          // Border color
        focus: '#E5E7EB',           // Focus rings
        
        // Legacy compatibility (mapped to new tokens)
        'sharp-blue': '#1F5798',    // Maps to navy-400
        'energy-orange': '#F59E0B', // Maps to warning
        'steel-gray': '#111418',    // Maps to surface
        'success-green': '#10B981', // Maps to success
        'alert-red': '#EF4444',     // Maps to error
        'clean-white': '#FFFFFF',   // Maps to text-primary
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
