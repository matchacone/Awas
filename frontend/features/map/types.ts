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
