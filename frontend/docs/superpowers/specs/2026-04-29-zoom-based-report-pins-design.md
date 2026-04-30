# Zoom-Based Report Pins Design

**Date:** 2026-04-29  
**Branch:** UI-Elements  

---

## Summary

When a user submits a report, a pin appears on the map at that location. Pins are only visible when the map is zoomed in to level 15 or above. Zooming out below 15 hides all pins. The existing heatmap layer is unaffected.

---

## Data Layer

**File:** `features/map/types.ts`

Add `active` field to the `Report` type:

```ts
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

**File:** `features/map/useReports.ts`

- All seed reports get `active: true`
- `addReport()` sets `active: true` on every new report

---

## PinLayer Component

**File:** `features/map/MapView.tsx`

A new `PinLayer` component, following the same pattern as `HeatmapLayer`:

- **Props:** `reports: Report[]`, `map: L.Map | null`
- **Zoom threshold:** 15
- **Behavior:**
  - Filters reports to those where `active === true`
  - Creates a Leaflet `CircleMarker` per report:
    - `outage` → red (`#ef4444`)
    - `low_pressure` → orange (`#f97316`)
    - Radius: 8, filled, with a subtle white stroke
  - Groups all markers into a single `L.LayerGroup`
  - On mount: checks current zoom — adds the group if ≥ 15, skips if not
  - Attaches a `zoomend` listener that adds/removes the group based on threshold
  - On cleanup (unmount / deps change): removes the layer group and detaches the listener

---

## MapView Integration

**File:** `features/map/MapView.tsx`

Add `<PinLayer reports={reports} map={map} />` in the return block, alongside the existing `<HeatmapLayer />`. No other files need changes.

---

## Out of Scope

- No changes to `MapPage.tsx`, `ReportModal.tsx`, or the submit flow
- No popup/tooltip on pin click (future feature)
- No pin expiry logic (deferred to backend `active` attribute management)
- No custom SVG/icon markers — circle markers match the existing legend style
