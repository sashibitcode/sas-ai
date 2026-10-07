/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        chat: {
          bg: {
            light: '#ffffff',
            dark: '#191919',
          },
          sidebar: {
            light: '#f9fafb',
            dark: '#191919',
          },
          bubble: {
            userLight: '#7c3aed',
            userDark: '#202020',
            aiLight: '#f3f4f6',
            aiDark: '#191919',
          },
          border: {
            light: '#e5e7eb',
            dark: '#2e2e2d',
          }
        },
        pplx: {
          bg: '#080b12',
          sidebar: '#070a10',
          card: '#0e1320',
          cardHover: '#13192a',
          input: '#0e1320',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.12)',
          text: '#ececec',
          muted: '#8f8f8f',
          dim: '#666666',
          accent: '#20b8cd',
          pill: '#121827',
          pillHover: '#182135',
        },
        obsidian: {
          950: '#05080e',
          900: '#080b12',
          850: '#0c101a',
          800: '#111624',
          750: '#161c2e',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          '"Fira Code"',
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'aurora-1': 'aurora1 24s ease-in-out infinite alternate',
        'aurora-2': 'aurora2 28s ease-in-out infinite alternate',
        'aurora-3': 'aurora3 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora1: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(60px, -40px, 0) scale(1.15)' },
          '100%': { transform: 'translate3d(-40px, 50px, 0) scale(0.95)' },
        },
        aurora2: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-70px, 40px, 0) scale(1.1)' },
          '100%': { transform: 'translate3d(50px, -60px, 0) scale(0.9)' },
        },
        aurora3: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(0.95)' },
          '50%': { transform: 'translate3d(30px, 40px, 0) scale(1.1)' },
          '100%': { transform: 'translate3d(-20px, -30px, 0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
