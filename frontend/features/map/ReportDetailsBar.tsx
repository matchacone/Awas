'use client'

import type { Report } from './types'
import { X } from '@phosphor-icons/react'

type Props = {
  report: Report
  onClose: () => void
}

export default function ReportDetailsBar({ report, onClose }: Props) {
  const statusLabel = report.type === 'outage' ? 'Critical' : 'In Progress'
  const statusClasses =
    report.type === 'outage'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-amber-500/20 text-amber-400'

  return (
    <div className="h-full w-80 shrink-0 bg-gray-700/65 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-bold uppercase tracking-widest">
            Report Details
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusClasses}`}
          >
            {statusLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Close report details"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-white text-xs font-medium">
            {report.type === 'outage' ? 'No Water' : 'Low Pressure'}
          </p>
          {report.description ? (
            <p className="text-zinc-400 text-[11px]">{report.description}</p>
          ) : (
            <p className="text-zinc-500 text-[11px]">No description provided.</p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Timestamp
          </p>
          <p className="text-zinc-300 text-xs">
            {new Date(report.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Location
          </p>
          <p className="text-zinc-300 text-xs">
            📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  )
}
