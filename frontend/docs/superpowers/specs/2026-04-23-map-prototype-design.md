# AWAS Map Prototype — Design Spec

**Date:** 2026-04-23
**Branch:** feat/map-prototype
**Status:** Approved

---

## Overview

Build the core map page for the AWAS water outage monitoring MVP. Users see a full-screen interactive map with a heatmap overlay showing aggregated outage reports. A floating action button opens a modal to submit new reports. All data is stored in `localStorage` for the prototype (no backend yet). The map uses Leaflet.js + OpenStreetMap instead of Google Maps API (no key available yet); migration to Google Maps is planned once a key is obtained.

---

## Architecture

### Approach
react-leaflet + leaflet-heat, feature-based structure following AWAS conventions.

### File Structure

```
frontend/
├── app/
│   └── page.tsx                 ← renders <MapPage />
└── features/
    └── map/
        ├── MapPage.tsx          ← page shell, owns modal state, FAB button
        ├── MapView.tsx          ← Leaflet map + heatmap layer (client-only)
        ├── ReportModal.tsx      ← center modal form
        ├── useReports.ts        ← localStorage hook
        └── types.ts             ← Report type definition
```

### SSR Constraint
`MapView` must be loaded with `next/dynamic` and `ssr: false` because Leaflet requires `window`. The dynamic wrapper lives in `MapPage`.

---

## Data Model

```ts
type Report = {
  id: string           // crypto.randomUUID()
  type: 'outage' | 'low_pressure'
  lat: number
  lng: number
  description?: string
  timestamp: string    // ISO 8601
}
```

---

## Components

### `MapPage`
- Page shell rendered by `app/page.tsx`
- Owns `isModalOpen: boolean` state
- Dynamically imports `MapView` with `ssr: false`
- Renders the red FAB (bottom-right) that sets `isModalOpen = true`
- Passes `reports` and `addReport` from `useReports` down to children

### `MapView`
- Full-viewport Leaflet map centered on **Cebu City (10.3157° N, 123.8854° E)** at zoom 13
- Tile layer: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- Heatmap layer via `leaflet-heat`, fed weighted points from `reports[]`
  - `outage` reports: weight 1.0
  - `low_pressure` reports: weight 0.5
- Accepts a `mapRef: React.RefObject<L.Map>` from `MapPage`; `MapPage` reads `mapRef.current.getCenter()` on report submit to get `lat/lng`
- Zoom controls visible (Leaflet default)
- Floating legend (bottom-left): gradient bar showing low → high intensity
- Floating report count badge (bottom-right, above FAB): `{n} reports`

### `ReportModal`
- Center modal with dark overlay backdrop
- Closes on backdrop click or ✕ button
- Fields:
  - **Type** (required): toggle between "No Water" 🚱 and "Low Pressure" 💧
  - **Location** (read-only): displays "Using current map center"
  - **Description** (optional): free-text textarea
- Submit button disabled until a type is selected
- On submit: calls `addReport({ type, lat, lng, description })`, closes modal

### `useReports`
- Initializes from `localStorage` key `awas_reports` on mount
- Returns `{ reports, addReport }`
- `addReport` appends a new `Report` (with `crypto.randomUUID()` id and current ISO timestamp), updates state, and syncs to `localStorage`
- `localStorage` access wrapped in try/catch — silent fail, reports live in memory only

---

## Data Flow

```
useReports hook
  ↕ reads/writes localStorage ("awas_reports")

MapPage
  ├── reports[] + addReport → MapView (heatmap points)
  └── addReport → ReportModal (on submit)

ReportModal
  └── on submit → addReport(type, mapCenter.lat, mapCenter.lng, description)

MapView
  └── reports[] → leaflet-heat weighted points → heatmap overlay
```

---

## Seed Data

5–8 hardcoded mock reports scattered around Cebu City are included in the initial `localStorage` state so the heatmap is visible on first load. Seed data is only applied when `localStorage` is empty (first visit).

---

## Location Strategy

The prototype uses the **current map center** as the report location — no GPS prompt. The user pans to their area, taps "+", and submits. This avoids browser permission UX complexity for the prototype.

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` unavailable | try/catch — silent fail, reports in memory only |
| Submit with no type selected | Submit button disabled |
| Leaflet load failure | Unhandled — browser console error is acceptable for prototype |

---

## Interactions

- Map loads centered on Cebu City at zoom 13
- FAB (bottom-right) opens report modal
- Clicking backdrop or ✕ closes modal without saving
- On submit: report added, modal closes, heatmap updates immediately
- Heatmap re-renders reactively whenever `reports[]` changes

---

## Out of Scope (Prototype)

- Google Maps API (no key yet — planned migration)
- Backend API / real-time sync
- GPS / browser geolocation
- Rate limiting or duplicate prevention
- Authentication
- MCWD announcements feed
