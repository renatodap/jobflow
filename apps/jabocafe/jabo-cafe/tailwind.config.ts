import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f3',
          100: '#f8e8d8',
          200: '#eecaa6',
          300: '#e3a970',
          400: '#d88c47',
          500: '#c76f2e',
          600: '#a85424',
          700: '#873d1f',
          800: '#6f321f',
          900: '#5c2b1d',
        },
        cream: {
          DEFAULT: '#FFF8E7',
          50: '#FFFEFB',
          100: '#FFFDF7',
          200: '#FFFBEC',
          300: '#FFF8E7',
          400: '#FFF5DC',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        chocolate: {
          DEFAULT: '#3E2723',
          50: '#8D6E63',
          100: '#795548',
          200: '#6D4C41',
          300: '#5D4037',
          400: '#4E342E',
          500: '#3E2723',
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'floatSlow 12s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-scale': 'fadeInScale 0.8s ease-out',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'hero-zoom': 'heroZoom 25s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        heroZoom: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.02) rotate(0.5deg)' },
          '100%': { transform: 'scale(1.04) rotate(0deg)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          'from': { transform: 'translateX(-100px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #6f321f 0%, #a85424 25%, #c76f2e 50%, #d88c47 75%, #e3a970 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FFF8E7 0%, #FFFEFB 100%)',
        'coffee-mesh': 'radial-gradient(at 40% 20%, #e3a970 0px, transparent 50%), radial-gradient(at 80% 0%, #d88c47 0px, transparent 50%), radial-gradient(at 0% 50%, #c76f2e 0px, transparent 50%), radial-gradient(at 80% 50%, #a85424 0px, transparent 50%), radial-gradient(at 0% 100%, #873d1f 0px, transparent 50%), radial-gradient(at 80% 100%, #6f321f 0px, transparent 50%), radial-gradient(at 0% 0%, #5c2b1d 0px, transparent 50%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 30px rgba(199, 111, 46, 0.3)',
        'inner-glow': 'inset 0 0 30px rgba(199, 111, 46, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;