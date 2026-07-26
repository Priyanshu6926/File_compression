'use client'

import { useCallback, useRef, useState, DragEvent } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { isFormatSupported, extractImageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'

type UploadState = 'idle' | 'dragover' | 'loading' | 'error'

const SUPPORTED_EXTENSIONS = '.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.tiff,.tif,.svg,.cr2,.nef,.arw,.dng,.raf,.rw2'

export function UploadZone() {
  const { setUploadedFile, clearFile, file: currentFile, preview } = useAppStore()
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!isFormatSupported(file)) {
      setState('error')
      setError(`Format not supported: ${file.name.split('.').pop()?.toUpperCase()}. Accepted: HEIC, RAW, WEBP, PNG, JPG, SVG, TIFF`)
      return
    }
    setState('loading')
    setError(null)
    try {
      const metadata = await extractImageMetadata(file)
      const previewUrl = URL.createObjectURL(file)
      setUploadedFile(file, metadata, previewUrl)
      setState('idle')
    } catch {
      setState('error')
      setError('Could not read file. Please try another image.')
    }
  }, [setUploadedFile])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState('idle')
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }, [processFile])

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setState('dragover') }
  const onDragLeave = () => setState('idle')
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) processFile(picked)
  }

  // If file is uploaded — show preview state
  if (currentFile && preview) {
    return (
      <div className="relative shadow-neo-secondary">
        <div className="border-2 border-black bg-surface p-6 rounded">
          <div className="flex flex-col items-center gap-4">
            {/* Thumbnail */}
            <div className="border-2 border-black overflow-hidden bg-base" style={{ maxWidth: 200, maxHeight: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded image preview"
                className="object-contain w-full h-full"
                style={{ maxWidth: 200, maxHeight: 200 }}
              />
            </div>
            {/* Replace button */}
            <button
              onClick={() => { clearFile(); setState('idle') }}
              className="font-mono text-xs text-muted border-2 border-black px-3 py-1 hover:bg-surface-alt transition-colors"
              aria-label="Remove uploaded file and upload a new one"
            >
              REPLACE FILE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative shadow-neo-secondary group">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — drag and drop or click to browse"
        className={cn(
          'bg-surface rounded min-h-[320px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ease-out',
          state === 'idle' && 'border-dashed border-2 border-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-sm hover:bg-surface-alt',
          state === 'dragover' && 'border-4 border-primary scale-[1.02] bg-primary/10 shadow-neo-primary',
          state === 'loading' && 'border-2 border-success',
          state === 'error' && 'border-2 border-error'
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS}
          className="sr-only"
          onChange={onInputChange}
          aria-hidden="true"
        />

        {state === 'loading' ? (
          <p className="font-mono text-success text-sm animate-pulse font-bold tracking-widest flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin"></span>
            READING FILE...
          </p>
        ) : (
          <>
            {/* Upload icon */}
            <div className="w-20 h-20 mb-2 bg-base border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-2 group-hover:shadow-[4px_8px_0px_0px_#000] transition-all duration-300">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v13M7 8l5-5 5 5M5 19h14" stroke="#f5d547" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>

            <p className="font-black text-primary text-2xl uppercase tracking-tight text-center px-4">
              DROP FILES HERE
            </p>
            <p className="font-mono text-muted text-sm">or click to browse</p>

            {error ? (
              <p role="alert" className="font-mono text-error text-xs text-center px-6 max-w-sm mt-4 font-bold border-2 border-error p-2 bg-[#ff5c5c]/10">
                {error}
              </p>
            ) : (
              <p className="font-mono text-muted text-xs tracking-widest mt-4">
                HEIC · RAW · WEBP · PNG · JPG · SVG · TIFF
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
