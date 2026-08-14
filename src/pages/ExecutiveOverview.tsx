import { CalendarClock, RefreshCw } from 'lucide-react'
import { DemographicPriceChart, DonutChart, FunnelChart, MembershipChart, SalesAttendanceChart } from '../components/Charts'
import { ChartCard, KpiCard, MetricState } from '../components/DashboardUI'
import type { DashboardData } from '../types/dashboard'

export function ExecutiveOverview({ data, state, onRetry }: { data: DashboardData | null; state: 'loaded' | 'loading' | 'empty' | 'error'; onRetry: () => void }) {
  return (
    <div className="page executive-page">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Executive overview</span>
          <h1>Commercial Performance Dashboard</h1>
          <p>A completed-day view of commercial performance, operating exceptions, and visitor experience.</p>
          <div className="hero-period"><CalendarClock size={17} /><span>{data?.periodLabel ?? 'Last complete business day'} · <strong>{data?.dateRangeLabel ?? 'November 12, 2026'}</strong></span></div>
        </div>
      </section>

      <section aria-labelledby="kpi-title">
        <div className="section-heading"><div><h2 id="kpi-title">Summary KPIs</h2></div>{data && <p>Compared with {data.comparisonLabel}.</p>}</div>
        {state !== 'loaded' || !data ? <MetricState state={state === 'loaded' ? 'empty' : state} onRetry={onRetry} /> : <div className="kpi-grid">{data.kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} comparisonLabel={data.comparisonLabel} />)}</div>}
      </section>

      {data && state === 'loaded' && <section aria-labelledby="visual-title">
        <div className="section-heading"><div><h2 id="visual-title">Trends, mix, and conversion</h2></div><p>All views reflect completed periods and active filters.</p></div>
        <div className="chart-grid">
          <ChartCard className="chart-wide" title="Ticket sales vs. visitor attendance" subtitle="Completed operating hours · capacity reference shown" insight="The 2:00 PM window was the day’s peak. Attendance remained below hard capacity, but arrivals compressed lobby throughput." action="Move 40 tickets into the 3:00 PM window and stagger group check-in.">
            <SalesAttendanceChart data={data.salesAttendance} />
          </ChartCard>
          <ChartCard title="Revenue mix" subtitle="Recognized revenue by stream" badge="integration" insight="Membership revenue grew fastest, while food and retail captured 21% of total revenue." action="Test a post-visit retail offer for scanned ticket holders.">
            <DonutChart data={data.revenueMix} label="Revenue mix across seven museum revenue streams" currency />
          </ChartCard>
          <ChartCard className="chart-wide" title="Membership performance" subtitle="Channel contribution and membership level" insight="Online generated two-thirds of memberships, led by Individual and Dual levels." action="Keep onsite prompts focused on Family and Supporter upgrades.">
            <MembershipChart channels={data.membershipChannels} levels={data.membershipLevels} />
          </ChartCard>
          <ChartCard title="Digital purchase funnel" subtitle="Completed-day web sessions and commerce outcomes" badge="quality-review" insight="Checkout start to completed purchase is the largest consequential loss, with mobile payment completion down 5 points." action="Review payment errors by device before the next campaign send.">
            <FunnelChart data={data.funnel} />
          </ChartCard>
          <ChartCard className="chart-full" title="Ticket demand by visitor segment and price" subtitle="Aggregated ticket-holder mix and realized average price" badge="quality-review" insight="Adults represented 54% of attendance. Youth and student demand broadened reach while lowering realized ticket yield." action="Protect access pricing while testing family bundles in lower-demand windows.">
            <DemographicPriceChart data={data.visitorDemographics} />
          </ChartCard>
        </div>
      </section>}

      <section className="data-assurance" aria-label="Dashboard refresh">
        <div><RefreshCw size={20} /><span><strong>Dashboard refreshed</strong>November 13, 2026 at 5:00 AM PT</span></div>
      </section>
    </div>
  )
}