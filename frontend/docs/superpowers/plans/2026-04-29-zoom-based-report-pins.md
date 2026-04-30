# Zoom-Based Report Pins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show Leaflet circle-marker pins for active reports only when the map is zoomed to level 15 or above; pins hide on zoom out.

**Architecture:** A new `PinLayer` component inside `MapView.tsx` mirrors the existing `HeatmapLayer` pattern — it builds a `L.LayerGroup` of `CircleMarker`s for active reports, then adds/removes the group on `zoomend` based on a zoom threshold of 15. The `Report` type gains an `active` boolean; seed data and `addReport` both set it to `true`.

**Tech Stack:** Next.js 14, React, Leaflet (`leaflet` + `@types/leaflet`), TypeScript, Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `features/map/types.ts` | Add `active?: boolean` to `Report` |
| `features/map/useReports.ts` | Set `active: true` on seed reports and in `addReport` |
| `features/map/MapView.tsx` | Add `PinLayer` component and render it |

---

### Task 1: Add `active` to the `Report` type

**Files:**
- Modify: `features/map/types.ts`

- [ ] **Step 1: Update the `Report` type**

Open `features/map/types.ts`. Replace the entire file contents with:

```ts
export type ReportType = 'outage' | 'low_pressure'

export type Report = {
  id: string
  type: ReportType
  lat: number
  lng: number
  description?: string
  timestamp: string
  active?: boolean
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. If you see errors about `active` being unknown anywhere, those files need updating (handled in Task 2).

- [ ] **Step 3: Commit**

```bash
git add features/map/types.ts
git commit -m "feat(types): add active field to Report"
```

---

### Task 2: Set `active: true` on seed data and new reports

**Files:**
- Modify: `features/map/useReports.ts`

- [ ] **Step 1: Add `active: true` to all seed reports**

Open `features/map/useReports.ts`. Update the `SEED_REPORTS` array so every entry has `active: true`. The full updated array:

```ts
const SEED_REPORTS: Report[] = [
  { id: 's1', type: 'outage',       lat: 10.3157, lng: 123.8854, timestamp: new Date(Date.now() - 3_600_000).toISOString(),  active: true },
  { id: 's2', type: 'low_pressure', lat: 10.3200, lng: 123.8900, timestamp: new Date(Date.now() - 7_200_000).toISOString(),  active: true },
  { id: 's3', type: 'outage',       lat: 10.3100, lng: 123.8800, timestamp: new Date(Date.now() - 1_800_000).toISOString(),  active: true },
  { id: 's4', type: 'outage',       lat: 10.3250, lng: 123.8820, description: 'No water since 6am', timestamp: new Date(Date.now() - 900_000).toISOString(), active: true },
  { id: 's5', type: 'low_pressure', lat: 10.3180, lng: 123.8950, timestamp: new Date(Date.now() - 5_400_000).toISOString(),  active: true },
  { id: 's6', type: 'outage',       lat: 10.3080, lng: 123.8870, timestamp: new Date(Date.now() - 2_700_000).toISOString(),  active: true },
  { id: 's7', type: 'low_pressure', lat: 10.3300, lng: 123.8830, description: 'Very low flow in the morning', timestamp: new Date(Date.now() - 10_800_000).toISOString(), active: true },
]
```

- [ ] **Step 2: Set `active: true` on new reports in `addReport`**

Still in `useReports.ts`, find the `addReport` function and update the `Report` object it creates:

```ts
function addReport(type: ReportType, lat: number, lng: number, description?: string) {
  const report: Report = {
    id: crypto.randomUUID(),
    type,
    lat,
    lng,
    description,
    timestamp: new Date().toISOString(),
    active: true,
  }
  setReports(prev => {
    const next = [...prev, report]
    saveToStorage(next)
    return next
  })
}
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Clear localStorage and verify seed data loads**

Open the app in the browser (`npm run dev`). Open DevTools → Application → Local Storage → delete the `awas_reports` key → refresh. The heatmap should still render with the 7 seed points. (Pins won't be visible yet — that's Task 3.)

- [ ] **Step 5: Commit**

```bash
git add features/map/useReports.ts
git commit -m "feat(reports): set active: true on seed data and new reports"
```

---

### Task 3: Add `PinLayer` component to `MapView.tsx`

**Files:**
- Modify: `features/map/MapView.tsx`

- [ ] **Step 1: Add the `PinLayer` component**

Open `features/map/MapView.tsx`. After the closing `}` of the `HeatmapLayer` function (line 47) and before the `MapViewProps` type, insert the new component:

```tsx
const PIN_ZOOM_THRESHOLD = 15

const PIN_COLORS: Record<string, string> = {
  outage: '#ef4444',
  low_pressure: '#f97316',
}

type PinLayerProps = {
  reports: Report[]
  map: L.Map | null
}

function PinLayer({ reports, map }: PinLayerProps) {
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!map) return

    // Build a fresh LayerGroup from active reports
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers()
      map.removeLayer(layerGroupRef.current)
    }

    const group = L.layerGroup()

    reports
      .filter(r => r.active)
      .forEach(r => {
        L.circleMarker([r.lat, r.lng], {
          radius: 8,
          color: '#ffffff',
          weight: 1.5,
          fillColor: PIN_COLORS[r.type] ?? '#ef4444',
          fillOpacity: 0.9,
        }).addTo(group)
      })

    layerGroupRef.current = group

    // Show immediately if already zoomed in enough
    if (map.getZoom() >= PIN_ZOOM_THRESHOLD) {
      group.addTo(map)
    }

    function handleZoomEnd() {
      if (!layerGroupRef.current) return
      if (map.getZoom() >= PIN_ZOOM_THRESHOLD) {
        if (!map.hasLayer(layerGroupRef.current)) {
          layerGroupRef.current.addTo(map)
        }
      } else {
        if (map.hasLayer(layerGroupRef.current)) {
          map.removeLayer(layerGroupRef.current)
        }
      }
    }

    map.on('zoomend', handleZoomEnd)

    return () => {
      map.off('zoomend', handleZoomEnd)
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current)
        layerGroupRef.current = null
      }
    }
  }, [map, reports])

  return null
}
```

- [ ] **Step 2: Render `PinLayer` in `MapView`**

Find the `return` block of the `MapView` component (around line 99). Update it to include `PinLayer`:

```tsx
return (
  <>
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    <HeatmapLayer reports={reports} map={map} />
    <PinLayer reports={reports} map={map} />
  </>
)
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual smoke test — pins appear at zoom 15+**

With `npm run dev` running:

1. Load the map. Default zoom is 13 — **no pins should be visible**, only the heatmap.
2. Zoom in until the zoom level hits 15 (watch the URL or add a temporary `console.log(map.getZoom())` in `handleZoomEnd`). **Pins should appear** as colored circles (red for outage, orange for low pressure).
3. Zoom back out below 15. **Pins should disappear.**
4. Click "Add Report", submit a report, then zoom to 15+. **The new pin should appear** at the map center location.

- [ ] **Step 5: Commit**

```bash
git add features/map/MapView.tsx
git commit -m "feat(map): add zoom-based pin layer for active reports"
```
