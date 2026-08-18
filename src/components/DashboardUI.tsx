import { useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CircleCheck, Database, Info, MessageSquareText, Minus, RefreshCw } from 'lucide-react'
import type { Availability, Kpi, OperatingStatus } from '../types/dashboard'
import { ChartViewProvider, type ChartView } from './Charts'

const availabilityLabels: Partial<Record<Availability, string>> = {
  instrumentation: 'Instrumentation required',
}

export function SourceBadge({ type }: { type: Availability }) {
  const label = availabilityLabels[type]
  if (!label) return null
  return <span className={`source-badge source-${type}`}>{label}</span>
}

export function StatusBadge({ status }: { status: OperatingStatus }) {
  const Icon = status === 'On track' ? CircleCheck : status === 'Watch' ? Info : AlertTriangle
  return <span className={`status-badge status-${status.toLowerCase().replaceAll(' ', '-')}`}><Icon size={13} />{status}</span>
}

function formatValue(kpi: Kpi) {
  if (kpi.format === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: kpi.value < 100 ? 2 : 0 }).format(kpi.value)
  if (kpi.format === 'percent') return `${Math.round(kpi.value)}%`
  if (kpi.format === 'duration') return `${Math.round(kpi.value)} min`
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(kpi.value)
}

const kpiAnnotations: Record<string, string> = {
  tickets: 'What was the Tickets Sold vs the Capacity today, this week, this month?',
  attendance: 'What was the Total Attendance today, this week, this month?',
  redemption: 'What % of tickets are being sold vs. attended today, this week, this month?',
  capacity: 'What is our average % of capacity daily? How can we improve our operations to be more efficient?',
  revenue: 'What is the overall Revenue from founders, parking, f&b, retail, membership, ticket sales?',
  'revenue-per-visitor': 'What was the average revenue per visitor (f&b and retail) today, this week, this month?',
  memberships: 'How many Memberships were sold today, this week, this month?',
  conversion: 'What is our ticket to Membership Conversion (Tessitura), today, this week, this month?',
}

const chartAnnotations: Record<string, string> = {
  'Ticket sales vs. visitor attendance': 'What are the ticket sales by day and what potentially caused the spike in sales?',
  'Revenue mix': 'What is the overall Revenue from founders, parking, f&b, retail, membership, ticket sales?',
  'Membership performance': 'How many Memberships were sold online vs in person, today, this week, this month? What were the most popular Membership levels sold?',
  'Online drop off funnel': 'What is our online user journey to purchase path and where are they dropping off/abandoning?',
  'Ticket demand by visitor segment and price': 'What does our visitor demographic look like based on ticket type? How many tickets were sold by price today?',
}

export function KpiCard({ kpi, comparisonLabel }: { kpi: Kpi; comparisonLabel: string }) {
  const direction = kpi.comparison > 0 ? 'up' : kpi.comparison < 0 ? 'down' : 'flat'
  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus
  const unfavorable = ['redemption'].includes(kpi.id) ? kpi.comparison < 0 : false
  const annotation = kpiAnnotations[kpi.id] ?? 'Annotation text to be provided'
  return (
    <article className="kpi-card" aria-label={`${kpi.label}: ${formatValue(kpi)}`}>
      <div className="kpi-label"><span>{kpi.label}</span><div className="kpi-actions"><button className="info-button" aria-label={`Definition: ${kpi.definition}`} data-tooltip={kpi.definition}><Info size={15} /></button><button className="info-button annotation-button" aria-label={`Annotation for ${kpi.label}`} data-tooltip={annotation}><MessageSquareText size={15} /></button></div></div>
      <strong>{formatValue(kpi)}</strong>
      <div className="kpi-footer">
        <span className={`trend ${unfavorable ? 'trend-bad' : direction === 'down' ? 'trend-muted' : 'trend-good'}`}><TrendIcon size={15} />{Math.round(Math.abs(kpi.comparison))}%</span>
        <span>vs. {comparisonLabel}</span>
      </div>
      <SourceBadge type={kpi.availability} />
    </article>
  )
}

export function ChartCard({ title, subtitle, badge = 'day-one', insight, action, annotation = false, className = '', children }: {
  title: string
  subtitle?: string
  badge?: Availability
  insight?: string
  action?: string
  annotation?: boolean
  className?: string
  children: ReactNode
}) {
  const [chartView, setChartView] = useState<ChartView>('selected')
  return (
    <article className={`chart-card ${annotation ? 'chart-card-annotated' : ''} ${className}`}>
      <header className="card-heading">
        <div className="chart-card-copy"><div className="chart-title-line"><h3>{title}</h3>{annotation && <button className="info-button annotation-button chart-annotation-button" aria-label={`Annotation for ${title}`} data-tooltip={chartAnnotations[title] ?? 'Annotation text to be provided'}><MessageSquareText size={15} /></button>}</div>{subtitle && <p>{subtitle}</p>}</div>
        <div className="chart-card-tools">
          <SourceBadge type={badge} />
          <label className="chart-view-filter"><span>Chart period</span><select value={chartView} onChange={(event) => setChartView(event.target.value as ChartView)} aria-label={`${title} chart period`}><option value="selected">Selected period</option><option value="prior">Prior period</option></select></label>
        </div>
      </header>
      <ChartViewProvider value={chartView}>{children}</ChartViewProvider>
      {insight && <div className="insight"><strong>What this means</strong><span>{insight}</span>{action && <b>Suggested action: {action}</b>}</div>}
    </article>
  )
}

export function MetricState({ state, onRetry }: { state: 'loading' | 'empty' | 'error'; onRetry?: () => void }) {
  const content = {
    loading: { icon: <RefreshCw className="spin" />, title: 'Loading completed-period metrics', detail: 'Reconciling demo source feeds.' },
    empty: { icon: <Database />, title: 'No data for this selection', detail: 'Try widening the completed reporting period or clearing a filter.' },
    error: { icon: <AlertTriangle />, title: 'Metrics could not be loaded', detail: 'Previously loaded dashboard data remains available after retry.' },
  }[state]
  return <div className="metric-state" role={state === 'error' ? 'alert' : 'status'}>{content.icon}<div><strong>{content.title}</strong><p>{content.detail}</p></div>{state === 'error' && <button className="secondary-button" onClick={onRetry}>Retry</button>}</div>
}

export function SectionIntro({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <header className="section-intro">{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2><p>{description}</p></header>
}