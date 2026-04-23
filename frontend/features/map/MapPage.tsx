'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import type L from 'leaflet'
import { useReports } from './useReports'
import ReportModal from './ReportModal'
import type { ReportType } from './types'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function MapPage() {
  const { reports, addReport } = useReports()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // cast needed: useRef<T|null>(null) returns RefObject (readonly) in React 19 types
  const mapRef = useRef<L.Map | null>(null) as React.MutableRefObject<L.Map | null>

  function handleSubmit(type: ReportType, description?: string) {
    const center = mapRef.current?.getCenter()
    if (!center) return
    addReport(type, center.lat, center.lng, description)
    setIsModalOpen(false)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[999] h-10 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl flex items-center px-4 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-white text-xs font-bold tracking-widest">AWAS</span>
        <span className="flex-1" />
        <span className="text-zinc-500 text-[10px]">Live water outages · Cebu</span>
      </div>

      {/* Map (full screen, behind everything) */}
      <MapView reports={reports} mapRef={mapRef} />

      {/* Legend — bottom left */}
      <div className="absolute bottom-16 left-3 z-[999] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Intensity
        </p>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" />
          <span className="text-[9px] text-zinc-500">low → high</span>
        </div>
      </div>

      {/* Report count — bottom right above FAB */}
      <div className="absolute bottom-16 right-3 z-[999] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
        <p className="text-red-400 text-base font-bold leading-none">{reports.length}</p>
        <p className="text-[9px] text-zinc-500 mt-0.5">reports</p>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-3 right-3 z-[999] w-12 h-12 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-2xl text-white shadow-lg shadow-red-500/40 transition-colors"
        aria-label="Report a water issue"
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <ReportModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
