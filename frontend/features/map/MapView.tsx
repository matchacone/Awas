'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { Report } from './types'

const CEBU_CENTER: [number, number] = [10.3157, 123.8854]
const DEFAULT_ZOOM = 13

type HeatmapLayerProps = {
  reports: Report[]
  mapRef: React.MutableRefObject<L.Map | null>
}

function HeatmapLayer({ reports, mapRef }: HeatmapLayerProps) {
  const heatRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

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
  }, [mapRef, reports])

  return null
}

export type MapViewProps = {
  reports: Report[]
  mapRef: React.MutableRefObject<L.Map | null>
}

export default function MapView({ reports, mapRef }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    if ('_leaflet_id' in container) {
      delete (container as { _leaflet_id?: number })._leaflet_id
    }

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView(CEBU_CENTER, DEFAULT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      if (mapRef.current === map) {
        mapRef.current = null
      }
      if ('_leaflet_id' in container) {
        delete (container as { _leaflet_id?: number })._leaflet_id
      }
    }
  }, [mapRef])


  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <HeatmapLayer reports={reports} mapRef={mapRef} />
    </>
  )
}
