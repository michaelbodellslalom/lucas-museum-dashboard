import type {
  AlertItem,
  CategoryValue,
  DemographicValue,
  HeatmapCell,
  Kpi,
  QueueRisk,
  GalleryPerformance,
  RevenuePlanRow,
  RevenueTrendPoint,
  RetailItem,
  TimePoint,
} from '../types/dashboard'

export const REPORTING_DATE = '2026-11-12'
export const REFRESH_TIME = '2026-11-12T05:00:00-08:00'

export const filterOptions = {
  membershipLevel: ['All membership levels', 'Access', 'Alliance', 'Corporate', 'Insider', 'Social'],
  demographic: ['Select all', 'Adult', 'Senior', 'Member', 'LM37', 'Child Teen', 'SNAP/EBT', 'Corporate Guest'],
  ticketPrice: ['All ticket prices', 'Adult ($25)', 'Senior ($21)', 'Member ($0)', 'LM37 ($0)', 'Child Teen ($0)', 'SNAP/EBT ($3)', 'Corporate Guest ($0)'],
  membershipChannel: ['All membership channels', 'Online', 'In person'],
} as const

export const baseKpis: Kpi[] = [
  { id: 'tickets', group: 'Admissions & Experience', label: 'Tickets sold', value: 4286, format: 'number', comparison: 8, definition: 'Paid and complimentary admissions booked during the selected completed period.', availability: 'day-one' },
  { id: 'attendance', group: 'Admissions & Experience', label: 'Visitors checked in', value: 3618, format: 'number', comparison: 5, definition: 'Unique redeemed admissions recorded at entry scanners.', availability: 'day-one' },
  { id: 'redemption', group: 'Admissions & Experience', label: 'Redemption rate', value: 84, format: 'percent', comparison: -2, definition: 'Checked-in visitors divided by tickets valid for the selected period.', availability: 'day-one' },
  { id: 'capacity', group: 'Admissions & Experience', label: 'Capacity utilization', value: 73, format: 'percent', comparison: 5, definition: 'Attendance divided by available operating capacity.', availability: 'day-one' },
  { id: 'satisfaction', group: 'Admissions & Experience', label: 'Visitor satisfaction rate', value: 92, format: 'percent', comparison: 3, definition: 'Share of post-visit respondents rating their museum experience positively.', availability: 'instrumentation' },
  { id: 'web-visitors', group: 'Admissions & Experience', label: 'Web visitors', value: 18420, format: 'number', comparison: 7, definition: 'Unique visitors to the museum website during the selected period.', availability: 'integration' },
  { id: 'click-through-rate', group: 'Admissions & Experience', label: 'Click-through rate', value: 6.8, format: 'percent', comparison: 1, definition: 'Share of tracked website sessions that clicked a primary ticketing or membership call to action.', availability: 'integration' },
  { id: 'average-dwell-time', group: 'Admissions & Experience', label: 'Average dwell time', value: 188, format: 'duration', comparison: 5, definition: 'Average time visitors spend in the museum during the selected period.', availability: 'instrumentation' },
  { id: 'revenue', group: 'Revenue', label: 'Total revenue', value: 187420, format: 'currency', comparison: 12, definition: 'Recognized ticketing, membership, commerce, event, and donation revenue.', availability: 'integration' },
  { id: 'revenue-per-visitor', group: 'Revenue', label: 'Revenue per visitor', value: 51.80, format: 'currency', comparison: 6, definition: 'Total recognized revenue divided by checked-in visitors.', availability: 'integration' },
  { id: 'onsite-retail-revenue', group: 'Revenue', label: 'Onsite: Retail revenue', value: 9600, format: 'currency', comparison: 8, definition: 'Recognized retail revenue from onsite museum stores during the selected period.', availability: 'integration' },
  { id: 'cafe-revenue', group: 'Revenue', label: 'Café revenue', value: 8200, format: 'currency', comparison: 5, definition: 'Recognized revenue from the onsite café during the selected period.', availability: 'integration' },
  { id: 'restaurant-revenue', group: 'Revenue', label: 'Restaurant revenue', value: 12400, format: 'currency', comparison: 11, definition: 'Recognized revenue from the onsite restaurant during the selected period.', availability: 'integration' },
  { id: 'onsite-tickets-membership-revenue', group: 'Revenue', label: 'Onsite Tickets & Membership revenue', value: 64000, format: 'currency', comparison: 9, definition: 'Recognized ticket and membership revenue transacted onsite during the selected period.', availability: 'integration' },
  { id: 'online-ticketing-revenue', group: 'Revenue', label: 'Online Ticketing revenue', value: 14250, format: 'currency', comparison: 14, definition: 'Recognized ticket revenue transacted through online ticketing during the selected period.', availability: 'integration' },
  { id: 'online-membership-revenue', group: 'Revenue', label: 'Online Membership revenue', value: 30800, format: 'currency', comparison: 16, definition: 'Recognized membership revenue transacted online during the selected period.', availability: 'integration' },
  { id: 'donations-received', group: 'Fundraising', label: 'Donations received', value: 137, format: 'number', comparison: 9, definition: 'Number of individual donation transactions recorded during the selected period.', availability: 'integration' },
  { id: 'donation-amount', group: 'Fundraising', label: 'Total donation amount', value: 9700, format: 'currency', comparison: 14, definition: 'Total donation and founder revenue recorded during the selected period.', availability: 'integration' },
  { id: 'online-donations', group: 'Fundraising', label: 'Online Donations', value: 9700, format: 'currency', comparison: 14, definition: 'Recognized donations transacted online during the selected period.', availability: 'integration' },
  { id: 'onsite-donations', group: 'Fundraising', label: 'Onsite Donations', value: 4200, format: 'currency', comparison: 7, definition: 'Recognized donations transacted onsite during the selected period.', availability: 'integration' },
  { id: 'memberships', group: 'Membership', label: 'Memberships sold', value: 164, format: 'number', comparison: 15, definition: 'New paid memberships started in the selected period.', availability: 'day-one' },
  { id: 'conversion', group: 'Membership', label: 'Ticket-to-member conversion', value: 4, format: 'percent', comparison: 1, definition: 'Memberships sold divided by ticket purchases.', availability: 'day-one' },
  { id: 'member-party-size', group: 'Membership', label: 'Average party size per member visit', value: 2.6, format: 'decimal', comparison: 4, definition: 'Average number of visitors included in a member-led museum visit.', availability: 'instrumentation' },
  { id: 'member-benefit-usage', group: 'Membership', label: 'Average members using benefits', value: 842, format: 'number', comparison: 11, definition: 'Average number of members who redeemed at least one membership benefit during the selected period.', availability: 'integration' },
  { id: 'events-sold', group: 'Events', label: 'Events sold', value: 28, format: 'number', comparison: 4, definition: 'Paid event registrations completed during the selected period.', availability: 'integration' },
  { id: 'event-inquiries', group: 'Events', label: 'Event inquiries', value: 64, format: 'number', comparison: -6, definition: 'Qualified event and venue inquiries received during the selected period.', availability: 'integration' },
  { id: 'events-contracted', group: 'Events', label: '# of events contracted', value: 22, format: 'number', comparison: 6, definition: 'Events with a signed contract recorded during the selected period.', availability: 'integration' },
  { id: 'events-partial-payment', group: 'Events', label: '# of events with partial payment', value: 9, format: 'number', comparison: 12, definition: 'Contracted events with at least one partial payment recorded during the selected period.', availability: 'integration' },
]

