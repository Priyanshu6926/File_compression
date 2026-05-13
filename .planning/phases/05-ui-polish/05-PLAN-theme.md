---
plan: "5.1"
phase: 5
wave: 1
title: "Theme Provider & Dark/Light Mode"
depends_on: ["4.1"]
requirements_addressed: [UI-POLISH-1]
files_modified:
  - package.json
  - src/app/layout.tsx
  - src/app/globals.css
  - src/components/layout/TrustHeader.tsx
autonomous: true
---

# Plan 5.1 — Theme Provider & Dark/Light Mode

## Objective

Implement `next-themes` to support toggling between Light and Dark mode, expanding the Neo-Brutalist design tokens in `globals.css` and adding a theme toggle switch.

## Tasks

<task id="5.1.1">
<title>Install next-themes and configure tokens</title>
<read_first>
- src/app/globals.css
- src/app/layout.tsx
</read_first>
<action>
1. Install `next-themes` using `npm i next-themes`.
2. Update `src/app/globals.css` to define light mode and dark mode variables:

```css
@import "tailwindcss";

@theme {
  --color-base: var(--theme-base);
  --color-surface: var(--theme-surface);
  --color-surface-alt: var(--theme-surface-alt);
  --color-primary: #f5d547;
  --color-secondary: #f8a398;
  --color-success: #17cf97;
  --color-muted: var(--theme-muted);
  --color-text-base: var(--theme-text-base);
  --color-error: #ff5c5c;

  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  --shadow-neo-primary: 8px 8px 0px 0px #f5d547;
  --shadow-neo-secondary: 8px 8px 0px 0px #f8a398;
  --shadow-neo-success: 8px 8px 0px 0px #17cf97;
  --shadow-neo-black: 8px 8px 0px 0px #000000;
  --shadow-neo-sm: 4px 4px 0px 0px #000000;
}

@layer base {
  :root {
    /* Light Mode */
    --theme-base: #e4e4e7;
    --theme-surface: #ffffff;
    --theme-surface-alt: #f4f4f5;
    --theme-muted: #71717a;
    --theme-text-base: #1a1110;
  }

  .dark {
    /* Dark Mode */
    --theme-base: #1a1110;
    --theme-surface: #231918;
    --theme-surface-alt: #2d1f1d;
    --theme-muted: #a89891;
    --theme-text-base: #f0ebe8;
  }

  body {
    background-color: var(--color-base);
    color: var(--color-text-base);
    font-family: var(--font-sans);
    overflow-x: hidden;
  }

  ::selection {
    background-color: var(--color-primary);
    color: #000;
  }
}
```

3. Update `src/app/layout.tsx` to include `ThemeProvider`:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProcessingProvider } from "@/context/ProcessingContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PicSize Pro",
  description: "Upload any image → instantly get a file that meets exact format, dimension, and size requirements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ProcessingProvider>
            {children}
          </ProcessingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
</action>
<acceptance_criteria>
- `next-themes` is added to package.json.
- `globals.css` uses explicit CSS variables based on `.dark` class.
- `ThemeProvider` wraps the app layout.
</acceptance_criteria>
</task>

<task id="5.1.2">
<title>Add Theme Toggle</title>
<read_first>
- src/components/layout/TrustHeader.tsx
</read_first>
<action>
Add a theme toggle button to `TrustHeader.tsx`.

```tsx
'use client'

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function TrustHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="border-b-2 border-black bg-surface py-4 px-6 flex items-center justify-between z-10 sticky top-0 shadow-neo-sm">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary border-2 border-black shadow-[2px_2px_0px_0px_#000]"></div>
        <span className="font-black text-xl tracking-tighter uppercase">PICSIZE PRO</span>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 border-2 border-black bg-base flex items-center justify-center shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        <div className="hidden md:flex items-center gap-4 font-mono text-sm font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            100% SECURE
          </span>
          <span className="text-muted">|</span>
          <span>LOCAL PROCESSING</span>
        </div>
      </div>
    </header>
  )
}
```
</action>
<acceptance_criteria>
- The header includes a theme toggle button.
- The button is responsive and follows Neo-Brutalist design.
- Clicking the button successfully toggles between light and dark mode.
</acceptance_criteria>
</task>

## Verification Criteria

```
must_haves:
  - next-themes installs cleanly
  - CSS variables cascade correctly for dark/light themes
  - TrustHeader toggle switches the theme visually
```
