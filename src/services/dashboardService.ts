import * as mock from '../data/mockData'
import type { CategoryValue, DashboardData, DemographicValue, Filters, GalleryPerformance, HeatmapCell, Kpi, QueueRisk, ReportingPeriod, RevenuePlanRow, RevenueTrendPoint, RetailItem, TimePoint } from '../types/dashboard'

export interface DashboardDataAdapter {
  getDashboardData(filters: Filters, signal?: AbortSignal): Promise<DashboardData>
}

const periodLabels: Record<ReportingPeriod, string> = {
  'last-business-day': 'Yesterday',
  'last-7': 'Last 7 completed days',
  'last-30': 'Last 30 completed days',
  mtd: 'Month to date',
  ytd: 'Year to date',
  custom: 'Custom completed range',
}

const multipliers: Record<string, number> = {
  Access: 0.25, Alliance: 0.30, Corporate: 0.20, Insider: 0.15, Social: 0.10,
  'Active Military': 0.08, Adult: 0.50, 'Child (0-12)': 0.12, 'Teen Student (13-17)': 0.15, 'Senior (65+)': 0.15,
  'Active Military ($0)': 0.08, 'Adult ($25)': 0.50, 'Child (0-12) ($0)': 0.12, 'Senior (65+) ($21)': 0.15, 'Teen Student (13-17) ($0)': 0.15,
  Online: 0.68, 'In person': 0.32,
}

