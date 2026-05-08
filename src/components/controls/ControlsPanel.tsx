'use client'

import { useState } from 'react'
import { useProcessing } from '@/context/ProcessingContext'
import { NeoInput } from '@/components/ui/NeoInput'
import { NeoButton } from '@/components/ui/NeoButton'

export function ControlsPanel() {
  const { file } = useProcessing()
  const [targetSize, setTargetSize] = useState('100')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ url: string; size: number; hitFloor: boolean } | null>(null)

  const handleCompress = async () => {
    if (!file) return
    setIsProcessing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetSizeKB', targetSize)

      const res = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Compression failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const newSize = Number(res.headers.get('X-New-Size'))
      const hitFloor = res.headers.get('X-Hit-Floor') === 'true'

      setResult({ url, size: newSize, hitFloor })
    } catch (err) {
      console.error(err)
      alert('Error during compression.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative shadow-neo-sm">
        <div className="border-2 border-black bg-surface p-6">
          <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
            MAX FILE SIZE (KB)
          </p>
          <div className="flex items-center gap-2">
            <NeoInput
              type="number"
              min="10"
              value={targetSize}
              onChange={(e) => setTargetSize(e.target.value)}
              placeholder="100"
            />
            <span className="font-mono font-bold text-text-base">KB</span>
          </div>

          <NeoButton
            variant="success"
            className="w-full mt-6 text-lg py-3"
            onClick={handleCompress}
            disabled={!file || isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : '⚡ CONVERT & COMPRESS'}
          </NeoButton>
        </div>
      </div>

      {result && (
        <div className="relative shadow-neo-primary">
          <div className="border-2 border-black bg-surface p-6">
            <h3 className="font-black text-primary uppercase text-lg mb-2">RESULT</h3>
            {result.hitFloor && (
              <p className="font-mono text-error text-xs mb-4 border border-error p-2">
                WARNING: Reached minimum quality floor. Could not hit exact target size.
              </p>
            )}
            <p className="font-mono text-sm mb-4">
              New Size: <strong>{(result.size / 1024).toFixed(1)} KB</strong>
            </p>
            <a
              href={result.url}
              download={`compressed-${file?.name || 'image'}.jpg`}
              className="inline-flex items-center justify-center border-2 border-black bg-primary text-black font-mono font-bold text-sm uppercase tracking-tight px-4 py-2 w-full hover:bg-white transition-colors"
            >
              DOWNLOAD
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
