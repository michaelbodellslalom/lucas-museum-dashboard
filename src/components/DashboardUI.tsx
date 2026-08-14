import { useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CircleCheck, Database, Info, Minus, RefreshCw } from 'lucide-react'
import type { Availability, Kpi, OperatingStatus } from '../types/dashboard'
import { ChartViewProvider, type ChartView } from './Charts'

const availabilityLabels: Partial<Record<Availability, string>> = {
  instrumentation: 'Instrumentation required',
  'quality-review': 'Data quality review needed',
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

export function KpiCard({ kpi, comparisonLabel }: { kpi: Kpi; comparisonLabel: string }) {
  const direction = kpi.comparison > 0 ? 'up' : kpi.comparison < 0 ? 'down' : 'flat'
  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus
  const unfavorable = ['redemption'].includes(kpi.id) ? kpi.comparison < 0 : false
  return (
    <article className="kpi-card" aria-label={`${kpi.label}: ${formatValue(kpi)}`}>
      <div className="kpi-label"><span>{kpi.label}</span><button className="info-button" aria-label={`Definition: ${kpi.definition}`} data-tooltip={kpi.definition}><Info size={15} /></button></div>
      <strong>{formatValue(kpi)}</strong>
      <div className="kpi-footer">
        <span className={`trend ${unfavorable ? 'trend-bad' : direction === 'down' ? 'trend-muted' : 'trend-good'}`}><TrendIcon size={15} />{Math.round(Math.abs(kpi.comparison))}%</span>
        <span>vs. {comparisonLabel}</span>
      </div>
      <SourceBadge type={kpi.availability} />
    </article>
  )
}

export function ChartCard({ title, subtitle, badge = 'day-one', insight, action, className = '', children }: {
  title: string
  subtitle?: string
  badge?: Availability
  insight?: string
  action?: string
  className?: string
  children: ReactNode
}) {
  const [chartView, setChartView] = useState<ChartView>('selected')
  return (
    <article className={`chart-card ${className}`}>
      <header className="card-heading">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        <div className="chart-card-tools">
          <SourceBadge type={badge} />
          <label className="chart-view-filter"><span>Chart period</span><select value={chartView} onChange={(event) => setChartView(event.target.value as ChartView)} aria-label={`${title} chart period`}><option value="selected">Selected period</option><option value="prior">Prior comparable</option></select></label>
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

export function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="section-intro"><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></header>
}