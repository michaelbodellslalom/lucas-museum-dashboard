import { CalendarClock, RefreshCw } from 'lucide-react'
import { DemographicPriceChart, DonutChart, FunnelChart, GalleryPerformanceChart, MembershipChart, RetailItemsChart, RevenueTrendChart, SalesAttendanceChart, useChartView } from '../components/Charts'
import { ChartCard, KpiCard, MetricState } from '../components/DashboardUI'
import type { DashboardData } from '../types/dashboard'
import type { KpiGroup } from '../types/dashboard'

const kpiGroupOrder: KpiGroup[] = ['Admissions & Experience', 'Revenue & Fundraising', 'Membership', 'Events']

function RevenuePlanTable({ data }: { data: DashboardData['revenuePlan'] }) {
  const view = useChartView()
  const rows = view === 'selected' ? data : data.map((row) => ({ ...row, actual: Math.round(row.actual * 0.92), planned: Math.round(row.planned * 0.95) }))
  return <div className="table-wrap"><table><caption>{view === 'selected' ? 'Actual recognized revenue compared with plan by channel' : 'Prior comparable revenue compared with plan by channel'}</caption><thead><tr><th>Channel</th><th>Actual revenue</th><th>Sales variance to plan</th><th>% to plan</th></tr></thead><tbody>{rows.map((row) => {
    const variance = row.actual - row.planned
    const percentToPlan = row.planned ? (row.actual / row.planned) * 100 : 0
    return <tr key={row.channel}><th>{row.channel}</th><td>${row.actual.toLocaleString()}</td><td className={variance >= 0 ? 'positive' : 'negative'}>{variance >= 0 ? '+' : '-'}${Math.abs(variance).toLocaleString()}</td><td className={percentToPlan >= 100 ? 'positive' : 'negative'}>{Math.round(percentToPlan)}%</td></tr>
  })}</tbody></table></div>
}

function getMuseumBrief(data: DashboardData | null) {
  const dailySummary = 'Attendance exceeded expectations and revenue increased. Visitor engagement remained strong with average visit duration above three hours.'
  const dailyPrimaryInsight = 'Primary concern: Elevator congestion occurred between 1 PM and 3 PM. No critical issues identified.'

  if (!data) {
    return {
      title: "Today's Museum Brief",
      summary: dailySummary,
      primaryInsight: dailyPrimaryInsight,
    }
  }

  if (data.rangeDays === 1) return { title: "Today's Museum Brief", summary: dailySummary, primaryInsight: dailyPrimaryInsight }

  const getKpi = (id: string) => data.kpis.find((kpi) => kpi.id === id)
  const attendance = getKpi('attendance')
  const revenue = getKpi('revenue')
  const capacity = getKpi('capacity')
  const memberships = getKpi('memberships')
  const redemption = getKpi('redemption')
  const describeChange = (comparison: number) => comparison === 0 ? 'flat' : `${comparison > 0 ? 'up' : 'down'} ${Math.abs(Math.round(comparison))}%`
  const summary = `${Math.round(attendance?.value ?? 0).toLocaleString()} visitors checked in, ${describeChange(attendance?.comparison ?? 0)} compared with ${data.comparisonLabel}. Total revenue reached ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(revenue?.value ?? 0)}, ${describeChange(revenue?.comparison ?? 0)}. Capacity utilization was ${Math.round(capacity?.value ?? 0)}%, and ${Math.round(memberships?.value ?? 0).toLocaleString()} memberships were sold.`
  const primaryInsight = (redemption?.comparison ?? 0) < 0
    ? `Primary concern: Ticket redemption was ${Math.round(redemption?.value ?? 0)}%, down ${Math.abs(Math.round(redemption?.comparison ?? 0))} points versus ${data.comparisonLabel}.`
    : `Primary highlight: Membership sales were ${describeChange(memberships?.comparison ?? 0)} compared with ${data.comparisonLabel}.`

  if (data.periodLabel === 'Last 7 completed days') return { title: "This Week's Museum Brief", summary, primaryInsight }
  if (data.periodLabel === 'Last 30 completed days') return { title: 'Last 30 Days Museum Brief', summary, primaryInsight }
  if (data.periodLabel === 'Month to date') return { title: "This Month's Museum Brief", summary, primaryInsight }
  if (data.periodLabel === 'Year to date') return { title: 'Year-to-Date Museum Brief', summary, primaryInsight }

  return { title: 'Custom Range Museum Brief', summary, primaryInsight }
}

