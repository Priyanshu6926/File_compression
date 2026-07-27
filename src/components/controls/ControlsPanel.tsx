'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useAnalyticsStore } from '@/store/useAnalyticsStore'
import { NeoInput } from '@/components/ui/NeoInput'
import { NeoButton } from '@/components/ui/NeoButton'
import { PresetGrid } from '@/components/presets/PresetGrid'
import { CompareSlider } from '@/components/compare/CompareSlider'
import { BackgroundRemoval } from '@/components/tools/BackgroundRemoval'
import { cn } from '@/lib/utils'
import type { Preset } from '@/lib/presets'

type Section = 'presets' | 'settings' | 'ai'

export function ControlsPanel() {
  const { file, preview } = useAppStore()
  const { addRecord } = useAnalyticsStore()

  const [activeSection, setActiveSection] = useState<Section>('settings')
  const [targetSize, setTargetSize] = useState('100')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [isSmartCrop, setIsSmartCrop] = useState(false)
  const [cropAnchor, setCropAnchor] = useState<'center' | 'top' | 'entropy'>('center')
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'pdf'>('jpeg')
  const [rotation, setRotation] = useState<number>(0)
  const [watermarkText, setWatermarkText] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    url: string
    size: number
    hitFloor: boolean
    format: string
  } | null>(null)

  const handleApplyPreset = (preset: Preset) => {
    setFormat(preset.format as 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff')
    setTargetSize(String(preset.targetSizeKB))
    setWidth(preset.width ? String(preset.width) : '')
    setHeight(preset.height ? String(preset.height) : '')
    if (preset.crop) {
      setIsSmartCrop(true)
      setCropAnchor(preset.crop)
    } else {
      setIsSmartCrop(false)
    }
    setActiveSection('settings')
  }

  const handleCompress = async () => {
    if (!file) return
    setIsProcessing(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetSizeKB', targetSize)
      formData.append('format', format)
      if (width) formData.append('width', width)
      if (height) formData.append('height', height)
      if (isSmartCrop) formData.append('crop', cropAnchor)
      if (rotation > 0) formData.append('rotation', String(rotation))
      if (watermarkText.trim()) formData.append('watermarkText', watermarkText.trim())

      const res = await fetch('/api/compress', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Compression failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const newSize = Number(res.headers.get('X-New-Size')) || blob.size
      const hitFloor = res.headers.get('X-Hit-Floor') === 'true'
      const ext = format === 'jpeg' ? 'jpg' : format

      setResult({ url, size: newSize, hitFloor, format: ext })

      // Record analytics
      addRecord({
        filename: file.name,
        format,
        originalSize: file.size,
        compressedSize: newSize,
        savedBytes: file.size - newSize,
        ratio: Math.round((1 - newSize / file.size) * 100),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Compression failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const sectionTabs: { key: Section; label: string; icon: string }[] = [
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'presets', label: 'Presets', icon: '🎯' },
    { key: 'ai', label: 'AI Tools', icon: '🤖' },
  ]

  const formatOptions = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'pdf'] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Main card */}
      <div className="relative shadow-neo-sm">
        <div className="border-2 border-black bg-surface">
          {/* Section nav */}
          <div className="flex border-b-2 border-black">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={cn(
                  'flex-1 font-mono text-xs uppercase tracking-widest py-3 px-2 transition-all duration-150 border-r-2 border-black last:border-r-0',
                  activeSection === tab.key
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface text-muted hover:bg-surface-alt'
                )}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <div className="border-2 border-black bg-error p-4 shadow-neo-sm mb-4">
                <h4 className="font-black text-black uppercase text-sm mb-1">Error</h4>
                <p className="font-mono text-black text-xs">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ——— SETTINGS section ——— */}
              {activeSection === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  {/* Format */}
                  <div>
                    <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                      Target Format & Document
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formatOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFormat(opt)}
                          className={cn(
                            'border-2 border-black font-mono text-sm px-4 py-2 uppercase transition-all duration-200',
                            format === opt
                              ? 'bg-primary text-black font-bold shadow-[4px_4px_0px_0px_#000] -translate-y-1 -translate-x-1'
                              : 'bg-surface text-text-base hover:bg-surface-alt hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#000]'
                          )}
                        >
                          {opt === 'jpeg' ? 'jpg' : opt === 'pdf' ? '📄 PDF' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target size */}
                  <div className="border-t-2 border-black pt-6">
                    <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                      Max File Size (KB)
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
                  </div>

                  {/* Dimensions & Rotation */}
                  <div className="border-t-2 border-black pt-6">
                    <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                      Resize & Rotation
                    </p>
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <label className="text-xs font-mono text-muted mb-1 block">Width (px)</label>
                        <NeoInput
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="Auto"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-mono text-muted mb-1 block">Height (px)</label>
                        <NeoInput
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Auto"
                        />
                      </div>
                    </div>

                    {/* Rotation selector */}
                    <div className="mb-4">
                      <label className="text-xs font-mono text-muted mb-2 block">Rotate Image</label>
                      <div className="flex gap-2">
                        {[0, 90, 180, 270].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => setRotation(deg)}
                            className={cn(
                              'border-2 border-black font-mono text-xs px-3 py-1',
                              rotation === deg ? 'bg-primary text-black font-bold' : 'bg-surface text-muted'
                            )}
                          >
                            {deg === 0 ? '0° (Normal)' : `${deg}°`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setIsSmartCrop(!isSmartCrop)}
                        className="w-5 h-5 border-2 border-black bg-surface flex items-center justify-center focus:outline-none"
                      >
                        {isSmartCrop && <div className="w-2.5 h-2.5 bg-primary" />}
                      </button>
                      <label
                        className="text-sm font-mono text-text-base cursor-pointer"
                        onClick={() => setIsSmartCrop(!isSmartCrop)}
                      >
                        Smart Crop (Fill exact dimensions)
                      </label>
                    </div>

                    {isSmartCrop && (
                      <div className="flex gap-2">
                        {(['center', 'top', 'entropy'] as const).map((anchor) => (
                          <button
                            key={anchor}
                            onClick={() => setCropAnchor(anchor)}
                            className={cn(
                              'text-xs font-mono px-2 py-1 border-2 border-black capitalize',
                              cropAnchor === anchor ? 'bg-primary text-black' : 'bg-surface text-muted'
                            )}
                          >
                            {anchor === 'entropy' ? 'Face-aware' : anchor.charAt(0).toUpperCase() + anchor.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Watermarking */}
                  <div className="border-t-2 border-black pt-6">
                    <p className="font-mono text-muted text-xs uppercase tracking-widest mb-2">
                      ✍️ Add Text Watermark
                    </p>
                    <NeoInput
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL / SAMPLE"
                    />
                  </div>

                  {/* AI Background Removal inline */}
                  <BackgroundRemoval />
                </motion.div>
              )}

              {/* ——— PRESETS section ——— */}
              {activeSection === 'presets' && (
                <motion.div
                  key="presets"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                    Click a preset to auto-fill all settings
                  </p>
                  <PresetGrid onApply={handleApplyPreset} />
                </motion.div>
              )}

              {/* ——— AI TOOLS section ——— */}
              {activeSection === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-4"
                >
                  <div className="border-2 border-black bg-surface-alt p-3">
                    <p className="font-mono text-muted text-xs uppercase tracking-widest mb-1">How AI Tools Work</p>
                    <p className="font-mono text-text-base text-xs leading-relaxed">
                      All AI processing runs <strong>100% in your browser</strong> using WebAssembly. No image is sent to any server. Your file stays private.
                    </p>
                  </div>
                  <BackgroundRemoval />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compress button — always visible */}
          <div className="px-6 pb-6">
            <NeoButton
              variant="success"
              className="w-full mt-2 text-lg py-3 relative overflow-hidden"
              onClick={handleCompress}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  PROCESSING...
                </span>
              ) : (
                '⚡ CONVERT & COMPRESS'
              )}
            </NeoButton>
          </div>
        </div>
      </div>

      {/* Result + Compare slider */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="relative shadow-neo-primary"
          >
            <div className="border-2 border-black bg-surface p-6 flex flex-col gap-4">
              <h3 className="font-black text-primary uppercase text-lg">Result</h3>

              {result.hitFloor && (
                <p className="font-mono text-error text-xs border border-error p-2">
                  WARNING: Reached minimum quality floor. Could not hit exact target size.
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="font-mono text-sm">
                  New Size: <strong>{(result.size / 1024).toFixed(1)} KB</strong>
                </p>
                {file && (
                  <p className="font-mono text-success text-xs font-bold">
                    ↓ {Math.round((1 - result.size / file.size) * 100)}% saved
                  </p>
                )}
              </div>

              <a
                href={result.url}
                download={`compressed-${file?.name || 'image'}.${result.format}`}
                className="inline-flex items-center justify-center border-2 border-black bg-primary text-black font-mono font-bold text-sm uppercase tracking-tight px-4 py-3 w-full hover:bg-white transition-colors"
              >
                ⬇ DOWNLOAD {result.format.toUpperCase()}
              </a>

              {/* Before/After comparison */}
              {preview && result.format !== 'pdf' && (
                <CompareSlider
                  originalUrl={preview}
                  compressedUrl={result.url}
                  originalSize={file?.size ?? 0}
                  compressedSize={result.size}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
