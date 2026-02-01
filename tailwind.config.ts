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
          // Brand — Swift Orange
          orange: '#FF6B35',               // Swift Orange: primary accent, buttons, highlights
          'orange-hover': '#FF8147',
          'orange-muted': 'rgba(255, 107, 53, 0.2)',
          'orange-soft': '#A87A68',        // Muted warm brown for user message pills
          'orange-pill': '#D4836A',        // Muted terracotta for chat pills

          // Surfaces (Apple HIG: avoid pure black, use layered grays)
          background: '#0A0A0C',           // Primary: chat panel (darker)
          'background-secondary': '#1C1C1E', // Secondary: context panel (noticeably lighter)
          surface: '#1C1C1E',              // iOS secondary system background
          'surface-elevated': '#2C2C2E',   // iOS tertiary system background

          // Text — Cloud Divine (warm off-white instead of pure white)
          'cloud': '#F5F3EF',              // Cloud Divine: primary light text
          'cloud-divine': '#F5F3EF',       // Alias for clarity
          'text-primary': '#F5F3EF',       // Cloud Divine
          'text-secondary': '#8E8E93',
          'text-tertiary': '#636366',
          
          // Borders
          border: '#3A3A3C',
          'border-focus': '#FF6B35',       // Swift Orange for focus states
          
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
        // Apple HIG Typography Scale - consistent hierarchy
        'hig-largeTitle': ['34px', { lineHeight: '1.2', fontWeight: '700' }],
        'hig-title1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'hig-title2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'hig-title3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'hig-headline': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'hig-body': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'hig-callout': ['16px', { lineHeight: '1.4', fontWeight: '400' }],
        'hig-subhead': ['15px', { lineHeight: '1.4', fontWeight: '400' }],
        'hig-footnote': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'hig-caption1': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'hig-caption2': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        // Semantic aliases for common use cases
        'chat': ['17px', { lineHeight: '1.5' }],
        'hint': ['13px', { lineHeight: '1.4' }],
        'button': ['15px', { lineHeight: '1', fontWeight: '600' }],
        'section': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'bubble': '24px',                // Pill-aesthetic for chat bubbles (works for multi-line)
        'bubble-pill': '9999px',         // True pill for single-line only
        'bubble-tail': '8px',            // Softer tail corner
        'input': '9999px',               // Pill shape for input fields
        'button': '9999px',              // Pill shape for buttons
        // HIG-aligned radii
        'hig-sm': '8px',
        'hig-md': '12px',
        'hig-lg': '16px',
        'hig-xl': '20px',
        'hig-card': '10px',
      },
      spacing: {
        // 8pt grid system - single scale per agent.md
        'hig-xs': '4px',
        'hig-sm': '8px',
        'hig-md': '16px',
        'hig-lg': '24px',
        'hig-xl': '32px',
        'hig-2xl': '48px',
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
