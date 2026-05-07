import { TrustHeader } from '@/components/layout/TrustHeader'
import { UploadZone } from '@/components/upload/UploadZone'
import { MetadataPanel } from '@/components/upload/MetadataPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-base flex flex-col">
      <TrustHeader />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 pt-[100px] pb-12">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-black text-text-base text-4xl md:text-5xl uppercase tracking-tight leading-none">
            TRANSFORM ANY IMAGE
          </h1>
          <p className="font-mono text-muted text-sm mt-2">
            Upload · Convert · Compress · Download — hit exact size and format requirements
          </p>
        </div>

        {/* Main grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT: Upload + Metadata (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <UploadZone />
            <MetadataPanel />
          </div>

          {/* RIGHT: Controls Panel (40%) — placeholder until Phase 2 */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            <div className="relative shadow-neo-sm">
              <div className="border-2 border-black bg-surface p-6">
                <p className="font-mono text-muted text-xs uppercase tracking-widest mb-4">
                  CONVERSION CONTROLS
                </p>
                <p className="font-mono text-muted text-xs">
                  Target format, compression, and resize options — Phase 2
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
