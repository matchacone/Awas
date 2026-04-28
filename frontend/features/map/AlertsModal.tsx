'use client'

import { X } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'
import type { Report } from './types'

interface AlertsModalProps {
  onClose: () => void
  reports: Report[]
}

type AlertStatus = 'critical' | 'in-progress'

/** Classify a report as critical or in-progress based on its type. */
function getAlertStatus(report: Report): AlertStatus {
  // outage = no water → critical
  // low_pressure = degraded service → in progress
  return report.type === 'outage' ? 'critical' : 'in-progress'
}

export default function AlertsModal({ onClose, reports }: AlertsModalProps) {

  const [filter, setFilter] = useState<'all' | 'critical' | 'in-progress'>('all')

  // Tag every report with its alert status, then filter
  const filteredReports = useMemo(() => {
    const tagged = reports.map(r => ({ ...r, status: getAlertStatus(r) }))
    if (filter === 'all') return tagged
    return tagged.filter(r => r.status === filter)
  }, [reports, filter])

  return (
    <div className="h-full w-80 shrink-0 bg-gray-700/65 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h2 className="text-white text-sm font-bold uppercase tracking-widest">
          🔔 Active Alerts
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Close alerts"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        {(['all', 'critical', 'in-progress'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              filter === value
                ? 'bg-white/15 text-white border border-white/30'
                : 'text-zinc-400 border border-white/10 hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            {value === 'all' ? 'All' : value === 'critical' ? 'Critical' : 'In Progress'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredReports.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center mt-4">No alerts match this filter.</p>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    report.status === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {report.status === 'critical' ? 'Critical' : 'In Progress'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-white text-xs font-medium">
                {report.type === 'outage' ? 'No Water' : 'Low Pressure'}
              </p>

              {report.description && (
                <p className="text-zinc-400 text-[11px]">{report.description}</p>
              )}

              <p className="text-zinc-500 text-[10px]">
                📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
