'use client'

import { X } from '@phosphor-icons/react'
import ProfileContent from './ProfileContent'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  return (
    <div className="h-full w-96 shrink-0 bg-gray-700/65 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
        <h2 className="text-white text-sm font-bold uppercase tracking-widest">
          Profile
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Close profile"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ProfileContent />
      </div>
    </div>
  )
}
