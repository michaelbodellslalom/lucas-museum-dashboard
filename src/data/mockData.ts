import type {
  AlertItem,
  CategoryValue,
  DemographicValue,
  HeatmapCell,
  Kpi,
  QueueRisk,
  TimePoint,
} from '../types/dashboard'

export const REPORTING_DATE = '2026-11-12'
export const REFRESH_TIME = '2026-11-13T05:00:00-08:00'

export const filterOptions = {
  membershipLevel: ['All membership levels', 'Individual', 'Dual', 'Family', 'Supporter+'],
  demographic: ['All demographics', 'Adult 18–64', 'Youth 6–17', 'Child under 6', 'Senior 65+', 'Student'],
  ticketPrice: ['All ticket prices', 'Complimentary ($0)', 'Access ($1–$20)', 'Standard ($21–$30)', 'Premium ($31+)'],
  membershipChannel: ['All membership channels', 'Online', 'In person'],
} as const

export const baseKpis: Kpi[] = [
  { id: 'tickets', label: 'Tickets sold', value: 4286, format: 'number', comparison: 8, definition: 'Paid and complimentary admissions booked during the selected completed period.', availability: 'day-one' },
  { id: 'attendance', label: 'Visitors checked in', value: 3618, format: 'number', comparison: 5, definition: 'Unique redeemed admissions recorded at entry scanners.', availability: 'day-one' },
  { id: 'redemption', label: 'Redemption rate', value: 84, format: 'percent', comparison: -2, definition: 'Checked-in visitors divided by tickets valid for the selected period.', availability: 'day-one' },
  { id: 'capacity', label: 'Capacity utilization', value: 73, format: 'percent', comparison: 5, definition: 'Attendance divided by available operating capacity.', availability: 'day-one' },
  { id: 'revenue', label: 'Total revenue', value: 187420, format: 'currency', comparison: 12, definition: 'Recognized ticketing, membership, commerce, event, and donation revenue.', availability: 'integration' },
  { id: 'revenue-per-visitor', label: 'Revenue per visitor', value: 51.80, format: 'currency', comparison: 6, definition: 'Total recognized revenue divided by checked-in visitors.', availability: 'integration' },
  { id: 'memberships', label: 'Memberships sold', value: 164, format: 'number', comparison: 15, definition: 'New paid memberships started in the selected period.', availability: 'day-one' },
  { id: 'conversion', label: 'Ticket-to-member conversion', value: 4, format: 'percent', comparison: 1, definition: 'Memberships sold divided by ticket purchases.', availability: 'day-one' },
]

export const alerts: AlertItem[] = [
  { priority: 1, status: 'Needs attention', title: 'East gallery queue reached 24 minutes', detail: 'The 1:00–2:00 PM peak exceeded the 15-minute service target.', action: 'Add one queue host and test overflow routing for the 1:00 PM window.' },
  { priority: 2, status: 'Watch', title: '2:30 PM timed entry reached 91% capacity', detail: 'Lobby arrivals clustered within the first 12 minutes of the window.', action: 'Shift 40 tickets to adjacent windows and stagger group arrival messaging.' },
  { priority: 3, status: 'Watch', title: 'Mobile checkout completion fell 5 points', detail: 'The largest loss occurred between payment entry and purchase confirmation.', action: 'Review payment errors and simplify mobile membership add-on treatment.' },
]

export const salesAttendance: TimePoint[] = [
  { label: '10 AM', current: 420, secondary: 328, prior: 382, capacity: 600 },
  { label: '11 AM', current: 558, secondary: 471, prior: 511, capacity: 650 },
  { label: '12 PM', current: 642, secondary: 536, prior: 574, capacity: 700 },
  { label: '1 PM', current: 736, secondary: 629, prior: 661, capacity: 720 },
  { label: '2 PM', current: 801, secondary: 684, prior: 712, capacity: 750 },
  { label: '3 PM', current: 579, secondary: 493, prior: 551, capacity: 700 },
  { label: '4 PM', current: 402, secondary: 331, prior: 391, capacity: 620 },
  { label: '5 PM', current: 148, secondary: 146, prior: 172, capacity: 420 },
]

