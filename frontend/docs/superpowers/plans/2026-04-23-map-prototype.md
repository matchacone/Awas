# AWAS Map Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-screen interactive water outage map with a heatmap overlay, report modal, and localStorage persistence using Leaflet.js + OpenStreetMap.

**Architecture:** `features/map/` holds all map code (MapPage, MapView, ReportModal, useReports, types). `app/page.tsx` renders `<MapPage />`. MapView is loaded client-only via `next/dynamic` (Leaflet requires `window`). Reports live in localStorage with seed data on first load.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, react-leaflet, leaflet, leaflet-heat

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `features/map/types.ts` | Create | `Report` type and `ReportType` union |
| `features/map/leaflet-heat.d.ts` | Create | TypeScript declaration for leaflet-heat |
| `features/map/useReports.ts` | Create | localStorage hook — load, seed, add reports |
| `features/map/MapView.tsx` | Create | Leaflet map + OpenStreetMap tiles + heatmap layer |
| `features/map/ReportModal.tsx` | Create | Center modal — type picker, description, submit |
| `features/map/MapPage.tsx` | Create | Page shell — wires map, modal, FAB, top bar |
| `app/page.tsx` | Modify | Replace default template with `<MapPage />` |
| `app/layout.tsx` | Modify | Update title/description metadata |

---

## Task 1: Install dependencies

**Files:** none (package.json modified by npm)

- [ ] **Step 1: Install react-leaflet, leaflet, and leaflet-heat**

```bash
npm install leaflet react-leaflet leaflet-heat
```

If you get peer dependency warnings about React version, add `--legacy-peer-deps`:

```bash
npm install leaflet react-leaflet leaflet-heat --legacy-peer-deps
```

Expected output: packages added, no errors.

- [ ] **Step 2: Install leaflet types**

```bash
npm install --save-dev @types/leaflet
```

- [ ] **Step 3: Verify installation**

```bash
node -e "require('leaflet'); require('react-leaflet'); require('leaflet-heat'); console.log('OK')"
```

Expected output: `OK`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-leaflet and leaflet-heat"
```

---

## Task 2: Create types and leaflet-heat declaration

**Files:**
- Create: `features/map/types.ts`
- Create: `features/map/leaflet-heat.d.ts`

- [ ] **Step 1: Create the features/map directory and types file**

Create `features/map/types.ts`:

```ts
export type ReportType = 'outage' | 'low_pressure'

export type Report = {
  id: string
  type: ReportType
  lat: number
  lng: number
  description?: string
  timestamp: string
}
```

- [ ] **Step 2: Create the leaflet-heat type declaration**

Create `features/map/leaflet-heat.d.ts`:

```ts
import * as L from 'leaflet'

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<string, string>
  }

  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): Layer
}
```

- [ ] **Step 3: Commit**

```bash
git add features/map/types.ts features/map/leaflet-heat.d.ts
git commit -m "feat(map): add Report type and leaflet-heat declaration"
```

---

## Task 3: Build useReports hook

**Files:**
- Create: `features/map/useReports.ts`

- [ ] **Step 1: Create the hook**

Create `features/map/useReports.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add features/map/useReports.ts
git commit -m "feat(map): add useReports hook with localStorage and seed data"
```

---

## Task 4: Build MapView component

**Files:**
- Create: `features/map/MapView.tsx`

- [ ] **Step 1: Create the component**

Create `features/map/MapView.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-heat'
import type { Report } from './types'

const CEBU_CENTER: [number, number] = [10.3157, 123.8854]
const DEFAULT_ZOOM = 13

type HeatmapLayerProps = {
  reports: Report[]
}

function HeatmapLayer({ reports }: HeatmapLayerProps) {
  const map = useMap()
  const heatRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (heatRef.current) {
      map.removeLayer(heatRef.current)
    }

    const points: [number, number, number][] = reports.map(r => [
      r.lat,
      r.lng,
      r.type === 'outage' ? 1.0 : 0.5,
    ])

    heatRef.current = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.4: '#ffd700', 0.65: '#ff8c00', 1.0: '#ff1a1a' },
    }).addTo(map)

    return () => {
      if (heatRef.current) map.removeLayer(heatRef.current)
    }
  }, [map, reports])

  return null
}

type MapInstanceCaptureProps = {
  mapRef: React.MutableRefObject<L.Map | null>
}

function MapInstanceCapture({ mapRef }: MapInstanceCaptureProps) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])

  return null
}

export type MapViewProps = {
  reports: Report[]
  mapRef: React.MutableRefObject<L.Map | null>
}

