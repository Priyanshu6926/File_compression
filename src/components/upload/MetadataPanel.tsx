'use client'

import { useAppStore } from '@/store/useAppStore'

export function MetadataPanel() {
  const { fileMetadata, clearFile } = useAppStore()

  if (!fileMetadata) return null

  const rows: { label: string; value: string }[] = [
    { label: 'FILENAME',   value: fileMetadata.name },
    { label: 'FORMAT',     value: `${fileMetadata.format} (${fileMetadata.mimeType || 'unknown'})` },
    {
      label: 'DIMENSIONS',
      value: fileMetadata.width > 0
        ? `${fileMetadata.width} × ${fileMetadata.height} px`
        : 'Requires server decode',
    },
    { label: 'FILE SIZE',  value: `${fileMetadata.sizeMB} (${fileMetadata.sizeBytes.toLocaleString()} B)` },
  ]

  return (
    <div
      className="border-2 border-black bg-surface"
      role="region"
      aria-label="Uploaded file information"
    >
      {/* Header */}
      <div className="bg-primary border-b-2 border-black px-4 py-2 flex items-center justify-between">
        <h2 className="font-black text-black text-sm uppercase tracking-tight">
          FILE INFORMATION
        </h2>
        <button
          onClick={clearFile}
          className="font-mono text-black text-xs border border-black px-2 py-0.5 hover:bg-base hover:text-primary transition-colors cursor-pointer"
          aria-label="Clear uploaded file"
        >
          [×]
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y-2 divide-black">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}`}
          >
            <span className="font-mono text-muted text-xs uppercase tracking-widest w-28 shrink-0 pt-0.5">
              {row.label}
            </span>
            <span className="font-mono text-text-base text-sm break-all">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
