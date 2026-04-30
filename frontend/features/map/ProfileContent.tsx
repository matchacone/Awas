'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import supabase from '@/lib/supabaseClient'

export default function ProfileContent() {
  const { user } = useAuth()
  const [totalReports, setTotalReports] = useState(0)

  useEffect(() => {
    if (!user) return

    async function fetchStats() {
      const { count } = await supabase
        .from('api_outagereport')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', user!.id)
      
      if (count !== null) setTotalReports(count)
    }

    fetchStats()
  }, [user])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="text-zinc-400 text-sm">Please sign in to view your profile.</p>
      </div>
    )
  }

  const firstName = user.user_metadata?.first_name || 'Anonymous'
  const lastName = user.user_metadata?.last_name || 'User'
  const initial = firstName.charAt(0).toUpperCase()
  const fullName = `${firstName} ${lastName}`
  
  const dateJoined = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // We leave community points at 0 for now until a real point system is built
  const communityPoints = 0

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-8 h-full">
      {/* ── Avatar ── */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white/10">
        <span className="text-3xl font-bold text-white select-none">
          {initial}
        </span>
      </div>

      {/* ── Name & Email ── */}
      <div className="text-center">
        <h3 className="text-white text-lg font-semibold tracking-wide">
          {fullName}
        </h3>
        <p className="text-zinc-400 text-[11px] font-medium tracking-wide">
          {user.email}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="flex w-full justify-around rounded-xl bg-white/5 border border-white/10 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-white">{totalReports}</span>
          <span className="text-[11px] uppercase tracking-wider text-zinc-400">
            Reports
          </span>
        </div>

        <div className="w-px bg-white/10" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-white">
            {communityPoints.toLocaleString()}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-zinc-400">
            Points
          </span>
        </div>
      </div>

      {/* ── Spacer pushes date to bottom ── */}
      <div className="flex-1" />

      {/* ── Date joined ── */}
      <p className="text-zinc-500 text-xs tracking-wide">
        Joined {dateJoined}
      </p>
    </div>
  )
}

