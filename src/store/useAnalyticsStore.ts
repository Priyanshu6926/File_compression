import { create } from 'zustand'

export interface CompressionRecord {
  id: string
  filename: string
  format: string
  originalSize: number
  compressedSize: number
  savedBytes: number
  ratio: number
  timestamp: number
}

interface AnalyticsState {
  records: CompressionRecord[]
  totalSaved: number
  addRecord: (r: Omit<CompressionRecord, 'id' | 'timestamp'>) => void
  clearRecords: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  records: [],
  totalSaved: 0,

  addRecord: (r) => {
    const record: CompressionRecord = {
      ...r,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    set((s) => ({
      records: [record, ...s.records].slice(0, 50), // keep last 50
      totalSaved: s.totalSaved + r.savedBytes,
    }))
  },

  clearRecords: () => set({ records: [], totalSaved: 0 }),
}))
