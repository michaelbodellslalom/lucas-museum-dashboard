import { ArrowDownRight, ArrowRight, ArrowUpRight, CarFront, Clock3, Gauge, Info, MapPin, Minus, MousePointerClick, UsersRound } from 'lucide-react'
import {
  AreaPairChart,
  CapacityChart,
  DonutChart,
  FlowMap,
  FunnelChart,
  Heatmap,
  HorizontalBarChart,
} from '../components/Charts'
import { ChartCard, SectionIntro, SourceBadge, StatusBadge } from '../components/DashboardUI'
import type { DashboardData } from '../types/dashboard'

type MetricComparison = { direction: 'up' | 'down' | 'flat'; label: string; secondaryLabel?: string; tone: 'good' | 'bad' | 'muted' }

function MiniMetric({ label, value, detail, definition, comparison, icon: Icon }: { label: string; value: string; detail: string; definition?: string; comparison?: MetricComparison; icon: typeof Gauge }) {
  const TrendIcon = comparison?.direction === 'up' ? ArrowUpRight : comparison?.direction === 'down' ? ArrowDownRight : Minus
  return <article className="mini-metric"><div className="mini-metric-heading"><Icon size={19} />{definition && <button className="info-button" aria-label={`Definition: ${definition}`} data-tooltip={definition}><Info size={15} /></button>}</div><span>{label}</span><strong>{value}</strong>{comparison && <div className={`mini-metric-comparison trend trend-${comparison.tone}`}><TrendIcon size={15} />{comparison.label}{comparison.secondaryLabel && <><i>/</i><TrendIcon size={15} />{comparison.secondaryLabel}</>}</div>}<small>{detail}</small></article>
}

function InsightPanel({ title, items }: { title: string; items: { text: string; action: string }[] }) {
  return <aside className="action-panel"><span className="section-kicker">Recommended action</span><h3>{title}</h3>{items.map((item) => <div key={item.text}><p>{item.text}</p><strong><ArrowRight size={14} />{item.action}</strong></div>)}</aside>
}

