'use client'

import { useState, useEffect } from 'react'
import type { Report, ReportType } from './types'

const STORAGE_KEY = 'awas_reports'

const SEED_REPORTS: Report[] = [
  { id: 's1', type: 'outage',       lat: 10.3157, lng: 123.8854, timestamp: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 's2', type: 'low_pressure', lat: 10.3200, lng: 123.8900, timestamp: new Date(Date.now() - 7_200_000).toISOString() },
  { id: 's3', type: 'outage',       lat: 10.3100, lng: 123.8800, timestamp: new Date(Date.now() - 1_800_000).toISOString() },
  { id: 's4', type: 'outage',       lat: 10.3250, lng: 123.8820, description: 'No water since 6am', timestamp: new Date(Date.now() - 900_000).toISOString() },
  { id: 's5', type: 'low_pressure', lat: 10.3180, lng: 123.8950, timestamp: new Date(Date.now() - 5_400_000).toISOString() },
  { id: 's6', type: 'outage',       lat: 10.3080, lng: 123.8870, timestamp: new Date(Date.now() - 2_700_000).toISOString() },
  { id: 's7', type: 'low_pressure', lat: 10.3300, lng: 123.8830, description: 'Very low flow in the morning', timestamp: new Date(Date.now() - 10_800_000).toISOString() },
]

function loadFromStorage(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Report[]
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
    }
    setReports(prev => {
      const next = [...prev, report]
      saveToStorage(next)
      return next
    })
  }

  return { reports, addReport }
}
