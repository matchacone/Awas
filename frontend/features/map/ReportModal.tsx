'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ReportType } from './types'

type Props = {
  onClose: () => void
  onSubmit: (type: ReportType, lat: number, lng: number, description?: string) => void
  initialCenter?: { lat: number; lng: number }
}

const DEFAULT_CENTER = { lat: 10.3157, lng: 123.8854 }
const DEFAULT_ZOOM = 14

const pinIcon = L.divIcon({
  className: '',
  html:
    '<div style="width:16px;height:16px;border-radius:999px;background:#f43f5e;border:2px solid #ffffff;box-shadow:0 0 0 4px rgba(244,63,94,0.2);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export default function ReportModal({ onClose, onSubmit, initialCenter }: Props) {
  const [type, setType] = useState<ReportType | null>(null)
  const [description, setDescription] = useState('')
  const [pickedLocation, setPickedLocation] = useState<L.LatLngLiteral | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    if ('_leaflet_id' in container) {
      delete (container as { _leaflet_id?: number })._leaflet_id
    }

    const center = initialCenter ?? DEFAULT_CENTER
    const createdMap = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], DEFAULT_ZOOM)

    const stadiaKey = process.env.NEXT_PUBLIC_STADIA_API_KEY
    L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png${stadiaKey ? `?api_key=${stadiaKey}` : ''}`, {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(createdMap)

    function updatePin(latlng: L.LatLng) {
      setPickedLocation({ lat: latlng.lat, lng: latlng.lng })
      if (!markerRef.current) {
        markerRef.current = L.marker(latlng, { draggable: true, icon: pinIcon }).addTo(createdMap)
        markerRef.current.on('dragend', () => {
          const next = markerRef.current?.getLatLng()
          if (next) updatePin(next)
        })
        return
      }
      markerRef.current.setLatLng(latlng)
    }

    createdMap.on('click', event => updatePin(event.latlng))

    mapRef.current = createdMap

    return () => {
      createdMap.remove()
      mapRef.current = null
      markerRef.current = null
      if ('_leaflet_id' in container) {
        delete (container as { _leaflet_id?: number })._leaflet_id
      }
    }
  }, [initialCenter])

  function handleSubmit() {
    if (!type || !pickedLocation) return
    onSubmit(type, pickedLocation.lat, pickedLocation.lng, description.trim() || undefined)
  }

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1117] border border-white/10 rounded-xl w-[92%] max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType('outage')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'outage'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-white/4 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                🚱 No Water
              </button>
              <button
                onClick={() => setType('low_pressure')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'low_pressure'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-400'
                    : 'bg-white/4 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                💧 Low Pressure
              </button>
              <button
                onClick={() => setType('pipe_leak')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'pipe_leak'
                    ? 'bg-blue-500/20 border-blue-400 text-blue-400'
                    : 'bg-white/4 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                🛠️ Pipe Leak
              </button>
              <button
                onClick={() => setType('dirty_water')}
                className={`flex-1 py-3 rounded-lg border text-center text-xs font-semibold transition-colors ${
                  type === 'dirty_water'
                    ? 'bg-amber-700/20 border-amber-600 text-amber-400'
                    : 'bg-white/4 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                🧪 Dirty Water
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Location</p>
            <div className="rounded-lg border border-white/10 bg-white/4 p-2">
              <div
                ref={mapContainerRef}
                className="h-56 w-full rounded-md overflow-hidden border border-white/10"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Tap the map to drop a pin</span>
                <span className="tabular-nums">
                  {pickedLocation
                    ? `${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lng.toFixed(5)}`
                    : 'No pin yet'}
                </span>
              </div>
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
              className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-white/20"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!type || !pickedLocation}
            className="h-10 bg-red-500 rounded-lg text-white text-xs font-bold tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-400 transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  )
}
