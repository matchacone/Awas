'use client'

import { X } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'
import type { Report } from './types'
import FacebookFeed from './FacebookFeed'

interface UpdatesModalProps {
  onClose: () => void
  reports: Report[]
}

type UpdateStatus = 'critical' | 'in-progress'

/** Classify a report as critical or in-progress based on its type. */
function getUpdateStatus(report: Report): UpdateStatus {
  // outage = no water → critical
  // low_pressure = degraded service → in progress
  return report.type === 'outage' ? 'critical' : 'in-progress'
}

export default function UpdatesModal({ onClose, reports }: UpdatesModalProps) {

  const [filter, setFilter] = useState<'all' | 'critical' | 'in-progress'>('all')

  // Tag every report with its update status, then filter
  const filteredReports = useMemo(() => {
    const tagged = reports.map(r => ({ ...r, status: getUpdateStatus(r) }))
    if (filter === 'all') return tagged
    return tagged.filter(r => r.status === filter)
  }, [reports, filter])

  return (
    <div className="h-full w-96 shrink-0 bg-gray-700/65 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
        <h2 className="text-white text-sm font-bold uppercase tracking-widest">
          MCWD Updates
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Close updates"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <FacebookFeed />
      </div>
    </div>
  )
}
