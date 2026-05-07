import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'

export default function Home() {
  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      {/* Main content — pushed down by fixed header */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[100px] pb-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left column — Upload (60%) */}
          <div className="flex-1 lg:w-[60%] flex flex-col gap-6">
            <h1 className="font-black text-text-base text-3xl md:text-5xl uppercase tracking-tight">
              TRANSFORM ANY IMAGE
            </h1>
            <UploadZone />
          </div>

          {/* Right column — Controls (40%) — placeholder for Plan 1.4 */}
          <div className="lg:w-[40%] flex flex-col gap-6 pt-2 md:pt-16">
            <div className="border-2 border-black bg-surface p-6 shadow-neo-sm">
              <p className="font-mono text-muted text-xs">CONTROLS PANEL — Phase 1.4</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
