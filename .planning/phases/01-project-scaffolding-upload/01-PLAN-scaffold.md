---
plan: "1.1"
phase: 1
wave: 1
title: "Scaffold Next.js 16 App Router Project"
depends_on: []
requirements_addressed: [UPLD-01]
files_modified:
  - package.json
  - tailwind.config.ts
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/globals.css
autonomous: true
---

# Plan 1.1 — Scaffold Next.js 16 App Router Project

## Objective

Bootstrap PicSize Pro with Next.js 16, TypeScript, Tailwind CSS, Geist fonts, and all Neo-Brutalist design tokens from UI-SPEC.

## Tasks

<task id="1.1.1">
<title>Run create-next-app scaffold</title>
<read_first>
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md
</read_first>
<action>
Run from project root:
```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes
```
After scaffold, if next version is < 15, run: `npm install next@latest react@latest react-dom@latest`
</action>
<acceptance_criteria>
- `package.json` contains `"next"` dependency
- `src/app/layout.tsx` exists
- `tailwind.config.ts` exists
- `tsconfig.json` contains `"@/*": ["./src/*"]`
- `npm run build` exits code 0
</acceptance_criteria>
</task>

<task id="1.1.2">
<title>Configure tailwind.config.ts with Neo-Brutalist tokens</title>
<read_first>
- tailwind.config.ts (scaffold output)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 2 Color Tokens)
</read_first>
<action>
Replace tailwind.config.ts content with:

```ts
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
```
</action>
<acceptance_criteria>
- `tailwind.config.ts` contains `base: '#1a1110'`
- `tailwind.config.ts` contains `'neo-secondary': '8px 8px 0px 0px #f8a398'`
- `tailwind.config.ts` contains `fontFamily:`
</acceptance_criteria>
</task>

<task id="1.1.3">
<title>Write globals.css with design tokens and .neo-card utility</title>
<read_first>
- src/app/globals.css (scaffold output)
- .planning/phases/01-project-scaffolding-upload/01-UI-SPEC.md (Section 5 Staggered Stack, Section 12 Tokens)
</read_first>
<action>
Replace src/app/globals.css with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --base:        #1a1110;
  --surface:     #231918;
  --surface-alt: #2d1f1d;
  --primary:     #f5d547;
  --secondary:   #f8a398;
  --success:     #17cf97;
  --muted:       #a89891;
  --text:        #f0ebe8;
  --error:       #ff5c5c;
  --shadow-primary:   8px 8px 0px 0px #f5d547;
  --shadow-secondary: 8px 8px 0px 0px #f8a398;
  --shadow-success:   8px 8px 0px 0px #17cf97;
  --shadow-sm:        4px 4px 0px 0px #000000;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background-color: var(--base);
  color: var(--text);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.neo-card { position: relative; }
.neo-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--secondary);
  border: 2px solid #000;
  border-radius: 4px;
  transform: translate(8px, 8px);
  z-index: 0;
}
.neo-card > * { position: relative; z-index: 1; }
.neo-card-primary::before { background-color: var(--primary); }
.neo-card-success::before { background-color: var(--success); }

@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.led-pulse { animation: led-pulse 1.5s ease-in-out infinite; }

.neo-btn { transition: transform 100ms ease-out, box-shadow 100ms ease-out; }
.neo-btn:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 10px 10px 0px 0px #000; }
.neo-btn:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 4px 4px 0px 0px #000; }

*:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
```
</action>
<acceptance_criteria>
- `src/app/globals.css` contains `--base:        #1a1110`
- `src/app/globals.css` contains `.neo-card::before`
- `src/app/globals.css` contains `@keyframes led-pulse`
- `src/app/globals.css` contains `.neo-btn:hover`
</acceptance_criteria>
</task>

<task id="1.1.4">
<title>Configure layout.tsx with Geist fonts and SEO metadata</title>
<read_first>
- src/app/layout.tsx (scaffold output)
</read_first>
<action>
Replace src/app/layout.tsx with:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PicSize Pro — Universal Image Transformer',
  description: 'Upload any image and instantly convert, resize, and compress it to meet exact portal or social media requirements.',
  keywords: ['image converter', 'image compression', 'HEIC converter', 'resize image'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-base text-text-base min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
```
</action>
<acceptance_criteria>
- `src/app/layout.tsx` contains `import { Geist, Geist_Mono } from 'next/font/google'`
- `src/app/layout.tsx` contains `variable: '--font-geist-sans'`
- `src/app/layout.tsx` contains `title: 'PicSize Pro`
- `npm run build` exits 0
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - Next.js App Router scaffolded with TypeScript + Tailwind
  - tailwind.config.ts has all 9 Neo-Brutalist color tokens
  - globals.css defines CSS vars and .neo-card utility
  - layout.tsx loads Geist + Geist Mono fonts
  - npm run build exits 0
```
