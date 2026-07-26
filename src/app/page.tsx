'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'
import { MetadataPanel } from '@/components/upload/MetadataPanel'
import { ControlsPanel } from '@/components/controls/ControlsPanel'
import { BatchUploadZone } from '@/components/batch/BatchUploadZone'
import { BatchQueue } from '@/components/batch/BatchQueue'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { cn } from '@/lib/utils'

type AppMode = 'single' | 'batch'

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('single')

  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[88px] pb-16">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-black text-text-base text-4xl md:text-5xl uppercase tracking-tight leading-none">
            TRANSFORM ANY IMAGE
          </h1>
          <p className="font-mono text-muted text-sm mt-2">
            Upload · Convert · Compress · Download — hit exact size and format requirements
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex gap-0 mb-8 border-2 border-black w-fit shadow-neo-sm">
          {(['single', 'batch'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAppMode(mode)}
              className={cn(
                'font-mono font-bold text-sm uppercase tracking-widest px-6 py-3 transition-all duration-150',
                appMode === mode
                  ? 'bg-primary text-black'
                  : 'bg-surface text-muted hover:bg-surface-alt border-r-2 border-black last:border-r-0'
              )}
            >
              {mode === 'single' ? '⚡ Single File' : '📦 Batch Mode'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ——— SINGLE MODE ——— */}
          {appMode === 'single' && (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start"
            >
              {/* LEFT: Upload + Metadata + Analytics (60%) */}
              <div className="w-full lg:w-[60%] flex flex-col gap-6">
                <UploadZone />
                <MetadataPanel />
                <AnalyticsDashboard />
              </div>

              {/* RIGHT: Controls Panel (40%) */}
              <div className="w-full lg:w-[40%] flex flex-col gap-6">
                <ControlsPanel />
              </div>
            </motion.div>
          )}

          {/* ——— BATCH MODE ——— */}
          {appMode === 'batch' && (
            <motion.div
              key="batch"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-8"
            >
              {/* Explainer */}
              <div className="border-2 border-black bg-surface-alt p-4 flex items-start gap-3 shadow-neo-sm">
                <span className="text-2xl shrink-0">📦</span>
                <div>
                  <p className="font-mono font-bold text-text-base text-sm uppercase tracking-widest mb-1">Batch Mode</p>
                  <p className="font-mono text-muted text-xs leading-relaxed">
                    Upload multiple images at once. Set a global target size and format, then compress all in parallel. Download individually or as a single ZIP archive.
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                <div className="w-full lg:w-[55%] flex flex-col gap-6">
                  <BatchUploadZone />
                  <AnalyticsDashboard />
                </div>
                <div className="w-full lg:w-[45%]">
                  <BatchQueue />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
