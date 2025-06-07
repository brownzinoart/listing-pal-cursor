/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      colors: {
        'brand-background': '#171E2B', // Deep blue/gray
        'brand-panel': '#242B40',    // Lighter panel background
        'brand-card': '#2D374F',     // Card backgrounds
        'brand-primary': '#4A55C7',  // Primary blue/purple for buttons, interactive elements
        'brand-secondary': '#38A169', // Green for prices, success, active states
        'brand-accent': '#805AD5',    // Purple accent
        'brand-text-primary': '#F7FAFC', // Off-white
        'brand-text-secondary': '#A0AEC0', // Lighter gray for subtitles, less important text
        'brand-text-tertiary': '#718096', // Darker gray for muted text
        'brand-border': '#4A5568',      // Darker gray for borders
        'brand-danger': '#E53E3E',       // Red for danger/delete actions
        'brand-warning': '#D69E2E',      // Orange for warnings
        'brand-info': '#3182CE',         // Blue for info messages
        'brand-success': '#38A169',      // Green for success (same as secondary)
        'brand-input-bg': '#2D374F', // Background for input fields
        'brand-gradient-2': 'linear-gradient(90deg, #4A55C7 0%, #38A169 100%)',
        'brand-gradient-3': 'linear-gradient(90deg, #805AD5 0%, #4A55C7 50%, #38A169 100%)',
        'brand-highlight': '#1A2236',
        'brand-glow': '#4A55C7',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #805AD5, #4A55C7)',
        'brand-gradient-radial': 'radial-gradient(ellipse at center, #4A55C7, #805AD5)',
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        'full': '9999px',
        DEFAULT: '0.75rem',
      },
      boxShadow: {
        'brand-sm': '0 1px 2px 0 rgba(74, 85, 199, 0.05)',
        'brand': '0 4px 6px -1px rgba(74, 85, 199, 0.1), 0 2px 4px -1px rgba(74, 85, 199, 0.06)',
        'brand-md': '0 10px 15px -3px rgba(74, 85, 199, 0.1), 0 4px 6px -2px rgba(74, 85, 199, 0.05)',
        'brand-lg': '0 20px 25px -5px rgba(74, 85, 199, 0.1), 0 10px 10px -5px rgba(74, 85, 199, 0.04)',
        'brand-xl': '0 25px 50px -12px rgba(74, 85, 199, 0.25)',
        'brand-glow': '0 0 20px rgba(74, 85, 199, 0.4)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(brand-background|brand-panel|brand-card|brand-primary|brand-secondary|brand-accent|brand-danger|brand-warning|brand-info|brand-success|brand-input-bg)/,
    },
    {
      pattern: /text-(brand-text-primary|brand-text-secondary|brand-text-tertiary|brand-primary|brand-secondary|brand-accent|brand-danger|brand-warning|brand-info|brand-success)/,
    },
    {
      pattern: /border-(brand-border|brand-primary|brand-secondary|brand-danger|brand-warning|brand-info|brand-success)/,
    },
    {
      pattern: /shadow-(brand-sm|brand|brand-md|brand-lg|brand-xl|brand-glow)/,
    },
  ]
}