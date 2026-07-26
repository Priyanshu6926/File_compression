import { create } from 'zustand'

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

interface AppState {
  mode: ProcessingMode
  toggleMode: () => void

  file: File | null
  fileMetadata: FileMetadata | null
  preview: string | null

  setUploadedFile: (file: File, metadata: FileMetadata, preview: string) => void
  clearFile: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'server',
  toggleMode: () =>
    set((s) => ({ mode: s.mode === 'server' ? 'client' : 'server' })),

  file: null,
  fileMetadata: null,
  preview: null,

  setUploadedFile: (file, metadata, previewUrl) =>
    set({ file, fileMetadata: metadata, preview: previewUrl }),

  clearFile: () => {
    const { preview } = get()
    if (preview) URL.revokeObjectURL(preview)
    set({ file: null, fileMetadata: null, preview: null })
  },
}))
