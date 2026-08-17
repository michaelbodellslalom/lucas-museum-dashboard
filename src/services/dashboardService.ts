import * as mock from '../data/mockData'
import type { CategoryValue, DashboardData, DemographicValue, Filters, Kpi, ReportingPeriod, TimePoint } from '../types/dashboard'

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
  'Complimentary ($0)': 0.08, 'Access ($1–$20)': 0.25, 'Standard ($21–$30)': 0.43, 'Premium ($31+)': 0.24,
  Online: 0.68, 'In person': 0.32,
}

function filterScale(filters: Filters) {
  const getAverageMultiplier = (items: string[]) => {
    const values = items.map(item => multipliers[item] ?? 1)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
  
  return [
    getAverageMultiplier(filters.membershipLevel),
    getAverageMultiplier(filters.demographic),
    getAverageMultiplier(filters.ticketPrice),
    getAverageMultiplier(filters.membershipChannel),
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

function scaledKpis(kpis: Kpi[], scale: number): Kpi[] {
  return kpis.map((kpi) => ({
    ...kpi,
    value: kpi.id === 'revenue-per-visitor'
      ? kpi.value
      : kpi.format === 'percent'
        ? Math.round(kpi.value * (scale < 0.15 ? 0.92 : 1))
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

function scaledSeries(values: TimePoint[], scale: number): TimePoint[] {
  return values.map((item) => ({
    ...item,
    current: Math.round(item.current * scale),
    prior: Math.round(item.prior * scale),
    secondary: item.secondary ? Math.round(item.secondary * scale) : undefined,
    capacity: item.capacity ? Math.round(item.capacity * Math.max(1, scale)) : undefined,
  }))
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
    const scale = periodScale * filterScale(filters)
    const comparison = comparisonRange(filters.period, start, end, days)

    return {
      periodLabel: periodLabels[filters.period],
      dateRangeLabel: formatDateRange(start, end),
      comparisonLabel: formatDateRange(comparison.start, comparison.end),
      scale,
      kpis: scaledKpis(mock.baseKpis, scale),
      alerts: mock.alerts,
      salesAttendance: scaledSeries(mock.salesAttendance, scale),
      revenueMix: scaledCategories(mock.revenueMix, scale),
      membershipChannels: scaledCategories(mock.membershipChannels, scale),
      membershipLevels: scaledCategories(mock.membershipLevels, scale),
      visitorDemographics: scaledDemographics(mock.visitorDemographics, scale),
      funnel: scaledCategories(mock.funnel, scale),
      capacityByHour: mock.capacityByHour,
      queueRisks: mock.queueRisks,
      flowHeatmap: mock.flowHeatmap,
      zoneUse: scaledCategories(mock.zoneUse, Math.max(0.2, scale)),
      arrivalModes: mock.arrivalModes,
      dwellTime: mock.dwellTime,
      galleryVisitors: scaledCategories(mock.galleryVisitors, Math.max(0.2, scale)),
      galleryTraffic: scaledSeries(mock.galleryTraffic, Math.max(0.2, scale)),
      engagementAreas: scaledSeries(mock.engagementAreas, Math.max(0.2, scale)),
      acquisitionMix: mock.acquisitionMix,
      subscriberTrend: mock.subscriberTrend,
      reservationsTrend: scaledSeries(mock.reservationsTrend, Math.max(0.2, scale)),
    }
  }
}

// Swap this adapter for a gold-layer REST client or Power BI semantic-model adapter in production.
export const dashboardDataAdapter: DashboardDataAdapter = new MockDashboardAdapter()