export const revenueMix: CategoryValue[] = [
  { name: 'Ticketing', value: 78250, prior: 70940, color: '#285f7a' },
  { name: 'Memberships', value: 46300, prior: 39780, color: '#927039' },
  { name: 'Food & beverage', value: 21480, prior: 19810, color: '#bf6449' },
  { name: 'Retail', value: 17640, prior: 16890, color: '#4f7b65' },
  { name: 'Parking', value: 6840, prior: 6510, color: '#73536f' },
  { name: 'Events', value: 7210, prior: 6850, color: '#7393a1' },
  { name: 'Donations / founders', value: 9700, prior: 6790, color: '#d4a947' },
]

export const membershipChannels: CategoryValue[] = [
  { name: 'Online', value: 111, prior: 92, color: '#285f7a' },
  { name: 'In person', value: 53, prior: 51, color: '#bf6449' },
]

export const membershipLevels: CategoryValue[] = [
  { name: 'Individual', value: 58, prior: 51 },
  { name: 'Dual', value: 47, prior: 42 },
  { name: 'Family', value: 39, prior: 34 },
  { name: 'Supporter+', value: 20, prior: 16 },
]

export const visitorDemographics: DemographicValue[] = [
  { name: 'Adult 18–64', visitors: 1938, averageTicketPrice: 31.40 },
  { name: 'Youth 6–17', visitors: 684, averageTicketPrice: 17.20 },
  { name: 'Child under 6', visitors: 286, averageTicketPrice: 0 },
  { name: 'Senior 65+', visitors: 496, averageTicketPrice: 24.80 },
  { name: 'Student', visitors: 214, averageTicketPrice: 21.60 },
]

export const funnel: CategoryValue[] = [
  { name: 'Awareness', value: 18240, prior: 17500 },
  { name: 'Interest', value: 11280, prior: 10940 },
  { name: 'Desire', value: 7460, prior: 7210 },
  { name: 'Action', value: 4286, prior: 4140 },
]

export const capacityByHour: TimePoint[] = [
  { label: '10 AM', current: 55, prior: 51 }, { label: '11 AM', current: 72, prior: 67 },
  { label: '12 PM', current: 81, prior: 75 }, { label: '1 PM', current: 88, prior: 79 },
  { label: '2 PM', current: 91, prior: 84 }, { label: '3 PM', current: 76, prior: 73 },
  { label: '4 PM', current: 59, prior: 57 }, { label: '5 PM', current: 35, prior: 39 },
]

export const queueRisks: QueueRisk[] = [
  { location: 'East galleries', peak: 24, trend: 6, threshold: 15, action: 'Open overflow queue; add host at 12:45 PM.' },
  { location: '4th-floor elevators', peak: 18, trend: 4, threshold: 12, action: 'Stage elevator ambassador during 1–3 PM.' },
  { location: 'Restaurant host stand', peak: 16, trend: -2, threshold: 15, action: 'Hold current staffing; monitor reservations.' },
  { location: 'Cinema entry', peak: 11, trend: 1, threshold: 12, action: 'Maintain pre-scan 15 minutes before showtime.' },
  { location: 'Visitor services', peak: 9, trend: -1, threshold: 10, action: 'No change; preserve flex coverage.' },
]

const heatmapZones = ['Lobby', 'Elevators', 'Galleries', 'Theaters', 'Food', 'Retail', 'Park / garden']
const heatmapHours = ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM']
export const flowHeatmap: HeatmapCell[] = heatmapZones.flatMap((zone, zoneIndex) =>
  heatmapHours.map((hour, hourIndex) => ({
    zone,
    hour,
    value: Math.min(96, 24 + ((zoneIndex * 17 + hourIndex * 13) % 68) + (hourIndex === 4 ? 12 : 0)),
  })),
)

