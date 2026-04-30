'use client'

import { useState, useEffect } from 'react'
import type { Report, ReportType } from './types'

const STORAGE_KEY = 'awas_reports'

const SEED_REPORTS: Report[] = [
  {
    id: 's1',
    type: 'outage',
    lat: 10.3157,
    lng: 123.8854,
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    active: true,
    comments: [
      {
        id: 'c1',
        reportId: 's1',
        user: 'Mika',
        description: 'No water since this morning near the market.',
        createdAt: new Date(Date.now() - 2_800_000).toISOString(),
      },
    ],
    reactions: [
      {
        id: 'r1',
        reactionType: 'upvote',
        reportId: 's1',
        user: 'Jules',
        createdAt: new Date(Date.now() - 2_600_000).toISOString(),
      },
      {
        id: 'r2',
        reactionType: 'upvote',
        reportId: 's1',
        commentId: 'c1',
        user: 'Ari',
        createdAt: new Date(Date.now() - 2_200_000).toISOString(),
      },
    ],
  },
  {
    id: 's2',
    type: 'low_pressure',
    lat: 10.32,
    lng: 123.89,
    timestamp: new Date(Date.now() - 7_200_000).toISOString(),
    active: true,
    comments: [
      {
        id: 'c2',
        reportId: 's2',
        user: 'Bianca',
        description: 'Flow is weak but still usable.',
        createdAt: new Date(Date.now() - 6_900_000).toISOString(),
      },
    ],
    reactions: [
      {
        id: 'r3',
        reactionType: 'upvote',
        reportId: 's2',
        user: 'Nico',
        createdAt: new Date(Date.now() - 6_700_000).toISOString(),
      },
      {
        id: 'r4',
        reactionType: 'downvote',
        reportId: 's2',
        user: 'Ivy',
        createdAt: new Date(Date.now() - 6_200_000).toISOString(),
      },
    ],
  },
  {
    id: 's3',
    type: 'outage',
    lat: 10.31,
    lng: 123.88,
    timestamp: new Date(Date.now() - 1_800_000).toISOString(),
    active: true,
    comments: [],
    reactions: [
      {
        id: 'r5',
        reactionType: 'upvote',
        reportId: 's3',
        user: 'Ken',
        createdAt: new Date(Date.now() - 1_600_000).toISOString(),
      },
    ],
  },
  {
    id: 's4',
    type: 'outage',
    lat: 10.325,
    lng: 123.882,
    description: 'No water since 6am',
    timestamp: new Date(Date.now() - 900_000).toISOString(),
    active: true,
    comments: [
      {
        id: 'c3',
        reportId: 's4',
        user: 'Sam',
        description: 'Still dry as of 2pm.',
        createdAt: new Date(Date.now() - 600_000).toISOString(),
      },
      {
        id: 'c4',
        reportId: 's4',
        user: 'Lia',
        description: 'Neighbors also affected.',
        createdAt: new Date(Date.now() - 540_000).toISOString(),
      },
    ],
    reactions: [
      {
        id: 'r6',
        reactionType: 'upvote',
        reportId: 's4',
        user: 'Ramon',
        createdAt: new Date(Date.now() - 480_000).toISOString(),
      },
      {
        id: 'r7',
        reactionType: 'upvote',
        reportId: 's4',
        commentId: 'c3',
        user: 'Ava',
        createdAt: new Date(Date.now() - 420_000).toISOString(),
      },
    ],
  },
  {
    id: 's5',
    type: 'low_pressure',
    lat: 10.318,
    lng: 123.895,
    timestamp: new Date(Date.now() - 5_400_000).toISOString(),
    active: true,
    comments: [],
    reactions: [
      {
        id: 'r8',
        reactionType: 'upvote',
        reportId: 's5',
        user: 'Jo',
        createdAt: new Date(Date.now() - 5_100_000).toISOString(),
      },
    ],
  },
  {
    id: 's6',
    type: 'outage',
    lat: 10.308,
    lng: 123.887,
    timestamp: new Date(Date.now() - 2_700_000).toISOString(),
    active: true,
    comments: [
      {
        id: 'c5',
        reportId: 's6',
        user: 'Toni',
        description: 'Water returns briefly then cuts off again.',
        createdAt: new Date(Date.now() - 2_400_000).toISOString(),
      },
    ],
    reactions: [
      {
        id: 'r9',
        reactionType: 'downvote',
        reportId: 's6',
        user: 'Eli',
        createdAt: new Date(Date.now() - 2_200_000).toISOString(),
      },
    ],
  },
  {
    id: 's7',
    type: 'low_pressure',
    lat: 10.33,
    lng: 123.883,
    description: 'Very low flow in the morning',
    timestamp: new Date(Date.now() - 10_800_000).toISOString(),
    active: true,
    comments: [],
    reactions: [
      {
        id: 'r10',
        reactionType: 'upvote',
        reportId: 's7',
        user: 'Mara',
        createdAt: new Date(Date.now() - 9_900_000).toISOString(),
      },
    ],
  },
]

function loadFromStorage(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Report>[]
      if (Array.isArray(parsed)) {
        return parsed.map(report => ({
          ...report,
          comments: report.comments ?? [],
          reactions: report.reactions ?? [],
        })) as Report[]
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS))
    return SEED_REPORTS
  } catch {
    return SEED_REPORTS
  }
}

function saveToStorage(reports: Report[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    // silent fail — reports remain in memory
  }
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    setReports(loadFromStorage())
  }, [])

  function addReport(type: ReportType, lat: number, lng: number, description?: string) {
    const report: Report = {
      id: crypto.randomUUID(),
      type,
      lat,
      lng,
      description,
      timestamp: new Date().toISOString(),
      active: true,
      comments: [],
      reactions: [],
    }
    setReports(prev => {
      const next = [...prev, report]
      saveToStorage(next)
      return next
    })
  }

  // For now use a local mock username. In future this should come from auth.
  function addComment(reportId: string, description: string) {
    const trimmed = description.trim()
    if (!trimmed) return
    setReports(prev => {
      const next = prev.map(report => {
        if (report.id !== reportId) return report
        return {
          ...report,
          comments: [
            ...report.comments,
            {
              id: crypto.randomUUID(),
              reportId,
              user: 'You',
              description: trimmed,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
      saveToStorage(next)
      return next
    })
  }

  function addReaction(
    reportId: string,
    reactionType: 'upvote' | 'downvote',
    user = 'You',
    commentId?: string,
  ) {
    setReports(prev => {
      const next = prev.map(report => {
        if (report.id !== reportId) return report
        return {
          ...report,
          reactions: [
            ...report.reactions,
            {
              id: crypto.randomUUID(),
              reactionType,
              reportId,
              commentId,
              user,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
      saveToStorage(next)
      return next
    })
  }

  return { reports, addReport, addComment, addReaction }
}
