import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chedr: {
          // Brand
          orange: '#FF6B2C',
          'orange-hover': '#FF8147',
          'orange-muted': 'rgba(255, 107, 44, 0.2)',
          
          // Surfaces
          background: '#000000',
          surface: '#1C1C1E',
          'surface-elevated': '#2C2C2E',
          
          // Text
          'text-primary': '#FFFFFF',
          'text-secondary': '#8E8E93',
          'text-tertiary': '#636366',
          
          // Borders
          border: '#3A3A3C',
          'border-focus': '#FF6B2C',
          
          // Semantic
          success: '#30D158',
          error: '#FF453A',
          warning: '#FFD60A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'chat': ['17px', { lineHeight: '1.4' }],
        'hint': ['13px', { lineHeight: '1.4' }],
        'button': ['15px', { lineHeight: '1' }],
      },
      borderRadius: {
        'bubble': '18px',
        'bubble-tail': '4px',
        'input': '18px',
        'button': '12px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'draw-check': 'drawCheck 0.3s ease-out 0.1s forwards',
        'typing': 'typing 1.4s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        drawCheck: {
          from: { strokeDashoffset: '24' },
          to: { strokeDashoffset: '0' },
        },
        typing: {
          '0%, 60%, 100%': { opacity: '0.3' },
          '30%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