export const alerts: AlertItem[] = [
  { priority: 1, status: 'Needs attention', title: 'East gallery queue reached 24 minutes', detail: 'The 1:00–2:00 PM peak exceeded the 15-minute service target.', action: 'Add one queue host and test overflow routing for the 1:00 PM window.' },
  { priority: 2, status: 'Watch', title: '2:30 PM timed entry reached 91% capacity', detail: 'Lobby arrivals clustered within the first 12 minutes of the window.', action: 'Shift 40 tickets to adjacent windows and stagger group arrival messaging.' },
  { priority: 3, status: 'Watch', title: 'Mobile checkout completion fell 5 points', detail: 'The largest loss occurred between payment entry and purchase confirmation.', action: 'Review payment errors and simplify mobile membership add-on treatment.' },
]

export const salesAttendance: TimePoint[] = [
  { label: '9 AM', current: 286, secondary: 214, prior: 261, capacity: 520 },
  { label: '10 AM', current: 420, secondary: 328, prior: 382, capacity: 600 },
  { label: '11 AM', current: 558, secondary: 471, prior: 511, capacity: 650 },
  { label: '12 PM', current: 642, secondary: 536, prior: 574, capacity: 700 },
  { label: '1 PM', current: 736, secondary: 629, prior: 661, capacity: 720 },
  { label: '2 PM', current: 801, secondary: 684, prior: 712, capacity: 750 },
  { label: '3 PM', current: 579, secondary: 493, prior: 551, capacity: 700 },
  { label: '4 PM', current: 402, secondary: 331, prior: 391, capacity: 620 },
  { label: '5 PM', current: 148, secondary: 146, prior: 172, capacity: 420 },
  { label: '6 PM', current: 96, secondary: 82, prior: 101, capacity: 330 },
  { label: '7 PM', current: 54, secondary: 48, prior: 62, capacity: 240 },
]

export const revenueMix: CategoryValue[] = [
  { name: 'Ticketing', value: 78250, prior: 70940, color: '#b89a6a' },
  { name: 'Memberships', value: 46300, prior: 39780, color: '#000000' },
  { name: 'Food & beverage', value: 21480, prior: 19810, color: '#688276' },
  { name: 'Retail', value: 17640, prior: 16890, color: '#55758a' },
  { name: 'Parking', value: 6840, prior: 6510, color: '#9b806d' },
  { name: 'Events', value: 7210, prior: 6850, color: '#7a7a7a' },
  { name: 'Donations / founders', value: 9700, prior: 6790, color: '#c9c9c9' },
]

