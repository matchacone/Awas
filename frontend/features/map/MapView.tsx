'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { Report } from './types'

const CEBU_CENTER: [number, number] = [10.3157, 123.8854]
const DEFAULT_ZOOM = 13

type HeatmapLayerProps = {
  reports: Report[]
  map: L.Map | null
}

function HeatmapLayer({ reports, map }: HeatmapLayerProps) {
  const heatRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (!map) return
    if (!map.getPane('overlayPane')) return

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

export type MapViewProps = {
  reports: Report[]
  mapRef: React.MutableRefObject<L.Map | null>
}

export default function MapView({ reports, mapRef }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [map, setMap] = useState<L.Map | null>(null)

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

    const createdMap = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView(CEBU_CENTER, DEFAULT_ZOOM)

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(createdMap)

    mapRef.current = createdMap
    setMap(createdMap)

    return () => {
      createdMap.remove()
      if (mapRef.current === createdMap) {
        mapRef.current = null
      }
      setMap(null)
      if ('_leaflet_id' in container) {
        delete (container as { _leaflet_id?: number })._leaflet_id
      }
    }
  }, [mapRef])


  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <HeatmapLayer reports={reports} map={map} />
    </>
  )
}
