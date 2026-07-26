'use client'

import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useBatchStore } from '@/store/useBatchStore'
import { isFormatSupported } from '@/lib/metadata'
import { cn } from '@/lib/utils'

const SUPPORTED_EXTENSIONS = '.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.tiff,.tif,.svg,.cr2,.nef,.arw,.dng,.raf,.rw2'

export function BatchUploadZone() {
  const { addFiles, items } = useBatchStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback((files: File[]) => {
    const valid = files.filter(isFormatSupported)
    if (valid.length > 0) addFiles(valid)
  }, [addFiles])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    processFiles(dropped)
  }, [processFiles])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    processFiles(picked)
    e.target.value = ''
  }

  return (
    <motion.div
      className="relative shadow-neo-secondary"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload multiple images for batch processing"
        className={cn(
          'border-dashed border-2 border-black bg-surface min-h-[160px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 hover:bg-surface-alt hover:border-primary hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-primary'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS}
          className="sr-only"
          onChange={onInputChange}
          multiple
          aria-hidden="true"
        />

        <div className="w-14 h-14 bg-base border-2 border-black flex items-center justify-center shadow-neo-sm group-hover:shadow-neo-primary transition-all">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13M7 8l5-5 5 5M5 19h14" stroke="#f5d547" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </div>

        <p className="font-black text-primary text-lg uppercase tracking-tight text-center">
          DROP MULTIPLE FILES
        </p>
        <p className="font-mono text-muted text-xs">or click to browse — select many at once</p>

        {items.length > 0 && (
          <span className="font-mono text-xs bg-primary text-black px-3 py-1 border-2 border-black font-bold">
            {items.length} file{items.length !== 1 ? 's' : ''} in queue
          </span>
        )}
      </div>
    </motion.div>
  )
}