export function OperationsPage({ data }: { data: DashboardData }) {
  const attendance = data.kpis.find((kpi) => kpi.id === 'attendance')?.value ?? 0
  const capacityKpi = data.kpis.find((kpi) => kpi.id === 'capacity')
  const capacity = capacityKpi?.value ?? 0
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
  const webVisitors = data.funnel[0]
  const totalWebVisitors = webVisitors?.value ?? 0
  const webComparison = webVisitors?.prior
    ? Math.round(((totalWebVisitors - webVisitors.prior) / webVisitors.prior) * 100)
    : 0
  const cinemaWaitTrend = data.queueRisks.find((risk) => risk.location === 'Cinema entry')?.trend ?? 0
  const elevatorWaitTrend = data.queueRisks.find((risk) => risk.location === '4th-floor elevators')?.trend ?? 0
  return (
    <div className="page operations-page">
      <section className="page-hero operations-hero">
        <div><h1>Operations & Visitor Services</h1><p>Completed-day visitor flow, onsite experience, and digital demand translated into practical operating decisions.</p><div className="hero-period"><Clock3 size={17} /><span>{data.periodLabel} · <strong>{data.dateRangeLabel}</strong></span></div></div>
      </section>

      <section aria-labelledby="glance-title">
        <div className="section-heading"><div><h2 id="glance-title">The Operating Picture</h2></div><p>Compared with {data.comparisonLabel}</p></div>
        <div className="mini-metric-grid operating-picture-grid">
          <MiniMetric icon={Gauge} label="% of Capacity" value={`${Math.round(capacity)}%`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: `${Math.round(Math.abs(capacityKpi?.comparison ?? 0))}%`, tone: 'good' }} definition="Checked-in attendance divided by available visitor capacity for the selected completed period." />
          <MiniMetric icon={Clock3} label="Avg Cinema Wait Time" value="12 min" detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: cinemaWaitTrend >= 0 ? 'up' : 'down', label: `${Math.abs(cinemaWaitTrend)} min`, tone: cinemaWaitTrend > 0 ? 'bad' : 'good' }} definition="Average observed or estimated wait for cinema and gallery entry during the selected period." />
          <MiniMetric icon={Clock3} label="Avg Elevator Wait Time" value="4 min" detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: elevatorWaitTrend >= 0 ? 'up' : 'down', label: `${Math.abs(elevatorWaitTrend)} min`, tone: elevatorWaitTrend > 0 ? 'bad' : 'good' }} definition="Average observed or estimated elevator wait during the selected completed period." />
          <MiniMetric icon={UsersRound} label="Avg Elevator Party Size" value="3 people" detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: '1 person', tone: 'bad' }} definition="Average visitors per observed elevator party based on aggregated instrumentation." />
          <MiniMetric icon={Clock3} label="Avg Museum Visit Duration" value="3h 08m" detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: '11 min', tone: 'good' }} definition="Average elapsed time between visitor arrival and departure during the selected period." />
          <MiniMetric icon={MapPin} label="Avg Gallery Visit Duration" value={`${averageGalleryVisit} min`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: averageGalleryVisit >= averagePriorGalleryVisit ? 'up' : 'down', label: `${Math.abs(averageGalleryVisit - averagePriorGalleryVisit)} min`, tone: averageGalleryVisit >= averagePriorGalleryVisit ? 'good' : 'muted' }} definition="Average dwell time across west, east, and archive gallery observations." />
          <MiniMetric icon={UsersRound} label="Restaurant Reservation / Repeat Customers" value={`${Math.round(latestReservations).toLocaleString()} / 9%`} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: 'up', label: `${Math.abs(reservationComparison)}%`, secondaryLabel: '2%', tone: 'good' }} definition="Completed restaurant reservations and the consented share attributed to repeat customers." />
          <MiniMetric icon={MousePointerClick} label="Total Web Visitors" value={Math.round(totalWebVisitors).toLocaleString()} detail={`vs. ${data.comparisonLabel}`} comparison={{ direction: webComparison >= 0 ? 'up' : 'down', label: `${Math.abs(webComparison)}%`, tone: webComparison >= 0 ? 'good' : 'muted' }} definition="Website sessions recorded during the selected completed period." />
        </div>
      </section>

      <div className="operations-band">
        <SectionIntro title="Operations & Visitor Services" description="Where capacity, queues, movement, and arrivals created operational risk during the completed business day." />

        <section className="ops-subsection" aria-labelledby="capacity-title">
          <div className="subsection-title"><div><span>Daily capacity utilization</span><h3 id="capacity-title">Attendance vs. available capacity</h3></div><SourceBadge type="day-one" /></div>
          <div className="threshold-row"><span><i className="threshold-good" />On track · under 70%</span><span><i className="threshold-watch" />Watch · 70–84%</span><span><i className="threshold-risk" />At risk · 85%+</span></div>
          <div className="two-column-grid">
            <ChartCard title="Capacity by hour and timed-entry window" subtitle="Peak: 91% · 2:00–3:00 PM" insight="The museum stayed within daily capacity, but the 1:00 and 2:00 PM windows concentrated demand above the at-risk threshold." action="Reallocate 40 admissions toward the 3:00 PM window."><CapacityChart data={data.capacityByHour} /></ChartCard>
            <div className="capacity-detail"><span className="section-kicker">Completed-day capacity</span><strong>{Math.round(attendance).toLocaleString()} <small>visitors</small></strong><p>4,970 available visitor capacity across completed operating hours.</p><dl><div><dt>Average utilization</dt><dd>73%</dd></div><div><dt>Peak window</dt><dd>2:00–3:00 PM</dd></div><div><dt>Peak headroom</dt><dd>68 visitors</dd></div><div><dt>Prior peak</dt><dd>84%</dd></div></dl><StatusBadge status="Watch" /></div>
          </div>
        </section>

        <section className="ops-subsection" aria-labelledby="queue-title">
          <div className="subsection-title"><div><span>Wait-time monitoring</span><h3 id="queue-title">Ranked queue risk</h3></div><SourceBadge type="instrumentation" /></div>
          <p className="method-note">Queue measures require sensors or structured staff observations. Demo values combine observations with ticket-scan and transaction proxies.</p>
          <div className="queue-layout">
            <div className="table-wrap"><table><caption>Locations ranked by peak wait relative to service target</caption><thead><tr><th>Location</th><th>Peak wait</th><th>Trend</th><th>Threshold</th><th>State</th><th>Recommended action</th></tr></thead><tbody>{data.queueRisks.map((risk) => <tr key={risk.location}><th>{risk.location}</th><td>{risk.peak} min</td><td className={risk.trend > 0 ? 'negative' : 'positive'}>{risk.trend > 0 ? '+' : ''}{risk.trend} min</td><td>{risk.threshold} min</td><td><StatusBadge status={risk.peak > risk.threshold * 1.3 ? 'At risk' : risk.peak > risk.threshold ? 'Watch' : 'On track'} /></td><td>{risk.action}</td></tr>)}</tbody></table></div>
            <div className="queue-summary"><span>Average waits</span><dl><div><dt>Elevators</dt><dd>9 min</dd></div><div><dt>Cinema / galleries</dt><dd>12 min</dd></div><div><dt>Food floors</dt><dd>11 min</dd></div><div><dt>Restaurants</dt><dd>8 min</dd></div><div><dt>Service points</dt><dd>6 min</dd></div></dl></div>
          </div>
        </section>

        <section className="ops-subsection" aria-labelledby="flow-title">
          <div className="subsection-title"><div><span>Visitor flow and congestion</span><h3 id="flow-title">Movement by time, floor, and zone</h3></div><SourceBadge type="instrumentation" /></div>
          <div className="two-column-grid flow-grid">
            <ChartCard title="Time-of-day traffic heatmap" subtitle="Relative traffic index from aggregated observations" badge="instrumentation" insight="Elevator and gallery traffic converged between 1:00 and 3:00 PM; dining demand peaked later." action="Stage floor hosts before the 1:00 PM arrival wave."><Heatmap data={data.flowHeatmap} /></ChartCard>
            <ChartCard title="Simplified floor flow" subtitle="High-interest completed-day movement peaks" badge="instrumentation"><FlowMap /></ChartCard>
            <ChartCard title="Most frequently used zones" subtitle="Aggregated observed visits; a visitor may appear in multiple zones" badge="instrumentation"><HorizontalBarChart data={data.zoneUse} label="Most frequently used museum zones" /></ChartCard>
            <InsightPanel title="Flow exceptions" items={[
              { text: 'Fourth-floor elevator upflow peaked at 1:25 PM, twelve minutes after the largest lobby arrival wave.', action: 'Stage an elevator ambassador from 1:10–2:20 PM.' },
              { text: 'Fifth-floor downflow and restaurant arrivals overlapped at 3:10 PM.', action: 'Redirect one elevator car and flex the host stand.' },
              { text: 'Theater entry volume peaked 18 minutes before the 2:30 PM program.', action: 'Open pre-scan 25 minutes before showtime.' },
            ]} />
          </div>
        </section>

        <section className="ops-subsection" aria-labelledby="transport-title">
          <div className="subsection-title"><div><span>Transportation and arrival patterns</span><h3 id="transport-title">How visitors reached the museum</h3></div><SourceBadge type="instrumentation" /></div>
          <div className="two-column-grid">
            <ChartCard title="Estimated arrival mode" subtitle="Survey, parking transaction, shuttle, and modeled unknown share" badge="instrumentation" insight="Parking and rideshare represented an estimated 52% of arrivals. Mode confidence remains insufficient for routine operational reporting." action="Add a lightweight arrival-mode question to opt-in post-visit surveys."><DonutChart data={data.arrivalModes} label="Estimated visitor transportation mode" /></ChartCard>
            <ChartCard title="Arrival volume by hour" subtitle="Ticket scan and parking-entry proxy"><AreaPairChart data={data.salesAttendance} label="Visitor arrivals and checked-in attendance by hour" firstName="Ticket demand" secondName="Checked in" /></ChartCard>
          </div>
          <div className="instrumentation-callout"><CarFront size={21} /><div><strong>Transportation-mode instrumentation required</strong><p>Parking demand is available from transactions; rideshare, transit, walking, and unknown modes require partner feeds, surveys, or privacy-reviewed mobility aggregates.</p></div></div>
        </section>
      </div>

      <div className="operations-band onsite-band">
        <SectionIntro title="Onsite Engagement" description="Aggregated engagement signals showing how visitors used galleries, theaters, food, retail, park, and garden spaces." />
        <div className="mini-metric-grid compact"><MiniMetric icon={Clock3} label="Average visit" value="3h 08m" detail={`+11 min vs. ${data.comparisonLabel}`} /><MiniMetric icon={UsersRound} label="Average party" value="2 people" detail="Theater 2 · Elevator proxy 3" /><MiniMetric icon={Gauge} label="Peak gallery load" value="88%" detail="Average 68% · East peak 1:40 PM" /><MiniMetric icon={MapPin} label="Top food floor" value="Level 5" detail="Peak demand 3:00 PM" /></div>
        <div className="chart-grid">
          <ChartCard title="Average dwell time by space" subtitle="Minutes per observed visit" badge="instrumentation" insight="West gallery dwell was highest and increased three minutes. Archive gallery dwell declined despite stable entries." action="Review interpretive touchpoints and staff positioning in Archive gallery."><HorizontalBarChart data={data.dwellTime} label="Average visit duration by gallery, theater, and zone" unit=" min" /></ChartCard>
          <ChartCard title="Gallery and theater popularity" subtitle="Visitors by space across completed periods" badge="instrumentation"><HorizontalBarChart data={data.galleryVisitors} label="Visitors by theater and gallery" /></ChartCard>
          <ChartCard className="chart-wide" title="Gallery and theater attendance by time" subtitle="Completed operating hour compared with prior comparable period" badge="instrumentation" insight="Gallery traffic peaked at 2:00 PM, while theater entry demand remained elevated into the 3:00 PM program window." action="Separate gallery and theater arrival routing from 1:30–3:15 PM."><AreaPairChart data={data.galleryTraffic} label="Gallery and theater visitors by completed operating hour" firstName="Gallery visits" secondName="Theater visits" /></ChartCard>
          <ChartCard className="chart-wide" title="Food, retail, park, and garden demand" subtitle="Food and retail visits by completed operating hour" badge="integration" insight="Food demand peaked at 1:00 PM, while retail remained elevated through the 4:00 PM departure wave." action="Preserve food staffing through 2:30 PM and shift one retail associate later."><AreaPairChart data={data.engagementAreas} label="Food and retail visitor demand by hour" firstName="Food areas" secondName="Retail" /></ChartCard>
          <InsightPanel title="Experience insights" items={[
            { text: 'East gallery reached 88% of its comfortable operating capacity at 1:40 PM.', action: 'Add floor staff and use soft routing toward Archive gallery.' },
            { text: 'Cinema turnaround left a 14-minute overlap between exiting and arriving audiences.', action: 'Increase turnaround to 20 minutes for the 2:30 PM program.' },
            { text: 'Level 5 food demand remained elevated after gallery traffic eased.', action: 'Keep the service line open through 4:15 PM.' },
          ]} />
        </div>
      </div>

      <div className="operations-band digital-band">
        <SectionIntro title="Digital Engagement" description="Completed-day acquisition, commerce, subscriber, campaign, and reservation signals connected to onsite planning." />
        <div className="mini-metric-grid digital-metrics"><MiniMetric icon={MousePointerClick} label="Web sessions" value="18,240" detail={`+4% vs. ${data.comparisonLabel}`} /><MiniMetric icon={Gauge} label="Email click-through" value="5%" detail="+1 point" /><MiniMetric icon={UsersRound} label="Email list" value="43,780" detail="+460 net subscribers" /><MiniMetric icon={Clock3} label="Reservations" value="278" detail={`+12% vs. ${data.comparisonLabel}`} /><MiniMetric icon={MousePointerClick} label="Social engagement" value="6%" detail="Week 6% · Month 5%" /><MiniMetric icon={UsersRound} label="Repeat customers" value="9%" detail="Repeat reservations 13% · consented" /></div>
        <div className="chart-grid">
          <ChartCard title="Traffic acquisition mix" subtitle="Completed-day website sessions" badge="integration" insight="Organic search remained the largest source; paid social produced traffic but converted below average." action="Shift campaign optimization toward purchase completion, not landing-page clicks."><DonutChart data={data.acquisitionMix} label="Website acquisition source mix" /></ChartCard>
          <ChartCard title="Online drop off funnel" subtitle="Awareness through completed online action" insight="The largest audience loss occurs between awareness and interest, before visitors demonstrate active consideration." action="Compare campaign sources and landing-page paths to identify where intent weakens."><FunnelChart data={data.funnel} /></ChartCard>
          <ChartCard className="chart-wide" title="Subscriber growth" subtitle="Email list and social subscribers · daily view; weekly and monthly rollups follow selected period" badge="integration"><AreaPairChart data={data.subscriberTrend} label="Email and social subscriber growth by day" firstName="Email list" secondName="Social subscribers" /></ChartCard>
          <ChartCard title="Restaurant reservations" subtitle="Reservations by completed day" badge="integration"><AreaPairChart data={data.reservationsTrend} label="Restaurant reservation trend compared with prior period" firstName="Reservations" secondName="Secondary series" /></ChartCard>
          <InsightPanel title="Digital exception" items={[
            { text: 'Mobile checkout abandonment increased 5 points after payment entry.', action: 'Audit payment errors and reduce competing add-on content.' },
            { text: 'Newsletter subscribers grew 1% week over week; campaign click-through reached 5%.', action: 'Use high-intent segments for timed-entry balancing.' },
            { text: 'Repeat reservations were 13% where consented identity matching was available.', action: 'Keep repeat measures aggregated and consent-scoped.' },
          ]} />
        </div>
        <div className="privacy-note"><strong>Privacy-conscious measurement</strong><p>Repeat customer and repeat reservation metrics use only consented identity matching and are shown in aggregate. No personally identifiable visitor information is present in this prototype.</p></div>
      </div>
    </div>
  )
}