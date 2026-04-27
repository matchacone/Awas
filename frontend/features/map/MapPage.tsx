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
    <div className="w-full h-screen overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="mx-3 mt-3 z-999 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-between px-4 gap-2 shrink-0">
        <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-white font-bold tracking-widest">AWAS</span>
        </div>

        <div className="flex flex-1 items-center justify-center min-w-0">
          <nav className="flex items-center gap-4 text-[14px] font-semibold tracking-wide">
            <button className="px-2 py-1 rounded-md bg-white/10 text-white border border-white/20">
              Live Map
            </button>
            <button className="px-2 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">
              Alerts
            </button>
            <button className="px-2 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">
              Profile
            </button>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end min-w-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 rounded-md bg-transparent hover:bg-neutral-200/60 hover:text-black text-white text-[12px] font-semibold tracking-wide transition-colors ease-in-out duration-400"
            aria-label="Add report"
          >
            Add Report
          </button>
        </div>
      </div>

      <div className="relative flex-1 mt-3">
        {/* Map (full screen, behind everything) */}
        <MapView reports={reports} mapRef={mapRef} />

        {/* Legend — bottom left */}
        <div className="absolute bottom-16 left-3 z-999">
        <div className = "flex flex-col space-y-4">
          <div className = "bg-white/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
            <p className = "text-[12px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              Issue Type
            </p>

            <div className = "flex flex-col space-y-2 text-black/80 text-[12px]">
              <div className = "flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className = "w-2.5 h-2.5 rounded-full bg-red-600" />
                  <p>No Water</p>
                </div>

                <p className = "text-[10px] text-gray-400">114</p>
              </div>

              <div className = "flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className = "w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <p>Low Pressure</p>
                </div>

                <p className = "text-[10px] text-gray-400">34</p>
              </div>
              
              <div className = "flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className = "w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <p>Pipe Leak</p>
                </div>

                <p className = "text-[10px] text-gray-400">34</p>
              </div>
              
              <div className = "flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className = "w-2.5 h-2.5 rounded-full bg-amber-950" />
                  <p>Low Pressure</p>
                </div>

                <p className = "text-[10px] text-gray-400">8</p>
              </div>
            </div>
          </div>
          
          <div className = "bg-white/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
            <p className = "text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              Severity
            </p>

            <div className="flex flex-col space-y-1.5 text-black/80 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <p>High</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <p>Medium</p>
              </div>
              
              <div className = "flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <p>Low</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Report count — bottom right above FAB */}
        {/*<div className="absolute bottom-32 right-3 z-999 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
          <p className="text-red-400 text-base font-bold leading-none">{reports.length}</p>
          <p className="text-[9px] text-zinc-500 mt-0.5">reports</p>
        </div>*/}

      </div>

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
