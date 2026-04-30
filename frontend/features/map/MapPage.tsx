'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import type L from 'leaflet'
import { useReports } from './useReports'
import ReportModal from './ReportModal'
import AlertsModal from './AlertsModal'
import UpdatesModal from './UpdatesModal'
import ReportDetailsBar from './ReportDetailsBar'
import type { ReportType } from './types'
import { DropIcon, PlusIcon } from '@phosphor-icons/react'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function MapPage() {
  const { reports, addReport, addComment, addReaction } = useReports()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  // cast needed: useRef<T|null>(null) returns RefObject (readonly) in React 19 types
  const mapRef = useRef<L.Map | null>(null) as React.MutableRefObject<L.Map | null>

  function handleSubmit(type: ReportType, description?: string) {
    const center = mapRef.current?.getCenter()
    if (!center) return
    addReport(type, center.lat, center.lng, description)
    setIsModalOpen(false)
  }

  const selectedReport = reports.find(report => report.id === selectedReportId)

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-8 z-999 h-10 bg-gray-700/50 backdrop-blur-sm flex items-center justify-between gap-2 shrink-0">
        <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
          <DropIcon />
          <span className="text-white font-bold tracking-widest">AWAS</span>
        </div>

        <div className="flex flex-1 items-center justify-center min-w-0">
          <nav className="flex items-center gap-4 text-[14px] font-semibold tracking-wide">
            <button className="px-2 py-1 rounded-md bg-white/10 text-white border border-white/20">
              Live Map
            </button>
            <button
              onClick={() => setIsAlertsOpen(prev => !prev)}
              className={`px-2 py-1 rounded-md transition-colors ${
                isAlertsOpen
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setIsUpdatesOpen(prev => !prev)}
              className={`px-2 py-1 rounded-md transition-colors ${
                isUpdatesOpen
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Updates
            </button>
            <button className="px-2 py-1 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">
              Profile
            </button>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end min-w-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-transparent hover:bg-neutral-200/60 hover:text-black text-white text-[14px] font-semibold tracking-wide transition-colors ease-in-out duration-400"
            aria-label="Add report"
          >
            <PlusIcon />
            Add Report
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map area — shrinks when alerts panel is open */}
        <div className="relative flex-1 transition-all duration-300 ease-in-out">
          {/* Map (full screen, behind everything) */}
          <MapView
            reports={reports}
            mapRef={mapRef}
            onReportSelect={report => setSelectedReportId(report.id)}
          />

          {/* Legend — bottom left */}
          <div className="absolute bottom-16 left-3 z-999">
            <div className = "flex flex-col space-y-4">
              <div className = "bg-neutral-600/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
                <p className = "text-[12px] font-bold uppercase tracking-widest text-white mb-1.5">
                  Issue Type
                </p>
  
                <div className = "flex flex-col space-y-2 text-white/80 text-[12px]">
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
                      <span className = "w-2.5 h-2.5 rounded-full bg-amber-900" />
                      <p>Dirty Water</p>
                    </div>

                    <p className = "text-[10px] text-gray-400">8</p>
                  </div>
                </div>
              </div>
              
              <div className = "bg-neutral-600/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
                <p className = "text-[12px] font-bold uppercase tracking-widest text-white mb-1.5">
                  Severity
                </p>
  
                <div className="flex flex-col space-y-1.5 text-white/80 text-[11px]">
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
        </div>

        {/* Report details sidebar */}
        {selectedReport && (
          <ReportDetailsBar
            report={selectedReport}
            onClose={() => setSelectedReportId(null)}
            onAddComment={description => addComment(selectedReport.id, description)}
            onAddReaction={(reactionType, commentId, user) =>
              addReaction(selectedReport.id, reactionType, user, commentId)
            }
          />
        )}

        {/* Alerts side panel — pushes map left */}
        {isAlertsOpen && (
          <AlertsModal
            onClose={() => setIsAlertsOpen(false)}
            reports={reports}
          />
        )}

        {isUpdatesOpen && (
          <UpdatesModal
            onClose={() => setIsUpdatesOpen(false)}
            reports={reports}
          />
        )}
      </div>

      {/* Report Modal (overlay — stays outside the flex row) */}
      {isModalOpen && (
        <ReportModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