export const membershipChannels: CategoryValue[] = [
  { name: 'Online', value: 111, prior: 92, color: '#b89a6a' },
  { name: 'In person', value: 53, prior: 51, color: '#000000' },
]

export const membershipLevels: CategoryValue[] = [
  { name: 'Access', value: 41, prior: 36 },
  { name: 'Alliance', value: 49, prior: 43 },
  { name: 'Corporate', value: 33, prior: 29 },
  { name: 'Insider', value: 25, prior: 21 },
  { name: 'Social', value: 16, prior: 14 },
]

export const visitorDemographics: DemographicValue[] = [
  { name: 'Adult', visitors: 1809, ticketPrice: 25 },
  { name: 'Senior', visitors: 543, ticketPrice: 21 },
  { name: 'Member', visitors: 612, ticketPrice: 0 },
  { name: 'LM37', visitors: 204, ticketPrice: 0 },
  { name: 'Child Teen', visitors: 434, ticketPrice: 0, stackedVisitors: 543, stackedTicketPrice: 0, stackedLabel: 'Teen' },
  { name: 'SNAP/EBT', visitors: 118, ticketPrice: 3 },
  { name: 'Corporate Guest', visitors: 177, ticketPrice: 0 },
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
  { location: '4th-floor elevators', peak: 18, trend: -2, threshold: 12, action: 'Stage elevator ambassador during 1–3 PM.' },
  { location: 'Restaurant host stand', peak: 16, trend: -2, threshold: 15, action: 'Hold current staffing; monitor reservations.' },
  { location: 'Cinema entry', peak: 11, trend: -1, threshold: 12, action: 'Maintain pre-scan 15 minutes before showtime.' },
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

export const retailItems: RetailItem[] = [
  { name: 'Museum catalog', inStore: 184, online: 142, inStoreRevenue: 8280, onlineRevenue: 6390 },
  { name: 'LM enamel pin', inStore: 216, online: 96, inStoreRevenue: 4320, onlineRevenue: 1920 },
  { name: 'Exhibition poster', inStore: 149, online: 118, inStoreRevenue: 5215, onlineRevenue: 4130 },
  { name: 'Storytelling tote', inStore: 132, online: 89, inStoreRevenue: 5280, onlineRevenue: 3560 },
  { name: 'Children\'s art kit', inStore: 108, online: 76, inStoreRevenue: 3780, onlineRevenue: 2660 },
  { name: 'Artist print set', inStore: 76, online: 103, inStoreRevenue: 5320, onlineRevenue: 7210 },
  { name: 'Postcard folio', inStore: 91, online: 54, inStoreRevenue: 1365, onlineRevenue: 810 },
  { name: 'Gallery guide', inStore: 83, online: 46, inStoreRevenue: 830, onlineRevenue: 460 },
]

export const revenueTrend: RevenueTrendPoint[] = [
  { label: 'Nov 6', ticketing: 22400, memberships: 11200, foodAndBeverage: 3180, retail: 2640, events: 980 },
  { label: 'Nov 7', ticketing: 25800, memberships: 12600, foodAndBeverage: 3420, retail: 2780, events: 1240 },
  { label: 'Nov 8', ticketing: 28100, memberships: 13900, foodAndBeverage: 3680, retail: 3110, events: 870 },
  { label: 'Nov 9', ticketing: 19600, memberships: 9800, foodAndBeverage: 2810, retail: 2320, events: 1120 },
  { label: 'Nov 10', ticketing: 24200, memberships: 11700, foodAndBeverage: 3260, retail: 2740, events: 1360 },
  { label: 'Nov 11', ticketing: 27600, memberships: 14100, foodAndBeverage: 3890, retail: 3250, events: 1640 },
  { label: 'Nov 12', ticketing: 30550, memberships: 15200, foodAndBeverage: 4240, retail: 3480, events: 1980 },
]

export const galleryPerformance: GalleryPerformance[] = [
  { name: 'Cinematic Art', dwellTime: 67, visitors: 287 },
  { name: 'Art and Artists', dwellTime: 45, visitors: 749 },
  { name: 'Cinema', dwellTime: 51, visitors: 1216 },
  { name: 'West gallery', dwellTime: 42, visitors: 1922 },
  { name: 'East gallery', dwellTime: 37, visitors: 1746 },
  { name: 'Narrative Illustration', dwellTime: 32, visitors: 80 },
  { name: 'Archive gallery', dwellTime: 29, visitors: 1094 },
  { name: 'Storyboard Archive', dwellTime: 27, visitors: 27 },
  { name: 'Graphic Novel Gallery', dwellTime: 25, visitors: 20 },
  { name: 'Park / garden', dwellTime: 24, visitors: 812 },
]

export const revenuePlan: RevenuePlanRow[] = [
  { channel: 'Ticketing', actual: 78250, planned: 76000 },
  { channel: 'Memberships', actual: 46300, planned: 48000 },
  { channel: 'Food & beverage', actual: 21480, planned: 20500 },
  { channel: 'Retail', actual: 17640, planned: 18400 },
  { channel: 'Parking', actual: 6840, planned: 7000 },
  { channel: 'Events', actual: 7210, planned: 6800 },
]