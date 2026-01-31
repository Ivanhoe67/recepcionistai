import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Sky Blue Color Palette for Liquid Glass
      colors: {
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.65)',
          'white-light': 'rgba(255, 255, 255, 0.45)',
          'white-heavy': 'rgba(255, 255, 255, 0.8)',
          sky: 'rgba(186, 230, 253, 0.4)',
          'sky-heavy': 'rgba(125, 211, 252, 0.5)',
        },
      },
      // Glass-specific backdrop blur values
      backdropBlur: {
        glass: '20px',
        'glass-heavy': '40px',
        'glass-light': '12px',
      },
      // Custom border radius for glass components
      borderRadius: {
        glass: '24px',
        'glass-sm': '14px',
        'glass-lg': '32px',
      },
      // Glass box shadows
      boxShadow: {
        glass: '0 8px 32px rgba(14, 165, 233, 0.15)',
        'glass-lg': '0 20px 60px rgba(14, 165, 233, 0.2)',
        'glass-sm': '0 4px 16px rgba(14, 165, 233, 0.1)',
        'glass-glow': '0 0 40px rgba(56, 189, 248, 0.3)',
        'glass-button': '0 4px 20px rgba(14, 165, 233, 0.3)',
      },
      // Animations
      animation: {
        'gradient-flow': 'gradient-flow 15s ease infinite',
        'orbs-float': 'orbs-float 20s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in': 'slide-in-left 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'orbs-float': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(2%, 2%) rotate(5deg)' },
          '50%': { transform: 'translate(-1%, 3%) rotate(-3deg)' },
          '75%': { transform: 'translate(1%, -2%) rotate(2deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      // Background gradients
      backgroundImage: {
        'gradient-sky': 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
        'gradient-sky-soft': 'linear-gradient(180deg, rgba(224, 242, 254, 0.8) 0%, rgba(186, 230, 253, 0.6) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-button': 'linear-gradient(135deg, rgba(56, 189, 248, 0.9) 0%, rgba(14, 165, 233, 0.9) 100%)',
        'liquid-bg': 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 25%, #bae6fd 50%, #e0f2fe 75%, #f0f9ff 100%)',
      },
      // Background size for animations
      backgroundSize: {
        '400': '400% 400%',
      },
      // Transition timing functions
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
