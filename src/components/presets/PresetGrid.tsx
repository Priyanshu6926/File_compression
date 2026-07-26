'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRESETS, PRESET_CATEGORIES, type Preset } from '@/lib/presets'
import { cn } from '@/lib/utils'

interface PresetGridProps {
  onApply: (preset: Preset) => void
}

export function PresetGrid({ onApply }: PresetGridProps) {
  const [activeCategory, setActiveCategory] = useState(PRESET_CATEGORIES[0])
  const [applied, setApplied] = useState<string | null>(null)

  const filtered = PRESETS.filter((p) => p.category === activeCategory)

  const handleApply = (preset: Preset) => {
    onApply(preset)
    setApplied(preset.id)
    setTimeout(() => setApplied(null), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'font-mono text-xs px-3 py-1.5 border-2 border-black uppercase tracking-widest transition-all duration-150',
              activeCategory === cat
                ? 'bg-primary text-black font-bold shadow-neo-sm -translate-y-0.5 -translate-x-0.5'
                : 'bg-surface text-muted hover:bg-surface-alt hover:-translate-y-0.5'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-2 gap-3"
        >
          {filtered.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => handleApply(preset)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative border-2 border-black p-3 text-left transition-all duration-150 group',
                applied === preset.id
                  ? 'bg-success shadow-neo-success'
                  : 'bg-surface hover:bg-surface-alt hover:shadow-neo-sm'
              )}
            >
              {/* Badge */}
              {preset.badge && (
                <span className="absolute top-2 right-2 font-mono font-black text-[9px] bg-primary text-black px-1.5 py-0.5 border border-black uppercase tracking-widest">
                  {preset.badge}
                </span>
              )}

              <div className="flex items-start gap-2">
                <span className="text-xl leading-none mt-0.5">{preset.emoji}</span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      'font-mono font-bold text-xs uppercase tracking-tight leading-tight',
                      applied === preset.id ? 'text-black' : 'text-text-base'
                    )}
                  >
                    {applied === preset.id ? '✓ Applied!' : preset.name}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[10px] mt-1 leading-tight',
                      applied === preset.id ? 'text-black/70' : 'text-muted'
                    )}
                  >
                    {preset.description}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