export default function MapView({ reports, mapRef }: MapViewProps) {
  return (
    <MapContainer
      center={CEBU_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer reports={reports} />
      <MapInstanceCapture mapRef={mapRef} />
    </MapContainer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add features/map/MapView.tsx
git commit -m "feat(map): add MapView with Leaflet + OpenStreetMap + heatmap layer"
```

---

## Task 5: Build ReportModal component

**Files:**
- Create: `features/map/ReportModal.tsx`

- [ ] **Step 1: Create the component**

Create `features/map/ReportModal.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add features/map/ReportModal.tsx
git commit -m "feat(map): add ReportModal with type selector and description field"
```

---

## Task 6: Build MapPage and wire everything

**Files:**
- Create: `features/map/MapPage.tsx`

- [ ] **Step 1: Create MapPage**

Create `features/map/MapPage.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import type L from 'leaflet'
import { useReports } from './useReports'
import ReportModal from './ReportModal'
import type { ReportType } from './types'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function MapPage() {
  const { reports, addReport } = useReports()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // cast needed: useRef<T|null>(null) returns RefObject (readonly) in React 19 types
  const mapRef = useRef<L.Map | null>(null) as React.MutableRefObject<L.Map | null>

  function handleSubmit(type: ReportType, description?: string) {
    const center = mapRef.current?.getCenter()
    if (!center) return
    addReport(type, center.lat, center.lng, description)
    setIsModalOpen(false)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[999] h-10 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl flex items-center px-4 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-white text-xs font-bold tracking-widest">AWAS</span>
        <span className="flex-1" />
        <span className="text-zinc-500 text-[10px]">Live water outages · Cebu</span>
      </div>

      {/* Map (full screen, behind everything) */}
      <MapView reports={reports} mapRef={mapRef} />

      {/* Legend — bottom left */}
      <div className="absolute bottom-16 left-3 z-[999] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Intensity
        </p>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" />
          <span className="text-[9px] text-zinc-500">low → high</span>
        </div>
      </div>

      {/* Report count — bottom right above FAB */}
      <div className="absolute bottom-16 right-3 z-[999] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-center min-w-[52px]">
        <p className="text-red-400 text-base font-bold leading-none">{reports.length}</p>
        <p className="text-[9px] text-zinc-500 mt-0.5">reports</p>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-3 right-3 z-[999] w-12 h-12 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-2xl text-white shadow-lg shadow-red-500/40 transition-colors"
        aria-label="Report a water issue"
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <ReportModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add features/map/MapPage.tsx
git commit -m "feat(map): add MapPage shell with FAB, top bar, legend, and modal wiring"
```

---

## Task 7: Update app/page.tsx and layout metadata

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace app/page.tsx**

Replace the entire contents of `app/page.tsx` with:

```tsx
import MapPage from '@/features/map/MapPage'

export default function Home() {
  return <MapPage />
}
```

- [ ] **Step 2: Update metadata in app/layout.tsx**

In `app/layout.tsx`, replace the `metadata` export:

```ts
export const metadata: Metadata = {
  title: 'AWAS — Water Outage Map',
  description: 'Community-driven water outage monitoring for Cebu',
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat(map): wire MapPage into app root and update metadata"
```

---

## Task 8: Manual verification

**Files:** none

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

- [ ] **Step 2: Verify heatmap loads**

Expected: Full-screen map centered on Cebu City at zoom 13 with visible red/orange heatmap blobs from the 7 seed reports. Top bar shows "AWAS" and "Live water outages · Cebu". Report count badge shows "7".

- [ ] **Step 3: Verify report submission**

1. Pan the map to a different area of Cebu
2. Click the red "+" FAB (bottom-right)
3. Expected: dark modal appears centered on screen with backdrop
4. Click the backdrop → modal closes without saving
5. Open modal again, select "No Water", optionally add a description, click "Submit Report"
6. Expected: modal closes, report count increments by 1, heatmap updates with new point at the location you panned to

- [ ] **Step 4: Verify localStorage persistence**

1. Open DevTools → Application → Local Storage → `http://localhost:3000`
2. Check key `awas_reports` — should contain a JSON array with 8+ entries (7 seed + your submission)
3. Hard-refresh the page (`Ctrl+Shift+R`)
4. Expected: report count still shows the correct number (seed + submitted)

- [ ] **Step 5: Verify modal validation**

1. Open the modal
2. Do NOT select a type
3. Expected: "Submit Report" button is visually dimmed and clicking it does nothing

- [ ] **Step 6: Commit (if any fixes were made during verification)**

```bash
git add -A
git commit -m "fix(map): address issues found during manual verification"
```

Only run this step if you had to fix something. Otherwise skip.
