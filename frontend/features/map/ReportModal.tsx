'use client'

import { useState } from 'react'
import type { ReportType } from './types'

type Props = {
  onClose: () => void
  onSubmit: (type: ReportType, description?: string) => void
}

export default function ReportModal({ onClose, onSubmit }: Props) {
  const [type, setType] = useState<ReportType | null>(null)
  const [description, setDescription] = useState('')

  function handleSubmit() {
    if (!type) return
    onSubmit(type, description.trim() || undefined)
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1117] border border-white/10 rounded-xl w-[90%] max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-sm font-bold text-white">Report a Water Issue</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Type</p>
            <div className="flex gap-2">
              <button
                onClick={() => setType('outage')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'outage'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                🚱 No Water
              </button>
              <button
                onClick={() => setType('low_pressure')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'low_pressure'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-400'
                    : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                💧 Low Pressure
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Location</p>
            <div className="h-9 bg-white/[0.06] border border-white/10 rounded-lg flex items-center px-3 gap-2">
              <span className="text-sm">📍</span>
              <span className="text-xs text-zinc-400">Using current map center</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Description{' '}
              <span className="font-normal normal-case tracking-normal">
                (optional)
              </span>
            </p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. No water since 6am..."
              rows={2}
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-white/20"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!type}
            className="h-10 bg-red-500 rounded-lg text-white text-xs font-bold tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-400 transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  )
}
