'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
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
