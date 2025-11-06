import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        soft: '0 10px 25px rgba(0,0,0,0.07)'
      }
    },
  },
  plugins: [],
} satisfies Config
