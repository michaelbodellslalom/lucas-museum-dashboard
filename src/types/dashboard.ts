export type PageId = 'overview' | 'operations'

export type ReportingPeriod =
  | 'last-business-day'
  | 'last-7'
  | 'last-30'
  | 'mtd'
  | 'ytd'
  | 'custom'

export type Availability =
  | 'day-one'
  | 'integration'
  | 'instrumentation'

export type OperatingStatus = 'On track' | 'Watch' | 'Needs attention' | 'At risk'

export type KpiGroup = 'Admissions & Experience' | 'Revenue' | 'Fundraising' | 'Membership' | 'Events'

export interface Filters {
  period: ReportingPeriod
  membershipLevel: string[]
  demographic: string[]
  ticketPrice: string[]
  membershipChannel: string[]
  customStart: string
  customEnd: string
}

export interface Kpi {
  id: string
  group: KpiGroup
  label: string
  value: number
  format: 'number' | 'decimal' | 'currency' | 'percent' | 'duration'
  comparison: number
  definition: string
  availability: Availability
}

export interface TimePoint {
  label: string
  current: number
  prior: number
  secondary?: number
  capacity?: number
}

export interface CategoryValue {
  name: string
  value: number
  prior?: number
  color?: string
}

export interface DemographicValue {
  name: string
  visitors: number
  ticketPrice: number
  stackedVisitors?: number
  stackedTicketPrice?: number
  stackedLabel?: string
}

export interface AlertItem {
  priority: number
  status: OperatingStatus
  title: string
  detail: string
  action: string
}

export interface QueueRisk {
  location: string
  peak: number
  trend: number
  threshold: number
  action: string
}

export interface HeatmapCell {
  zone: string
  hour: string
  value: number
}

export interface RetailItem {
  name: string
  inStore: number
  online: number
  inStoreRevenue: number
  onlineRevenue: number
}

export interface RevenueTrendPoint {
  label: string
  ticketing: number
  memberships: number
  foodAndBeverage: number
  retail: number
  events: number
}

export interface GalleryPerformance {
  name: string
  dwellTime: number
  visitors: number
}

export interface RevenuePlanRow {
  channel: string
  actual: number
  planned: number
}

export interface DashboardData {
  periodLabel: string
  dateRangeLabel: string
  comparisonLabel: string
  rangeDays: number
  periodScale: number
  averageFactor: number
  scale: number
  kpis: Kpi[]
  alerts: AlertItem[]
  salesAttendance: TimePoint[]
  revenueMix: CategoryValue[]
  membershipChannels: CategoryValue[]
  membershipLevels: CategoryValue[]
  visitorDemographics: DemographicValue[]
  funnel: CategoryValue[]
  capacityByHour: TimePoint[]
  queueRisks: QueueRisk[]
  flowHeatmap: HeatmapCell[]
  zoneUse: CategoryValue[]
  arrivalModes: CategoryValue[]
  dwellTime: CategoryValue[]
  galleryVisitors: CategoryValue[]
  galleryTraffic: TimePoint[]
  engagementAreas: TimePoint[]
  acquisitionMix: CategoryValue[]
  subscriberTrend: TimePoint[]
  reservationsTrend: TimePoint[]
  retailItems: RetailItem[]
  revenueTrend: RevenueTrendPoint[]
  galleryPerformance: GalleryPerformance[]
  revenuePlan: RevenuePlanRow[]
}