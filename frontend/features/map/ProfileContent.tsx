'use client'

/** Mock profile data displayed inside the ProfileModal. */

interface ProfileData {
  firstName: string
  lastName: string
  totalReports: number
  communityPoints: number
  dateJoined: string
}

const MOCK_PROFILE: ProfileData = {
  firstName: 'Jian Bryce',
  lastName: 'Machacon',
  totalReports: 24,
  communityPoints: 1_320,
  dateJoined: 'January 15, 2025',
}

export default function ProfileContent() {
  const { firstName, lastName, totalReports, communityPoints, dateJoined } =
    MOCK_PROFILE

  const initial = firstName.charAt(0).toUpperCase()
  const fullName = `${firstName} ${lastName}`

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-8 h-full">
      {/* ── Avatar ── */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white/10">
        <span className="text-3xl font-bold text-white select-none">
          {initial}
        </span>
      </div>

      {/* ── Name ── */}
      <h3 className="text-white text-lg font-semibold tracking-wide text-center">
        {fullName}
      </h3>

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