export const zoneUse: CategoryValue[] = [
  { name: 'Galleries', value: 2874 }, { name: 'Lobby', value: 2710 }, { name: 'Elevators', value: 2195 },
  { name: 'Food areas', value: 1488 }, { name: 'Theaters', value: 1216 }, { name: 'Retail', value: 936 },
  { name: 'Park / garden', value: 812 },
]

export const arrivalModes: CategoryValue[] = [
  { name: 'Parking', value: 31 }, { name: 'Rideshare', value: 21 }, { name: 'Transit', value: 18 },
  { name: 'Walking', value: 12 }, { name: 'Shuttle', value: 7 }, { name: 'Group transport', value: 6 },
  { name: 'Unknown', value: 5 },
]

export const dwellTime: CategoryValue[] = [
  { name: 'West gallery', value: 42, prior: 39 }, { name: 'East gallery', value: 37, prior: 34 },
  { name: 'Cinema', value: 51, prior: 50 }, { name: 'Archive gallery', value: 29, prior: 31 },
  { name: 'Park / garden', value: 24, prior: 22 }, { name: 'Retail', value: 16, prior: 15 },
]

export const galleryVisitors: CategoryValue[] = [
  { name: 'West gallery', value: 1922 }, { name: 'East gallery', value: 1746 },
  { name: 'Cinema', value: 1216 }, { name: 'Archive gallery', value: 1094 },
]

export const galleryTraffic: TimePoint[] = [
  { label: '10 AM', current: 214, secondary: 108, prior: 198 }, { label: '11 AM', current: 364, secondary: 172, prior: 339 },
  { label: '12 PM', current: 482, secondary: 236, prior: 445 }, { label: '1 PM', current: 611, secondary: 304, prior: 548 },
  { label: '2 PM', current: 684, secondary: 352, prior: 598 }, { label: '3 PM', current: 552, secondary: 289, prior: 519 },
  { label: '4 PM', current: 371, secondary: 214, prior: 352 }, { label: '5 PM', current: 166, secondary: 112, prior: 181 },
]

export const engagementAreas: TimePoint[] = [
  { label: '10 AM', current: 188, secondary: 96, prior: 174 }, { label: '11 AM', current: 326, secondary: 168, prior: 301 },
  { label: '12 PM', current: 474, secondary: 231, prior: 429 }, { label: '1 PM', current: 516, secondary: 248, prior: 481 },
  { label: '2 PM', current: 438, secondary: 219, prior: 412 }, { label: '3 PM', current: 351, secondary: 188, prior: 337 },
  { label: '4 PM', current: 264, secondary: 161, prior: 252 }, { label: '5 PM', current: 108, secondary: 84, prior: 116 },
]

export const acquisitionMix: CategoryValue[] = [
  { name: 'Organic search', value: 34 }, { name: 'Direct', value: 24 }, { name: 'Paid social', value: 16 },
  { name: 'Email', value: 13 }, { name: 'Referral', value: 8 }, { name: 'Other', value: 5 },
]

export const subscriberTrend: TimePoint[] = [
  { label: 'Nov 6', current: 41820, secondary: 128400, prior: 41240 }, { label: 'Nov 7', current: 42070, secondary: 129120, prior: 41480 },
  { label: 'Nov 8', current: 42310, secondary: 130040, prior: 41720 }, { label: 'Nov 9', current: 42680, secondary: 131300, prior: 41960 },
  { label: 'Nov 10', current: 42940, secondary: 132180, prior: 42210 }, { label: 'Nov 11', current: 43320, secondary: 133440, prior: 42480 },
  { label: 'Nov 12', current: 43780, secondary: 134920, prior: 42720 },
]

export const reservationsTrend: TimePoint[] = [
  { label: 'Nov 6', current: 184, prior: 171 }, { label: 'Nov 7', current: 201, prior: 188 },
  { label: 'Nov 8', current: 226, prior: 211 }, { label: 'Nov 9', current: 198, prior: 192 },
  { label: 'Nov 10', current: 244, prior: 219 }, { label: 'Nov 11', current: 262, prior: 237 },
  { label: 'Nov 12', current: 278, prior: 249 },
]