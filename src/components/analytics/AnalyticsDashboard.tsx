'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAnalyticsStore } from '@/store/useAnalyticsStore'
import { NeoButton } from '@/components/ui/NeoButton'

const COLORS = ['#f5d547', '#f8a398', '#17cf97', '#a89891', '#ff5c5c']

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-2 border-black bg-surface-alt p-3 flex flex-col gap-1">
      <span className="font-mono text-muted text-[10px] uppercase tracking-widest">{label}</span>
      <span className="font-black text-primary text-xl leading-none">{value}</span>
      {sub && <span className="font-mono text-muted text-[10px]">{sub}</span>}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="border-2 border-black bg-surface p-2 shadow-neo-sm">
      <p className="font-mono text-text-base text-xs font-bold truncate max-w-[120px]">{d.name}</p>
      <p className="font-mono text-primary text-xs">Saved: {(d.saved / 1024).toFixed(1)} KB</p>
      <p className="font-mono text-success text-xs">Ratio: {d.ratio}%</p>
    </div>
  )
}

export function AnalyticsDashboard() {
  const { records, totalSaved, clearRecords } = useAnalyticsStore()

  if (records.length === 0) return null

  const chartData = records.slice(0, 8).map((r, i) => ({
    name: r.filename.length > 12 ? r.filename.slice(0, 12) + '…' : r.filename,
    saved: r.savedBytes,
    ratio: r.ratio,
    fill: COLORS[i % COLORS.length],
  }))

  const avgRatio = Math.round(records.reduce((a, r) => a + r.ratio, 0) / records.length)
  const totalOriginal = records.reduce((a, r) => a + r.originalSize, 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35 }}
        className="relative shadow-neo-black"
      >
        <div className="border-2 border-black bg-surface">
          {/* Header */}
          <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-surface-alt">
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <h3 className="font-black text-text-base text-sm uppercase tracking-tight">
                Session Analytics
              </h3>
              <span className="font-mono text-muted text-[10px] border border-black px-1.5">
                {records.length} ops
              </span>
            </div>
            <NeoButton variant="ghost" className="text-xs px-2 py-1" onClick={clearRecords}>
              Clear
            </NeoButton>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Stat boxes */}
            <div className="grid grid-cols-3 gap-2">
              <StatBox
                label="Total Saved"
                value={totalSaved >= 1024 * 1024
                  ? `${(totalSaved / (1024 * 1024)).toFixed(1)}MB`
                  : `${(totalSaved / 1024).toFixed(0)}KB`}
                sub="across all files"
              />
              <StatBox
                label="Avg Ratio"
                value={`${avgRatio}%`}
                sub="size reduction"
              />
              <StatBox
                label="Files"
                value={String(records.length)}
                sub={`${(totalOriginal / 1024).toFixed(0)}KB total in`}
              />
            </div>

            {/* Bar chart */}
            <div>
              <p className="font-mono text-muted text-[10px] uppercase tracking-widest mb-2">
                KB saved per file
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#a89891' }}
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#a89891' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1024).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,213,71,0.1)' }} />
                  <Bar dataKey="saved" radius={0} maxBarSize={32}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="#000" strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent records */}
            <div>
              <p className="font-mono text-muted text-[10px] uppercase tracking-widest mb-2">Recent</p>
              <div className="flex flex-col divide-y divide-black/20 max-h-32 overflow-y-auto">
                {records.slice(0, 6).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1.5 text-[10px] font-mono">
                    <span className="text-text-base truncate max-w-[140px]">{r.filename}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted">{(r.originalSize / 1024).toFixed(0)}→{(r.compressedSize / 1024).toFixed(0)} KB</span>
                      <span className="text-success font-bold">↓{r.ratio}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
