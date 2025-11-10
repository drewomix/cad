import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff'
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
