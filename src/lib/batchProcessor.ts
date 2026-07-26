import JSZip from 'jszip'
import { useBatchStore } from '@/store/useBatchStore'
import { useAnalyticsStore } from '@/store/useAnalyticsStore'

interface BatchOptions {
  targetSizeKB: number
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff'
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'entropy'
}

const MAX_CONCURRENT = 3

export async function runBatchCompression(options: BatchOptions): Promise<void> {
  const { items, updateItem, setProcessing } = useBatchStore.getState()
  const { addRecord } = useAnalyticsStore.getState()

  const queued = items.filter((i) => i.status === 'queued')
  if (queued.length === 0) return

  setProcessing(true)

  // Process in chunks of MAX_CONCURRENT to avoid overwhelming the server
  for (let i = 0; i < queued.length; i += MAX_CONCURRENT) {
    const chunk = queued.slice(i, i + MAX_CONCURRENT)

    await Promise.all(
      chunk.map(async (item) => {
        updateItem(item.id, { status: 'processing' })

        try {
          const formData = new FormData()
          formData.append('file', item.file)
          formData.append('targetSizeKB', String(options.targetSizeKB))
          formData.append('format', options.format)
          if (options.width) formData.append('width', String(options.width))
          if (options.height) formData.append('height', String(options.height))
          if (options.crop) formData.append('crop', options.crop)

          const res = await fetch('/api/compress', { method: 'POST', body: formData })
          if (!res.ok) throw new Error('Compression failed')

          const blob = await res.blob()
          const resultUrl = URL.createObjectURL(blob)
          const resultSize = Number(res.headers.get('X-New-Size'))

          updateItem(item.id, { status: 'done', resultUrl, resultSize })

          addRecord({
            filename: item.file.name,
            format: options.format,
            originalSize: item.originalSize,
            compressedSize: resultSize,
            savedBytes: item.originalSize - resultSize,
            ratio: Math.round((1 - resultSize / item.originalSize) * 100),
          })
        } catch (err) {
          updateItem(item.id, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      })
    )
  }

  setProcessing(false)
}

export async function downloadAllAsZip(format: string): Promise<void> {
  const { items } = useBatchStore.getState()
  const done = items.filter((i) => i.status === 'done' && i.resultUrl)
  if (done.length === 0) return

  const zip = new JSZip()
  const ext = format === 'jpeg' ? 'jpg' : format

  await Promise.all(
    done.map(async (item) => {
      const res = await fetch(item.resultUrl!)
      const blob = await res.blob()
      const baseName = item.file.name.replace(/\.[^.]+$/, '')
      zip.file(`compressed-${baseName}.${ext}`, blob)
    })
  )

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `picsize-pro-batch-${Date.now()}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
