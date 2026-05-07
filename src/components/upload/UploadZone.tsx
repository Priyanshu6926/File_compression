'use client'

import { useCallback, useRef, useState, DragEvent } from 'react'
import { useProcessing } from '@/context/ProcessingContext'
import { isFormatSupported, extractImageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'

type UploadState = 'idle' | 'dragover' | 'loading' | 'error'

const SUPPORTED_EXTENSIONS = '.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.tiff,.tif,.svg,.cr2,.nef,.arw,.dng,.raf,.rw2'

export function UploadZone() {
  const { setUploadedFile, clearFile, file: currentFile, preview } = useProcessing()
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

  const borderStyles: Record<UploadState, string> = {
    idle:     'border-dashed border-2 border-black',
    dragover: 'border-4 border-primary',
    loading:  'border-2 border-success',
    error:    'border-2 border-error',
  }

  const shadowStyles: Record<UploadState, string> = {
    idle:     '',
    dragover: 'scale-[1.01]',
    loading:  '',
    error:    '',
  }

  // If file is uploaded — show preview state
  if (currentFile && preview) {
    return (
      <div className="relative shadow-neo-secondary">
        <div className="border-2 border-black bg-surface p-6 rounded">
          <div className="flex flex-col items-center gap-4">
            {/* Thumbnail */}
            <div className="border-2 border-black overflow-hidden bg-base" style={{ maxWidth: 200, maxHeight: 200 }}>
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
          'bg-surface rounded min-h-[320px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-150',
          borderStyles[state],
          shadowStyles[state],
          state === 'dragover' && 'bg-surface-alt'
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
          <p className="font-mono text-success text-sm animate-pulse font-bold tracking-widest">READING FILE...</p>
        ) : (
          <>
            {/* Upload icon */}
            <svg className="group-hover:scale-110 transition-transform duration-200" width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v13M7 8l5-5 5 5M5 19h14" stroke="#f5d547" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>

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