function filterScale(filters: Filters) {
  const getSumMultiplier = (items: string[]) => {
    const values = items.map(item => multipliers[item] ?? 0)
    return values.reduce((sum, val) => sum + val, 0)
  }
  
  return [
    getSumMultiplier(filters.membershipLevel),
    getSumMultiplier(filters.demographic),
    getSumMultiplier(filters.ticketPrice),
    getSumMultiplier(filters.membershipChannel),
  ].reduce((scale, multiplier) => scale * multiplier, 1)
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`)
}

function formatDateRange(start: Date, end: Date) {
  return start.getTime() === end.getTime()
    ? dateFormatter.format(start)
    : `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`
}

function comparisonRange(period: ReportingPeriod, start: Date, end: Date, days: number) {
  if (period === 'mtd') {
    return {
      start: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, start.getUTCDate())),
      end: new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, end.getUTCDate())),
    }
  }
  if (period === 'ytd') {
    return {
      start: new Date(Date.UTC(start.getUTCFullYear() - 1, start.getUTCMonth(), start.getUTCDate())),
      end: new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), end.getUTCDate())),
    }
  }
  const comparisonEnd = new Date(start.getTime() - 86_400_000)
  return {
    start: new Date(comparisonEnd.getTime() - (days - 1) * 86_400_000),
    end: comparisonEnd,
  }
}

function scaledKpis(kpis: Kpi[], scale: number, averageFactor: number): Kpi[] {
  return kpis.map((kpi) => ({
    ...kpi,
    value: kpi.id === 'revenue-per-visitor' || kpi.format === 'duration' || kpi.format === 'decimal'
      ? kpi.value * averageFactor
      : kpi.format === 'percent'
        ? Math.round(kpi.value * averageFactor * (scale < 0.15 ? 0.92 : 1))
        : kpi.format === 'currency'
          ? kpi.value * scale
          : Math.round(kpi.value * scale),
  }))
}

function scaledDemographics(values: DemographicValue[], scale: number): DemographicValue[] {
  return values.map((item) => ({ ...item, visitors: Math.round(item.visitors * scale) }))
}

function scaledCategories(values: CategoryValue[], scale: number): CategoryValue[] {
  return values.map((item) => ({ ...item, value: Math.round(item.value * scale), prior: item.prior ? Math.round(item.prior * scale) : undefined }))
}

function scaledRetailItems(values: RetailItem[], scale: number): RetailItem[] {
  return values.map((item) => ({ ...item, inStore: Math.round(item.inStore * scale), online: Math.round(item.online * scale), inStoreRevenue: Math.round(item.inStoreRevenue * scale), onlineRevenue: Math.round(item.onlineRevenue * scale) }))
}

function scaledRevenueTrend(values: RevenueTrendPoint[], scale: number): RevenueTrendPoint[] {
  return values.map((item) => ({
    ...item,
    ticketing: Math.round(item.ticketing * scale),
    memberships: Math.round(item.memberships * scale),
    foodAndBeverage: Math.round(item.foodAndBeverage * scale),
    retail: Math.round(item.retail * scale),
    events: Math.round(item.events * scale),
  }))
}

function scaledGalleryPerformance(values: GalleryPerformance[], scale: number, averageFactor: number): GalleryPerformance[] {
  return values.map((item) => ({ ...item, dwellTime: Math.round(item.dwellTime * averageFactor), visitors: Math.round(item.visitors * scale) }))
}

function scaledRevenuePlan(values: RevenuePlanRow[], scale: number): RevenuePlanRow[] {
  return values.map((item) => ({ ...item, actual: Math.round(item.actual * scale), planned: Math.round(item.planned * scale) }))
}

function scaledSeries(values: TimePoint[], scale: number): TimePoint[] {
  return values.map((item) => ({
    ...item,
    current: Math.round(item.current * scale),
    prior: Math.round(item.prior * scale),
    secondary: item.secondary ? Math.round(item.secondary * scale) : undefined,
    capacity: item.capacity ? Math.round(item.capacity * Math.max(1, scale)) : undefined,
  }))
}

function scaledAverageSeries(values: TimePoint[], factor: number, maximum?: number): TimePoint[] {
  const adjust = (value: number) => Math.round(Math.min(maximum ?? Number.POSITIVE_INFINITY, value * factor))
  return values.map((item) => ({
    ...item,
    current: adjust(item.current),
    prior: adjust(item.prior),
    secondary: item.secondary === undefined ? undefined : adjust(item.secondary),
    capacity: item.capacity,
  }))
}

function scaledQueueRisks(values: QueueRisk[], factor: number): QueueRisk[] {
  return values.map((item) => ({
    ...item,
    peak: Math.round(item.peak * factor),
    trend: Math.sign(item.trend) * Math.max(1, Math.round(Math.abs(item.trend) * factor)),
  }))
}

function scaledHeatmap(values: HeatmapCell[], factor: number): HeatmapCell[] {
  return values.map((item) => ({ ...item, value: Math.min(100, Math.round(item.value * factor)) }))
}

function shiftedMix(values: CategoryValue[], shift: number): CategoryValue[] {
  const pattern = [1, -0.7, 0.5, -0.4, 0.3, -0.2, 0.1]
  const raw = values.map((item, index) => item.value * (1 + shift * pattern[index % pattern.length]))
  const targetTotal = values.reduce((total, item) => total + item.value, 0)
  const rawTotal = raw.reduce((total, value) => total + value, 0) || 1
  const adjusted = values.map((item, index) => ({ ...item, value: Math.max(0, Math.round((raw[index] / rawTotal) * targetTotal)) }))
  const difference = targetTotal - adjusted.reduce((total, item) => total + item.value, 0)
  if (adjusted.length) adjusted[adjusted.length - 1].value += difference
  return adjusted
}

export class MockDashboardAdapter implements DashboardDataAdapter {
  async getDashboardData(filters: Filters, signal?: AbortSignal): Promise<DashboardData> {
    await new Promise((resolve, reject) => {
      const timer = window.setTimeout(resolve, 180)
      signal?.addEventListener('abort', () => {
        window.clearTimeout(timer)
        reject(new DOMException('Request aborted', 'AbortError'))
      })
    })

    const start = parseDate(filters.customStart)
    const end = parseDate(filters.customEnd)
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1)
    const periodScale = days === 1 ? 1 : days * 0.92
    const averageFactor = 1 + Math.min(0.18, Math.log2(days) * 0.025)
    const mixShift = Math.min(0.12, Math.log2(days) * 0.02)
    const scale = periodScale * filterScale(filters)
    const comparison = comparisonRange(filters.period, start, end, days)

    return {
      periodLabel: periodLabels[filters.period],
      dateRangeLabel: formatDateRange(start, end),
      comparisonLabel: formatDateRange(comparison.start, comparison.end),
      rangeDays: days,
      periodScale,
      averageFactor,
      scale,
      kpis: scaledKpis(mock.baseKpis, scale, averageFactor),
      alerts: mock.alerts,
      salesAttendance: scaledSeries(mock.salesAttendance, scale),
      revenueMix: scaledCategories(mock.revenueMix, scale),
      membershipChannels: scaledCategories(mock.membershipChannels, scale),
      membershipLevels: scaledCategories(mock.membershipLevels, scale),
      visitorDemographics: scaledDemographics(mock.visitorDemographics, scale),
      funnel: scaledCategories(mock.funnel, scale),
      capacityByHour: scaledAverageSeries(mock.capacityByHour, averageFactor, 100),
      queueRisks: scaledQueueRisks(mock.queueRisks, averageFactor),
      flowHeatmap: scaledHeatmap(mock.flowHeatmap, averageFactor),
      zoneUse: scaledCategories(mock.zoneUse, Math.max(0.2, scale)),
      arrivalModes: shiftedMix(mock.arrivalModes, mixShift),
      dwellTime: scaledCategories(mock.dwellTime, averageFactor),
      galleryVisitors: scaledCategories(mock.galleryVisitors, Math.max(0.2, scale)),
      galleryTraffic: scaledSeries(mock.galleryTraffic, Math.max(0.2, scale)),
      engagementAreas: scaledSeries(mock.engagementAreas, Math.max(0.2, scale)),
      acquisitionMix: shiftedMix(mock.acquisitionMix, mixShift),
      subscriberTrend: scaledAverageSeries(mock.subscriberTrend, averageFactor),
      reservationsTrend: scaledSeries(mock.reservationsTrend, Math.max(0.2, scale)),
      retailItems: scaledRetailItems(mock.retailItems, Math.max(0.2, scale)),
      revenueTrend: scaledRevenueTrend(mock.revenueTrend, Math.max(0.2, scale)),
      galleryPerformance: scaledGalleryPerformance(mock.galleryPerformance, Math.max(0.2, scale), averageFactor),
      revenuePlan: scaledRevenuePlan(mock.revenuePlan, Math.max(0.2, scale)),
    }
  }
}

// Swap this adapter for a gold-layer REST client or Power BI semantic-model adapter in production.
export const dashboardDataAdapter: DashboardDataAdapter = new MockDashboardAdapter()