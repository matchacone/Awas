'use client'

import { useState, useEffect } from 'react'
import type { Report, ReportType } from './types'
import supabase from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

const STORAGE_KEY = 'awas_reports'

function createSeedReports(): Report[] {
  const now = Date.now()
  return [
    {
      id: 's1',
      type: 'outage',
      lat: 10.3157,
      lng: 123.8854,
      timestamp: new Date(now - 3_600_000).toISOString(),
      active: true,
      comments: [
        {
          id: 'c1',
          reportId: 's1',
          user: 'Mika',
          description: 'No water since this morning near the market.',
          createdAt: new Date(now - 2_800_000).toISOString(),
        },
      ],
      reactions: [
        {
          id: 'r1',
          reactionType: 'upvote',
          reportId: 's1',
          user: 'Jules',
          createdAt: new Date(now - 2_600_000).toISOString(),
        },
        {
          id: 'r2',
          reactionType: 'upvote',
          reportId: 's1',
          commentId: 'c1',
          user: 'Ari',
          createdAt: new Date(now - 2_200_000).toISOString(),
        },
      ],
    },
    {
      id: 's2',
      type: 'low_pressure',
      lat: 10.32,
      lng: 123.89,
      timestamp: new Date(now - 7_200_000).toISOString(),
      active: true,
      comments: [
        {
          id: 'c2',
          reportId: 's2',
          user: 'Bianca',
          description: 'Flow is weak but still usable.',
          createdAt: new Date(now - 6_900_000).toISOString(),
        },
      ],
      reactions: [
        {
          id: 'r3',
          reactionType: 'upvote',
          reportId: 's2',
          user: 'Nico',
          createdAt: new Date(now - 6_700_000).toISOString(),
        },
        {
          id: 'r4',
          reactionType: 'downvote',
          reportId: 's2',
          user: 'Ivy',
          createdAt: new Date(now - 6_200_000).toISOString(),
        },
      ],
    },
    {
      id: 's3',
      type: 'outage',
      lat: 10.31,
      lng: 123.88,
      timestamp: new Date(now - 1_800_000).toISOString(),
      active: true,
      comments: [],
      reactions: [
        {
          id: 'r5',
          reactionType: 'upvote',
          reportId: 's3',
          user: 'Ken',
          createdAt: new Date(now - 1_600_000).toISOString(),
        },
      ],
    },
    {
      id: 's4',
      type: 'outage',
      lat: 10.325,
      lng: 123.882,
      description: 'No water since 6am',
      timestamp: new Date(now - 900_000).toISOString(),
      active: true,
      comments: [
        {
          id: 'c3',
          reportId: 's4',
          user: 'Sam',
          description: 'Still dry as of 2pm.',
          createdAt: new Date(now - 600_000).toISOString(),
        },
        {
          id: 'c4',
          reportId: 's4',
          user: 'Lia',
          description: 'Neighbors also affected.',
          createdAt: new Date(now - 540_000).toISOString(),
        },
      ],
      reactions: [
        {
          id: 'r6',
          reactionType: 'upvote',
          reportId: 's4',
          user: 'Ramon',
          createdAt: new Date(now - 480_000).toISOString(),
        },
        {
          id: 'r7',
          reactionType: 'upvote',
          reportId: 's4',
          commentId: 'c3',
          user: 'Ava',
          createdAt: new Date(now - 420_000).toISOString(),
        },
      ],
    },
    {
      id: 's5',
      type: 'low_pressure',
      lat: 10.318,
      lng: 123.895,
      timestamp: new Date(now - 5_400_000).toISOString(),
      active: true,
      comments: [],
      reactions: [
        {
          id: 'r8',
          reactionType: 'upvote',
          reportId: 's5',
          user: 'Jo',
          createdAt: new Date(now - 5_100_000).toISOString(),
        },
      ],
    },
    {
      id: 's6',
      type: 'outage',
      lat: 10.308,
      lng: 123.887,
      timestamp: new Date(now - 2_700_000).toISOString(),
      active: true,
      comments: [
        {
          id: 'c5',
          reportId: 's6',
          user: 'Toni',
          description: 'Water returns briefly then cuts off again.',
          createdAt: new Date(now - 2_400_000).toISOString(),
        },
      ],
      reactions: [
        {
          id: 'r9',
          reactionType: 'downvote',
          reportId: 's6',
          user: 'Eli',
          createdAt: new Date(now - 2_200_000).toISOString(),
        },
      ],
    },
    {
      id: 's7',
      type: 'low_pressure',
      lat: 10.33,
      lng: 123.883,
      description: 'Very low flow in the morning',
      timestamp: new Date(now - 10_800_000).toISOString(),
      active: true,
      comments: [],
      reactions: [
        {
          id: 'r10',
          reactionType: 'upvote',
          reportId: 's7',
          user: 'Mara',
          createdAt: new Date(now - 9_900_000).toISOString(),
        },
      ],
    },
  ]
}

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
    const seeds = createSeedReports()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds))
    return seeds
  } catch {
    return createSeedReports()
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
  const { user } = useAuth()

  useEffect(() => {
    // Try to load from Supabase first, fall back to local storage
    let mounted = true

    async function load() {
      try {
        // Load reports from the shared schema (api_outagereport)
        const { data } = await supabase
          .from('api_outagereport')
          .select('*')
          .order('created_at', { ascending: false })

        if (!mounted) return
        if (Array.isArray(data)) {
          // Map DB rows to our Report shape
          const mapped = data.map((r: any): Report => ({
            id: String(r.id),
            type: r.issuetype,
            lat: r.latitude,
            lng: r.longitude,
            description: r.description ?? undefined,
            timestamp: r.created_at,
            active: true,
            comments: [],
            reactions: [],
          }))
          setReports(mapped)
          return
        }
      } catch (e) {
        console.error('Failed to load reports from Supabase', e)
      }

      setReports(loadFromStorage())
    }

    load()

    // Realtime subscriptions: refetch when relevant tables change
    // Subscribe to granular realtime events and apply patches locally
    // Supabase v2 Realtime via channels (postgres_changes)
    const reportsChannel = supabase
      .channel('public:api_outagereport')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'api_outagereport' }, payload => {
        const r = payload.new as any
        setReports(prev => [{
          id: String(r.id),
          type: r.issuetype,
          lat: r.latitude,
          lng: r.longitude,
          description: r.description ?? undefined,
          timestamp: r.created_at,
          active: true,
          comments: [],
          reactions: [],
        }, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'api_outagereport' }, payload => {
        const r = payload.new as any
        setReports(prev => prev.map(rep => (String(rep.id) === String(r.id) ? {
          ...rep,
          type: r.issuetype,
          lat: r.latitude,
          lng: r.longitude,
          description: r.description ?? rep.description,
        } : rep)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'api_outagereport' }, payload => {
        const r = payload.old as any
        setReports(prev => prev.filter(rep => String(rep.id) !== String(r.id)))
      })

    const commentsChannel = supabase
      .channel('public:api_comment')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_comment' }, payload => {
        const c = (payload.new ?? payload.old) as any
        const event = payload.eventType
        setReports(prev => prev.map(rep => {
          if (String(rep.id) !== String(c.outage_id)) return rep
          if (event === 'INSERT') {
            return { ...rep, comments: [
              ...(rep.comments || []),
              {
                id: String(c.id),
                reportId: String(c.outage_id),
                user: String(c.user_id ?? 'Unknown'),
                description: c.description,
                createdAt: c.created_at ?? new Date().toISOString(),
              }
            ] }
          }
          if (event === 'DELETE') {
            return { ...rep, comments: (rep.comments || []).filter(cm => String(cm.id) !== String(c.id)) }
          }
          return rep
        }))
      })

    const reactionsChannel = supabase
      .channel('public:api_reaction')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_reaction' }, payload => {
        const rx = (payload.new ?? payload.old) as any
        const event = payload.eventType
        setReports(prev => prev.map(rep => {
          if (String(rep.id) !== String(rx.outage_id)) return rep
          if (event === 'INSERT') {
            return { ...rep, reactions: [
              ...(rep.reactions || []),
              {
                id: String(rx.id),
                reactionType: rx.is_like ? 'upvote' : 'downvote',
                reportId: String(rx.outage_id),
                user: String(rx.user_id ?? 'Unknown'),
                createdAt: rx.created_at ?? new Date().toISOString(),
                commentId: rx.comment_id ? String(rx.comment_id) : undefined,
              }
            ] }
          }
          if (event === 'DELETE') {
            return { ...rep, reactions: (rep.reactions || []).filter(rn => String(rn.id) !== String(rx.id)) }
          }
          return rep
        }))
      })

    // Subscribe channels
    const reportsSub = reportsChannel.subscribe()
    const commentsSub = commentsChannel.subscribe()
    const reactionsSub = reactionsChannel.subscribe()

    return () => {
      mounted = false
      try {
        reportsChannel.unsubscribe()
      } catch {}
      try {
        commentsChannel.unsubscribe()
      } catch {}
      try {
        reactionsChannel.unsubscribe()
      } catch {}
    }
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
    // Optimistic local update
    setReports(prev => {
      const next = [...prev, report]
      saveToStorage(next)
      return next
    })

    // Persist to Supabase: map to api_outagereport columns and replace optimistic item
    ;(async () => {
      try {
        const res = await supabase
          .from('api_outagereport')
          .insert({
            location: '',
            description: report.description,
            issuetype: report.type,
            latitude: report.lat,
            longitude: report.lng,
            created_at: new Date().toISOString(),
            reporter_id: user ? user.id : null,
          })
          .select()
        const inserted = res.data && res.data[0]
        if (!inserted) return
        // Replace optimistic entry (by id) with DB row
        setReports(prev => prev.map(r => (r.id === report.id ? {
          id: String(inserted.id),
          type: inserted.issuetype,
          lat: inserted.latitude,
          lng: inserted.longitude,
          description: inserted.description ?? undefined,
          timestamp: inserted.created_at,
          active: true,
          comments: [],
          reactions: [],
        } : r)))
      } catch {
        // silent fail — optimistic update remains
      }
    })()
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

    // Persist comment to Supabase (api_comment expects outage_id)
    const outageId = Number(reportId)
    if (!Number.isNaN(outageId)) {
      ;(async () => {
        try {
          const res = await supabase
            .from('api_comment')
            .insert({
              description: trimmed,
              outage_id: outageId,
              user_id: user ? user.id : null,
              created_at: new Date().toISOString(),
            })
            .select()
          const inserted = res.data && res.data[0]
          if (!inserted) return
          // Replace the optimistic comment id if possible
          setReports(prev => prev.map(r => {
            if (String(r.id) !== String(outageId)) return r
            return {
              ...r,
              comments: r.comments.map(c => c.description === trimmed ? {
                id: String(inserted.id),
                reportId: String(inserted.outage_id),
                user: String(inserted.user_id ?? 'Unknown'),
                description: inserted.description,
                createdAt: inserted.created_at,
              } : c),
            }
          }))
        } catch {
          // silent fail
        }
      })()
    }
  }

  function addReaction(
    reportId: string,
    reactionType: 'upvote' | 'downvote',
    userName = 'You',
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
              user: userName,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
      saveToStorage(next)
      return next
    })

    // Persist reaction to api_reaction — `is_like` is boolean
    const outageId = Number(reportId)
    ;(async () => {
      try {
        const res = await supabase
          .from('api_reaction')
          .insert({
            is_like: reactionType === 'upvote',
            outage_id: Number.isNaN(outageId) ? null : outageId,
            comment_id: commentId ? Number(commentId) : null,
            user_id: user ? user.id : null,
            created_at: new Date().toISOString(),
          })
          .select()
        const inserted = res.data && res.data[0]
        if (!inserted) return
        setReports(prev => prev.map(r => {
          if (String(r.id) !== String(inserted.outage_id)) return r
          return { ...r, reactions: r.reactions.map(rx => rx.createdAt === undefined ? {
            id: String(inserted.id),
            reactionType: inserted.is_like ? 'upvote' : 'downvote',
            reportId: String(inserted.outage_id),
            user: String(inserted.user_id ?? 'Unknown'),
            createdAt: inserted.created_at,
            commentId: inserted.comment_id ? String(inserted.comment_id) : undefined,
          } : rx) }
        }))
      } catch {
        // silent fail
      }
    })()
  }

  return { reports, addReport, addComment, addReaction }
}
