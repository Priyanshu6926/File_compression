'use client'

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { motion } from 'framer-motion'

interface CompareSliderProps {
  originalUrl: string
  compressedUrl: string
  originalSize: number
  compressedSize: number
}

function SizeLabel({ label, size, variant }: { label: string; size: number; variant: 'original' | 'compressed' }) {
  const kb = (size / 1024).toFixed(1)
  return (
    <div
      className={`absolute bottom-3 ${variant === 'original' ? 'left-3' : 'right-3'} z-10 flex flex-col items-${variant === 'original' ? 'start' : 'end'}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest bg-black/80 text-white px-2 py-0.5">
        {label}
      </span>
      <span className={`font-mono font-bold text-sm px-2 py-0.5 ${variant === 'original' ? 'bg-error text-black' : 'bg-success text-black'}`}>
        {kb} KB
      </span>
    </div>
  )
}

export function CompareSlider({ originalUrl, compressedUrl, originalSize, compressedSize }: CompareSliderProps) {
  const savedPct = Math.round((1 - compressedSize / originalSize) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-3"
    >
      {/* Savings badge */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-muted text-xs uppercase tracking-widest">Before / After</p>
        {savedPct > 0 && (
          <span className="font-mono font-black text-success text-sm border-2 border-success px-2 py-0.5 shadow-neo-success">
            ↓ {savedPct}% saved
          </span>
        )}
      </div>

      {/* Slider */}
      <div className="relative border-2 border-black overflow-hidden" style={{ borderRadius: 0 }}>
        <ReactCompareSlider
          itemOne={
            <div className="relative w-full h-full">
              <ReactCompareSliderImage src={originalUrl} alt="Original" style={{ objectFit: 'contain' }} />
              <SizeLabel label="Original" size={originalSize} variant="original" />
            </div>
          }
          itemTwo={
            <div className="relative w-full h-full">
              <ReactCompareSliderImage src={compressedUrl} alt="Compressed" style={{ objectFit: 'contain' }} />
              <SizeLabel label="Compressed" size={compressedSize} variant="compressed" />
            </div>
          }
          style={{ width: '100%', height: 260 }}
          handle={
            <div className="flex flex-col items-center gap-0">
              <div className="w-0.5 h-full bg-primary absolute top-0 left-1/2 -translate-x-1/2" />
              <div className="w-8 h-8 border-2 border-black bg-primary flex items-center justify-center shadow-neo-sm cursor-col-resize z-10">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <path d="M7 4l-4 6 4 6M13 4l4 6-4 6" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
                </svg>
              </div>
            </div>
          }
        />
      </div>

      <p className="font-mono text-muted text-[10px] text-center tracking-widest uppercase">
        Drag the slider to compare
      </p>
    </motion.div>
  )
}
