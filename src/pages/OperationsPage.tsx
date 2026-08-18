import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, Gauge, Info, MapPin, MessageSquareText, Minus, UsersRound } from 'lucide-react'
import {
  CapacityChart,
  FlowMap,
  Heatmap,
} from '../components/Charts'
import { ChartCard, SectionIntro, SourceBadge, StatusBadge } from '../components/DashboardUI'
import type { DashboardData } from '../types/dashboard'

type MetricComparison = { direction: 'up' | 'down' | 'flat'; label: string; secondaryLabel?: string; tone: 'good' | 'bad' | 'muted' }

function MiniMetric({ label, value, detail, definition, comparison, annotation = false, annotationText = 'Annotation text to be provided', icon: Icon }: { label: string; value: string; detail: string; definition?: string; comparison?: MetricComparison; annotation?: boolean; annotationText?: string; icon: typeof Gauge }) {
  const TrendIcon = comparison?.direction === 'up' ? ArrowUpRight : comparison?.direction === 'down' ? ArrowDownRight : Minus
  return <article className="mini-metric"><div className="mini-metric-heading"><Icon size={19} /><div className="mini-metric-actions">{definition && <button className="info-button" aria-label={`Definition: ${definition}`} data-tooltip={definition}><Info size={15} /></button>}{annotation && <button className="info-button annotation-button" aria-label={`Annotation for ${label}`} data-tooltip={annotationText}><MessageSquareText size={15} /></button>}</div></div><span>{label}</span><strong>{value}</strong>{comparison && <div className={`mini-metric-comparison trend trend-${comparison.tone}`}><TrendIcon size={15} />{comparison.label}{comparison.secondaryLabel && <><i>/</i><TrendIcon size={15} />{comparison.secondaryLabel}</>}</div>}<small>{detail}</small></article>
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

function InsightPanel({ title, titleId, items }: { title: string; titleId?: string; items: { text: string; action: string }[] }) {
  return <aside className="action-panel"><span className="section-kicker">Recommended action</span><h3 id={titleId}>{title}</h3>{items.map((item) => <div key={item.text}><p>{item.text}</p><strong><ArrowRight size={14} />{item.action}</strong></div>)}</aside>
}

const galleryAttendanceBaseline = [
  { name: 'Art and Artists', capacity: 1000, utilization: 75, visitors: 749, duration: 45 },
  { name: 'Graphic Storytelling', capacity: 500, utilization: 93, visitors: 424, duration: 12 },
  { name: 'Cinematic Art', capacity: 300, utilization: 97, visitors: 287, duration: 67 },
  { name: 'History', capacity: 100, utilization: 80, visitors: 80, duration: 32 },
  { name: 'Community', capacity: 70, utilization: 89, visitors: 62, duration: 23 },
  { name: 'Comics', capacity: 50, utilization: 35, visitors: 20, duration: 25 },
  { name: 'Frank Frazetta', capacity: 50, utilization: 85, visitors: 46, duration: 34 },
  { name: "Children's Stories", capacity: 40, utilization: 95, visitors: 38, duration: 13 },
  { name: 'Fantasy', capacity: 35, utilization: 67, visitors: 27, duration: 27 },
]

function GalleryAttendanceTable({ periodScale, averageFactor }: { periodScale: number; averageFactor: number }) {
  const rows = galleryAttendanceBaseline.map((gallery) => ({
    ...gallery,
    capacity: Math.round(gallery.capacity * periodScale),
    visitors: Math.round(gallery.visitors * periodScale),
    duration: Math.round(gallery.duration * averageFactor),
  }))
  const totalCapacity = rows.reduce((total, gallery) => total + gallery.capacity, 0)
  const totalVisitors = rows.reduce((total, gallery) => total + gallery.visitors, 0)
  const averageUtilization = Math.round(rows.reduce((total, gallery) => total + gallery.utilization, 0) / rows.length)
  const averageVisitors = Math.round(totalVisitors / rows.length)
  const averageDuration = Math.round(rows.reduce((total, gallery) => total + gallery.duration, 0) / rows.length)

  return <div className="gallery-attendance-wrap"><table className="gallery-attendance-table"><thead><tr><th>Gallery name</th><th>Total capacity</th><th>Avg. % of capacity</th><th>Avg. visitors</th><th>Avg. visit duration</th></tr></thead><tbody>{rows.map((gallery) => <tr key={gallery.name}><th>{gallery.name}</th><td>{gallery.capacity.toLocaleString()}</td><td>{gallery.utilization}%</td><td>{gallery.visitors.toLocaleString()}</td><td>{gallery.duration} min</td></tr>)}</tbody><tfoot><tr><th>Total</th><td>{totalCapacity.toLocaleString()}</td><td>{averageUtilization}%</td><td>{averageVisitors.toLocaleString()}</td><td>{averageDuration} min</td></tr></tfoot></table></div>
}

export function OperationsPage({ data }: { data: DashboardData }) {
  const attendance = data.kpis.find((kpi) => kpi.id === 'attendance')?.value ?? 0
  const capacityKpi = data.kpis.find((kpi) => kpi.id === 'capacity')
  const capacity = capacityKpi?.value ?? 0
  const capacityStatus = capacity >= 85 ? 'At risk' : capacity >= 70 ? 'Watch' : 'On track'
  const galleryDwellTimes = data.dwellTime.filter((item) => item.name.toLowerCase().includes('gallery'))
  const averageGalleryVisit = galleryDwellTimes.length
    ? Math.round(galleryDwellTimes.reduce((total, item) => total + item.value, 0) / galleryDwellTimes.length)
    : 0
  const averagePriorGalleryVisit = galleryDwellTimes.length
    ? Math.round(galleryDwellTimes.reduce((total, item) => total + (item.prior ?? item.value), 0) / galleryDwellTimes.length)
    : 0
  const latestReservationPoint = data.reservationsTrend[data.reservationsTrend.length - 1]
  const latestReservations = latestReservationPoint?.current ?? 0
  const reservationComparison = latestReservationPoint?.prior
    ? Math.round(((latestReservations - latestReservationPoint.prior) / latestReservationPoint.prior) * 100)
    : 0
  const cinemaWaitTrend = data.queueRisks.find((risk) => risk.location === 'Cinema entry')?.trend ?? 0
  const elevatorWaitTrend = data.queueRisks.find((risk) => risk.location === '4th-floor elevators')?.trend ?? 0
  const averageCinemaWait = Math.max(1, Math.round(12 * data.averageFactor))
  const averageElevatorWait = Math.max(1, Math.ceil(4 * data.averageFactor))
  const elevatorPartySize = Math.max(1, 3 + Math.round((data.averageFactor - 1) * 8))
  const museumVisitMinutes = Math.round(188 * data.averageFactor)
  const repeatCustomerRate = Math.min(100, Math.round(9 * data.averageFactor))
  const repeatCustomerComparison = Math.max(1, Math.round(2 * data.averageFactor))
  const availableCapacity = Math.round(4970 * data.periodScale)
  const peakCapacity = Math.max(...data.capacityByHour.map((item) => item.current))
  const priorPeakCapacity = Math.max(...data.capacityByHour.map((item) => item.prior))
  const peakHeadroom = Math.round(68 * data.averageFactor)
  const peakGalleryLoad = Math.min(100, Math.round(88 * data.averageFactor))
  return (
    <div className="page operations-page">
      <section className="page-hero operations-hero">
        <div><h1>Operations Efficiencies Detail</h1><p>Completed-day visitor flow and onsite experience translated into practical operating decisions.</p><div className="hero-period"><Clock3 size={17} /><span>{data.periodLabel} · <strong>{data.dateRangeLabel}</strong></span></div></div>
      </section>

      <section aria-labelledby="glance-title">
        <div className="section-heading"><div><h2 id="glance-title">The Operating Picture</h2></div><p>Compared with {data.comparisonLabel}</p></div>
        <div className="mini-metric-grid operating-picture-grid">
          <MiniMetric icon={Gauge} label="% of Capacity" value={`${Math.round(capacity)}%`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: `${Math.round(Math.abs(capacityKpi?.comparison ?? 0))}%`, tone: 'good' }} definition="Checked-in attendance divided by available visitor capacity for the selected completed period." annotation annotationText="What is our average % of capacity daily?" />
          <MiniMetric icon={Clock3} label="Avg Cinema Wait Time" value={`${averageCinemaWait} min`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: cinemaWaitTrend >= 0 ? 'up' : 'down', label: `${Math.abs(cinemaWaitTrend)} min`, tone: cinemaWaitTrend > 0 ? 'bad' : 'good' }} definition="Average observed or estimated wait for cinema and gallery entry during the selected period." annotation annotationText="What is the average wait time for the Cinema gallery?" />
          <MiniMetric icon={Clock3} label="Avg Elevator Wait Time" value={`${averageElevatorWait} min`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: elevatorWaitTrend >= 0 ? 'up' : 'down', label: `${Math.abs(elevatorWaitTrend)} min`, tone: elevatorWaitTrend > 0 ? 'bad' : 'good' }} definition="Average observed or estimated elevator wait during the selected completed period." annotation annotationText="What is the average wait time for the elevators?" />
          <MiniMetric icon={UsersRound} label="Avg Elevator Party Size" value={`${elevatorPartySize} people`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: '1 person', tone: 'bad' }} definition="Average visitors per observed elevator party based on aggregated instrumentation." annotation annotationText="What was the average party size in the elevators?" />
          <MiniMetric icon={Clock3} label="Avg Museum Visit Duration" value={formatDuration(museumVisitMinutes)} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: `${Math.round(11 * data.averageFactor)} min`, tone: 'good' }} definition="Average elapsed time between visitor arrival and departure during the selected period." annotation annotationText="How long are people spending in the museum on average today, this week, this month?" />
          <MiniMetric icon={MapPin} label="Avg Gallery Visit Duration" value={`${averageGalleryVisit} min`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: averageGalleryVisit >= averagePriorGalleryVisit ? 'up' : 'down', label: `${Math.abs(averageGalleryVisit - averagePriorGalleryVisit)} min`, tone: averageGalleryVisit >= averagePriorGalleryVisit ? 'good' : 'muted' }} definition="Average time across west, east, and archive gallery observations." annotation annotationText="How long are people spending in each gallery?" />
          <MiniMetric icon={UsersRound} label="Restaurant Reservations" value={Math.round(latestReservations).toLocaleString()} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: reservationComparison >= 0 ? 'up' : 'down', label: `${Math.abs(reservationComparison)}%`, tone: reservationComparison >= 0 ? 'good' : 'muted' }} definition="Completed restaurant reservations during the selected completed period." annotation annotationText="How many reservations do we have at the restaurant today?" />
          <MiniMetric icon={UsersRound} label="Restaurant Repeat Customers" value={`${repeatCustomerRate}%`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: `${repeatCustomerComparison}%`, tone: 'good' }} definition="Share of consented restaurant reservations attributed to repeat customers." annotation annotationText="How many repeat customers booked reservations today, this week, this month?" />
        </div>
      </section>

      <section className="recommended-insights" aria-labelledby="experience-insights-title">
        <InsightPanel title="Experience insights" titleId="experience-insights-title" items={[
          { text: `East gallery reached ${peakGalleryLoad}% of its comfortable operating capacity at 1:40 PM.`, action: 'Add floor staff and use soft routing toward Archive gallery.' },
          { text: `Cinema turnaround left a ${Math.round(14 * data.averageFactor)}-minute overlap between exiting and arriving audiences.`, action: 'Increase turnaround to 20 minutes for the 2:30 PM program.' },
          { text: 'Level 5 food demand remained elevated after gallery traffic eased.', action: 'Keep the service line open through 4:15 PM.' },
        ]} />
      </section>

      <div className="operations-band">
        <SectionIntro title="Operations Efficiencies" description="Where capacity, queues, movement, and arrivals created operational risk during the completed business day." />

        <section className="ops-subsection" aria-labelledby="capacity-title">
          <div className="subsection-title"><div><span>Daily capacity utilization</span><h3 id="capacity-title">Attendance vs. available capacity</h3></div><SourceBadge type="day-one" /></div>
          <div className="two-column-grid">
            <ChartCard title="Capacity by hour and timed-entry window" subtitle={`Peak: ${peakCapacity}% · 2:00–3:00 PM`} insight="The museum stayed within daily capacity, but the 1:00 and 2:00 PM windows concentrated demand above the at-risk threshold." action="Reallocate 40 admissions toward the 3:00 PM window."><CapacityChart data={data.capacityByHour} /></ChartCard>
            <div className="capacity-detail"><span className="section-kicker">Completed-day capacity</span><strong>{Math.round(attendance).toLocaleString()} <small>visitors</small></strong><p>{availableCapacity.toLocaleString()} available visitor capacity across completed operating hours.</p><dl><div><dt>Average utilization</dt><dd>{Math.round(capacity)}%</dd></div><div><dt>Peak window</dt><dd>2:00–3:00 PM</dd></div><div><dt>Peak headroom</dt><dd>{peakHeadroom.toLocaleString()} visitors</dd></div><div><dt>Prior peak</dt><dd>{priorPeakCapacity}%</dd></div></dl><StatusBadge status={capacityStatus} /></div>
          </div>
        </section>

        <section className="ops-subsection" aria-labelledby="flow-title">
          <div className="subsection-title"><div><span>Visitor flow and congestion</span><h3 id="flow-title">Movement by time, floor, and zone</h3></div><SourceBadge type="instrumentation" /></div>
          <div className="two-column-grid flow-grid">
            <ChartCard title="Time-of-day traffic heatmap" subtitle="Relative traffic index from aggregated observations" badge="instrumentation" insight="Elevator and gallery traffic converged between 1:00 and 3:00 PM; dining demand peaked later." action="Stage floor hosts before the 1:00 PM arrival wave."><Heatmap data={data.flowHeatmap} /></ChartCard>
            <ChartCard title="Simplified floor flow" subtitle="High-interest completed-day movement peaks" badge="instrumentation"><FlowMap scale={data.periodScale} /></ChartCard>
            <ChartCard className="gallery-attendance-card" title="Visitor attendance by gallery" subtitle="Capacity, attendance, and visit duration by gallery" badge="instrumentation"><GalleryAttendanceTable periodScale={data.periodScale} averageFactor={data.averageFactor} /></ChartCard>
          </div>
        </section>

      </div>

    </div>
  )
}