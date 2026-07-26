'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBatchStore } from '@/store/useBatchStore'
import { runBatchCompression, downloadAllAsZip } from '@/lib/batchProcessor'
import { NeoButton } from '@/components/ui/NeoButton'
import { NeoInput } from '@/components/ui/NeoInput'
import { cn } from '@/lib/utils'

const statusIcon: Record<string, string> = {
  queued: '⏳',
  processing: '⚙️',
  done: '✅',
  error: '❌',
}

const statusColor: Record<string, string> = {
  queued: 'text-muted',
  processing: 'text-primary animate-pulse',
  done: 'text-success',
  error: 'text-error',
}

export function BatchQueue() {
  const { items, removeItem, clearAll, isProcessing } = useBatchStore()
  const [targetSize, setTargetSize] = useState('200')
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp' | 'avif' | 'tiff'>('jpeg')

  const doneCount = items.filter((i) => i.status === 'done').length
  const totalSaved = items
    .filter((i) => i.status === 'done' && i.resultSize !== undefined)
    .reduce((acc, i) => acc + (i.originalSize - (i.resultSize ?? 0)), 0)

  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Settings bar */}
      <div className="border-2 border-black bg-surface p-4 flex flex-wrap gap-4 items-end shadow-neo-sm">
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="font-mono text-muted text-xs uppercase tracking-widest">Max Size (KB)</label>
          <NeoInput
            type="number"
            min="10"
            value={targetSize}
            onChange={(e) => setTargetSize(e.target.value)}
            placeholder="200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-muted text-xs uppercase tracking-widest">Format</label>
          <div className="flex flex-wrap gap-1">
            {(['jpeg', 'png', 'webp', 'avif'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'border-2 border-black font-mono text-xs px-3 py-2 uppercase transition-all duration-150',
                  format === f
                    ? 'bg-primary text-black font-bold shadow-neo-sm -translate-y-0.5 -translate-x-0.5'
                    : 'bg-surface-alt text-muted hover:bg-surface'
                )}
              >
                {f === 'jpeg' ? 'jpg' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {doneCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 border-2 border-black bg-success/10 px-4 py-2"
        >
          <span className="font-mono text-success text-xs font-bold uppercase tracking-widest">
            ✅ {doneCount}/{items.length} done
          </span>
          <span className="font-mono text-muted text-xs">
            Saved {(totalSaved / 1024).toFixed(1)} KB total
          </span>
        </motion.div>
      )}

      {/* File list */}
      <div className="flex flex-col divide-y-2 divide-black border-2 border-black bg-surface shadow-neo-secondary">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={item.file.name}
                className="w-10 h-10 object-cover border-2 border-black shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-text-base text-xs truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-muted text-[10px]">
                    {(item.originalSize / 1024).toFixed(1)} KB
                  </span>
                  {item.resultSize !== undefined && item.status === 'done' && (
                    <>
                      <span className="text-muted text-[10px]">→</span>
                      <span className="font-mono text-success text-[10px] font-bold">
                        {(item.resultSize / 1024).toFixed(1)} KB
                      </span>
                    </>
                  )}
                  {item.error && (
                    <span className="font-mono text-error text-[10px]">{item.error}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <span className={cn('font-mono text-sm', statusColor[item.status])}>
                {item.status === 'processing'
                  ? <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                  : statusIcon[item.status]
                }
              </span>

              {/* Download individual */}
              {item.status === 'done' && item.resultUrl && (
                <a
                  href={item.resultUrl}
                  download={`compressed-${item.file.name.replace(/\.[^.]+$/, '')}.${format === 'jpeg' ? 'jpg' : format}`}
                  className="font-mono text-[10px] text-black bg-success border-2 border-black px-2 py-1 hover:bg-success/80 transition-colors"
                >
                  DL
                </a>
              )}

              {/* Remove */}
              {!isProcessing && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-mono text-muted text-xs border-2 border-black px-2 py-1 hover:bg-error hover:text-black transition-colors shrink-0"
                >
                  ×
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <NeoButton
          variant="success"
          className="flex-1 py-3 text-base"
          onClick={() => runBatchCompression({ targetSizeKB: Number(targetSize), format })}
          disabled={isProcessing || items.every((i) => i.status !== 'queued')}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              PROCESSING…
            </span>
          ) : (
            `⚡ COMPRESS ALL (${items.filter(i => i.status === 'queued').length})`
          )}
        </NeoButton>

        {doneCount > 0 && (
          <NeoButton
            variant="primary"
            className="flex-1 py-3 text-base"
            onClick={() => downloadAllAsZip(format)}
          >
            📦 DOWNLOAD ZIP
          </NeoButton>
        )}

        <NeoButton
          variant="ghost"
          onClick={clearAll}
          disabled={isProcessing}
          className="px-3"
        >
          Clear
        </NeoButton>
      </div>
    </div>
  )
}
