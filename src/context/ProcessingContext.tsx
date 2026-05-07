'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ProcessingMode = 'server' | 'client'

export interface FileMetadata {
  name: string
  format: string
  mimeType: string
  width: number
  height: number
  sizeBytes: number
  sizeMB: string
}

interface ProcessingContextType {
  mode: ProcessingMode
  toggleMode: () => void
  file: File | null
  fileMetadata: FileMetadata | null
  preview: string | null
  setUploadedFile: (file: File, metadata: FileMetadata, preview: string) => void
  clearFile: () => void
}

const ProcessingContext = createContext<ProcessingContextType | null>(null)

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ProcessingMode>('server')
  const [file, setFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const toggleMode = () =>
    setMode((prev) => (prev === 'server' ? 'client' : 'server'))

  const setUploadedFile = (f: File, metadata: FileMetadata, previewUrl: string) => {
    setFile(f)
    setFileMetadata(metadata)
    setPreview(previewUrl)
  }

  const clearFile = () => {
    setFile(null)
    setFileMetadata(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  return (
    <ProcessingContext.Provider
      value={{ mode, toggleMode, file, fileMetadata, preview, setUploadedFile, clearFile }}
    >
      {children}
    </ProcessingContext.Provider>
  )
}

export function useProcessing() {
  const ctx = useContext(ProcessingContext)
  if (!ctx) throw new Error('useProcessing must be used within ProcessingProvider')
  return ctx
}
