import { create } from 'zustand'

export interface BatchFileItem {
  id: string
  file: File
  preview: string
  status: 'queued' | 'processing' | 'done' | 'error'
  resultUrl?: string
  resultSize?: number
  originalSize: number
  error?: string
}

interface BatchState {
  items: BatchFileItem[]
  isProcessing: boolean
  addFiles: (files: File[]) => void
  removeItem: (id: string) => void
  clearAll: () => void
  updateItem: (id: string, partial: Partial<BatchFileItem>) => void
  setProcessing: (v: boolean) => void
}

export const useBatchStore = create<BatchState>((set) => ({
  items: [],
  isProcessing: false,

  addFiles: (files) => {
    const newItems: BatchFileItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      status: 'queued',
      originalSize: f.size,
    }))
    set((s) => ({ items: [...s.items, ...newItems] }))
  },

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  clearAll: () =>
    set((s) => {
      s.items.forEach((i) => {
        URL.revokeObjectURL(i.preview)
        if (i.resultUrl) URL.revokeObjectURL(i.resultUrl)
      })
      return { items: [] }
    }),

  updateItem: (id, partial) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...partial } : i)),
    })),

  setProcessing: (v) => set({ isProcessing: v }),
}))
