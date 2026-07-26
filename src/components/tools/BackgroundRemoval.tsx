'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { extractImageMetadata } from '@/lib/metadata'
import { NeoButton } from '@/components/ui/NeoButton'

type BgRemovalStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error'

const statusMessages: Record<BgRemovalStatus, string> = {
  idle: '',
  'loading-model': 'Loading AI model… (first time only)',
  processing: 'Removing background…',
  done: 'Done! Background removed.',
  error: 'Failed. Try a different image.',
}

export function BackgroundRemoval() {
  const { file, setUploadedFile } = useAppStore()
  const [status, setStatus] = useState<BgRemovalStatus>('idle')
  const [resultPreview, setResultPreview] = useState<string | null>(null)

  const handleRemove = useCallback(async () => {
    if (!file) return
    setStatus('loading-model')
    setResultPreview(null)

    try {
      // Dynamic import so the WASM bundle is only loaded on demand
      const { removeBackground } = await import('@imgly/background-removal')
      setStatus('processing')

      const resultBlob = await removeBackground(file, {
        // Force PNG output to preserve transparency
        output: { format: 'image/png', quality: 1 },
        // Use quantized model — fastest & smallest download, good quality for portraits
        model: 'isnet_quint8',
      })

      const previewUrl = URL.createObjectURL(resultBlob)
      setResultPreview(previewUrl)
      setStatus('done')

      // Replace the file in the store so compress pipeline uses the BG-removed PNG
      const newFile = new File([resultBlob], file.name.replace(/\.[^.]+$/, '_nobg.png'), {
        type: 'image/png',
      })
      const metadata = await extractImageMetadata(newFile)
      setUploadedFile(newFile, metadata, previewUrl)
    } catch (err) {
      console.error('BG removal error:', err)
      setStatus('error')
    }
  }, [file, setUploadedFile])

  if (!file) return null

  return (
    <div className="border-t-2 border-black pt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-muted text-xs uppercase tracking-widest">AI Tools</p>
        <span className="font-mono text-[10px] bg-primary text-black px-2 py-0.5 border border-black font-bold uppercase tracking-wider">
          WASM · In-Browser
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <NeoButton
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={handleRemove}
          disabled={status === 'processing' || status === 'loading-model'}
        >
          {status === 'processing' || status === 'loading-model' ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>✂️</span>
          )}
          REMOVE BACKGROUND
        </NeoButton>

        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p
                className={`font-mono text-xs text-center py-2 px-3 border-2 border-black ${
                  status === 'done'
                    ? 'bg-success/20 text-success'
                    : status === 'error'
                    ? 'bg-error/20 text-error'
                    : 'bg-surface-alt text-muted'
                }`}
              >
                {statusMessages[status]}
              </p>

              {/* Preview of result */}
              {resultPreview && status === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 border-2 border-black overflow-hidden bg-[url('/checker.svg')] bg-repeat"
                  style={{ backgroundSize: '16px 16px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultPreview}
                    alt="Background removed"
                    className="w-full max-h-40 object-contain"
                  />
                </motion.div>
              )}

              {status === 'done' && (
                <p className="font-mono text-muted text-[10px] text-center mt-2 tracking-widest uppercase">
                  Image updated — now compress it above ↑
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