export function ExecutiveOverview({ data, state, onRetry }: { data: DashboardData | null; state: 'loaded' | 'loading' | 'empty' | 'error'; onRetry: () => void }) {
  const museumBrief = getMuseumBrief(data)
  return (
    <div className="page executive-page">
      <section className="page-hero">
        <div>
          <h1>Commercial Performance Dashboard</h1>
          <p>An overview of performance, operations, and more to give you the information you need in seconds.</p>
          <div className="hero-period"><CalendarClock size={17} /><span>{data?.periodLabel ?? 'Last complete business day'} · <strong>{data?.dateRangeLabel ?? 'November 12, 2026'}</strong></span></div>
        </div>
      </section>

      <section className="executive-summary" aria-labelledby="museum-brief-title">
        <div className="section-heading"><div><span className="section-kicker">Executive summary</span><h2 id="museum-brief-title">{museumBrief.title}</h2></div></div>
        <p>{museumBrief.summary}</p>
        <strong className="brief-insight"><span>{museumBrief.primaryInsight.split(':')[0]}:</span>{museumBrief.primaryInsight.slice(museumBrief.primaryInsight.indexOf(':') + 1)}</strong>
      </section>

      <section aria-labelledby="kpi-title">
        <div className="section-heading"><div><h2 id="kpi-title">Summary KPIs</h2></div>{data && <p>Compared with {data.comparisonLabel}.</p>}</div>
        {state !== 'loaded' || !data ? <MetricState state={state === 'loaded' ? 'empty' : state} onRetry={onRetry} /> : <div className="kpi-groups">{kpiGroupOrder.map((group) => <div className="kpi-group" key={group}><h3>{group}</h3><div className="kpi-grid">{data.kpis.filter((kpi) => kpi.group === group).map((kpi) => <KpiCard key={kpi.id} kpi={kpi} comparisonLabel={data.comparisonLabel} />)}</div></div>)}</div>}
      </section>

      {data && state === 'loaded' && <section aria-labelledby="visual-title">
        <div className="section-heading"><div><h2 id="visual-title">Trends, mix, and conversion</h2></div><p>All views reflect completed periods and active filters.</p></div>
        <div className="chart-grid">
          <ChartCard className="chart-wide executive-paired-card" title="Ticket sales vs. visitor attendance" subtitle="Completed operating hours · capacity reference shown" insight="The 2:00 PM window was the day’s peak. Attendance remained below hard capacity, but arrivals compressed lobby throughput.">
            <SalesAttendanceChart data={data.salesAttendance} />
          </ChartCard>
          <ChartCard className="executive-paired-card" title="Revenue mix" subtitle="Recognized revenue by stream" badge="integration" insight="Membership revenue grew fastest, while food and retail captured 21% of total revenue.">
            <DonutChart data={data.revenueMix} label="Revenue mix across seven museum revenue streams" currency />
          </ChartCard>
          <ChartCard className="chart-wide executive-paired-card" title="Membership performance" subtitle="Channel contribution and membership level" insight="Online generated two-thirds of memberships, led by Alliance and Access levels.">
            <MembershipChart channels={data.membershipChannels} levels={data.membershipLevels} />
          </ChartCard>
          <ChartCard className="executive-paired-card" title="Online drop off funnel" subtitle="Awareness through completed online action" insight="The largest audience loss occurs between awareness and interest, before visitors demonstrate active consideration.">
            <FunnelChart data={data.funnel} />
          </ChartCard>
          <ChartCard className="chart-full" title="Ticket demand by visitor segment and revenue" subtitle="Aggregated ticket-holder mix and total ticket revenue" insight="Adults represented 50% of attendance and generated the largest share of ticket revenue. Military, child, and teen student admission remained complimentary.">
            <DemographicPriceChart data={data.visitorDemographics} />
          </ChartCard>
          <ChartCard className="chart-full" title="Retail items sold" subtitle="Top and low sellers across in-store and online channels" insight="Museum catalog and enamel pins lead combined retail volume, while online artist print sales outperform their in-store sales.">
            <RetailItemsChart data={data.retailItems} />
          </ChartCard>
          <ChartCard className="chart-full" title="Revenue trend by stream" subtitle="Daily recognized revenue across major channels" insight="Ticketing remains the largest revenue stream, while membership and event revenue show the strongest late-period momentum.">
            <RevenueTrendChart data={data.revenueTrend} rangeDays={data.rangeDays} />
          </ChartCard>
          <ChartCard className="chart-full" title="Gallery visits and dwell time" subtitle="Top ten galleries ranked by visitor count" insight="The West gallery brings the greatest visitor volume, while Cinematic Art leads dwell time among the highest-interest spaces.">
            <GalleryPerformanceChart data={data.galleryPerformance} />
          </ChartCard>
          <ChartCard className="chart-full" title="Revenue actual vs. plan" subtitle="Recognized revenue compared with planned channel targets" insight="Ticketing, food and beverage, and events are above plan, while memberships, retail, and parking have room to close the gap.">
            <RevenuePlanTable data={data.revenuePlan} />
          </ChartCard>
        </div>
      </section>}

      <section className="data-assurance" aria-label="Dashboard refresh">
        <div><RefreshCw size={20} /><span><strong>Dashboard refreshed</strong>November 12, 2026 at 5:00 AM PT</span></div>
      </section>
    </div>
  )
}