import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#1a1110',
        surface: '#231918',
        'surface-alt': '#2d1f1d',
        primary: '#f5d547',
        secondary: '#f8a398',
        success: '#17cf97',
        muted: '#a89891',
        'text-base': '#f0ebe8',
        error: '#ff5c5c',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'neo-primary':   '8px 8px 0px 0px #f5d547',
        'neo-secondary': '8px 8px 0px 0px #f8a398',
        'neo-success':   '8px 8px 0px 0px #17cf97',
        'neo-black':     '8px 8px 0px 0px #000000',
        'neo-sm':        '4px 4px 0px 0px #000000',
      },
    },
  },
  plugins: [],
}
export default config
