import { createContext, useContext, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoryValue, DemographicValue, GalleryPerformance, HeatmapCell, RevenueTrendPoint, RetailItem, TimePoint } from '../types/dashboard'

const colors = ['#b89a6a', '#000000', '#806b4b', '#6d6659', '#9b9386', '#c8b99f', '#d7d2c8']
const tooltipStyle = { border: '1px solid #d8d8d8', borderRadius: 0, boxShadow: '0 8px 24px rgba(0,0,0,.08)', fontSize: 12 }

export type ChartView = 'selected' | 'prior'
const ChartViewContext = createContext<ChartView>('selected')

export function ChartViewProvider({ value, children }: { value: ChartView; children: ReactNode }) {
  return <ChartViewContext.Provider value={value}>{children}</ChartViewContext.Provider>
}

export function useChartView() {
  return useContext(ChartViewContext)
}

function categoryView(data: CategoryValue[], view: ChartView): CategoryValue[] {
  if (view === 'selected') return data
  return data.map((item) => ({ ...item, value: Math.round(item.prior ?? item.value * 0.92) }))
}

function AccessibleChart({ label, children, height = 260 }: { label: string; children: React.ReactNode; height?: number }) {
  return <div className="chart-frame" style={{ height }} role="img" aria-label={label}>{children}</div>
}

function salesAttendanceForRange(data: TimePoint[], rangeDays: number): TimePoint[] {
  if (rangeDays === 1) return data

  const dailyBase = data.reduce((totals, item) => ({
    current: totals.current + item.current,
    secondary: totals.secondary + (item.secondary ?? 0),
    prior: totals.prior + item.prior,
  }), { current: 0, secondary: 0, prior: 0 })
  const end = new Date(Date.UTC(2026, 10, 12))
  return Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(end.getTime() - (rangeDays - index - 1) * 86_400_000)
    const factor = 0.82 + (index % 5) * 0.06
    return {
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date),
      current: Math.round(dailyBase.current * factor),
      secondary: Math.round(dailyBase.secondary * factor),
      prior: Math.round(dailyBase.prior * factor),
      capacity: Math.round(flatCapacityForRange(data) * factor),
    }
  })
}

function flatCapacityForRange(data: TimePoint[]) {
  return data.reduce((total, item) => total + (item.capacity ?? 0), 0)
}

export function SalesAttendanceChart({ data, rangeDays }: { data: TimePoint[]; rangeDays: number }) {
  const view = useChartView()
  const rangeData = salesAttendanceForRange(data, rangeDays)
  const flatCapacity = rangeDays === 1 ? Math.max(...data.map((item) => item.capacity ?? 0)) : Math.max(...rangeData.map((item) => item.capacity ?? 0))
  const chartData = view === 'selected'
    ? rangeData.map((item) => ({ ...item, capacity: flatCapacity }))
    : rangeData.map((item) => ({ ...item, current: Math.round(item.prior), secondary: Math.round(item.prior * 0.84), capacity: flatCapacity }))
  return <AccessibleChart label={`Ticket sales and visitor attendance by ${rangeDays === 1 ? 'hour' : 'day'} with available capacity`}>
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} barGap={6} margin={{ top: 16, right: 16, bottom: 4, left: -16 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="current" name="Tickets sold" fill="#b89a6a" stroke="#b89a6a" barSize={22} radius={[0, 0, 0, 0]} />
      <Bar dataKey="secondary" name="Visitors checked in" fill="#688276" stroke="#688276" barSize={22} radius={[0, 0, 0, 0]} />
      <Line type="step" dataKey="capacity" name="Capacity" stroke="#7a7a7a" strokeDasharray="5 4" dot={false} />
    </ComposedChart></ResponsiveContainer>
  </AccessibleChart>
}

export function DonutChart({ data, label, currency = false }: { data: CategoryValue[]; label: string; currency?: boolean }) {
  const view = useChartView()
  const chartData = categoryView(data, view)
  return <AccessibleChart label={label} height={250}>
    <ResponsiveContainer width="100%" height="100%"><PieChart>
      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={84} paddingAngle={2}>{chartData.map((item, index) => <Cell key={item.name} fill={item.color ?? colors[index % colors.length]} />)}</Pie>
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => currency ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
    </PieChart></ResponsiveContainer>
  </AccessibleChart>
}

export function MembershipChart({ channels, levels }: { channels: CategoryValue[]; levels: CategoryValue[] }) {
  const view = useChartView()
  const levelData = view === 'selected' ? levels : levels.map((item) => ({ ...item, value: Math.round(item.prior ?? item.value * 0.92) }))
  const sortedValues = levelData.map((item) => item.value).sort((first, second) => first - second)
  const median = sortedValues[Math.floor(sortedValues.length / 2)] ?? 0
  return <div className="membership-chart">
    <DonutChart data={channels} label="Membership sales split between online and in-person channels" />
    <AccessibleChart label={`Memberships sold by level with median reference at ${median.toLocaleString()}`} height={250}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={levelData} layout="vertical" margin={{ top: 30, right: 20, bottom: 8, left: 70 }}>
        <CartesianGrid stroke="#ebebeb" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
        <Bar dataKey="value" name={view === 'selected' ? 'Selected period' : 'Prior comparable'} fill="#b89a6a" radius={[0, 0, 0, 0]}><LabelList dataKey="value" position="right" formatter={(value) => Number(value).toLocaleString()} fontSize={12} /></Bar>
        <ReferenceLine x={median} stroke="#000000" strokeWidth={2} strokeDasharray="7 4" label={{ value: `Median ${median.toLocaleString()}`, position: 'top', fill: '#000000', fontSize: 12, fontWeight: 700 }} />
      </BarChart></ResponsiveContainer>
    </AccessibleChart>
  </div>
}

function RetailTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: RetailItem }>; label?: string }) {
  const item = payload?.[0]?.payload
  if (!active || !item) return null
  return <div style={tooltipStyle} className="chart-tooltip">
    <strong>{label}</strong>
    <span>In-store revenue <b>${item.inStoreRevenue.toLocaleString()}</b></span>
    <span>Online revenue <b>${item.onlineRevenue.toLocaleString()}</b></span>
    <span>Items sold <b>{(item.inStore + item.online).toLocaleString()}</b></span>
  </div>
}

function RetailAxisTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return <text x={x} y={y} dy="0.35em" textAnchor="end" fill="#66635c" fontSize={10}>{payload?.value ?? ''}</text>
}

export function RetailItemsChart({ data }: { data: RetailItem[] }) {
  const view = useChartView()
  const chartData = [...data]
    .map((item) => view === 'selected' ? item : { ...item, inStore: Math.round(item.inStore * 0.92), online: Math.round(item.online * 0.92), inStoreRevenue: Math.round(item.inStoreRevenue * 0.92), onlineRevenue: Math.round(item.onlineRevenue * 0.92) })
    .sort((first, second) => (second.inStoreRevenue + second.onlineRevenue) - (first.inStoreRevenue + first.onlineRevenue))
  return <div className="retail-chart-frame"><AccessibleChart label="Retail items ranked by combined in-store and online revenue with units sold in the tooltip" height={Math.max(300, chartData.length * 34)}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 0 }}>
      <CartesianGrid stroke="#ebebeb" horizontal={false} />
      <XAxis type="number" tickFormatter={(value) => `$${Number(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} fontSize={11} />
      <YAxis dataKey="name" type="category" tick={<RetailAxisTick />} tickLine={false} axisLine={false} width={110} interval={0} />
      <Tooltip content={<RetailTooltip />} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey="inStoreRevenue" name="In-store revenue" stackId="revenue" fill="#b89a6a" radius={[0, 0, 0, 0]} />
      <Bar dataKey="onlineRevenue" name="Online revenue" stackId="revenue" fill="#55758a" radius={[0, 0, 0, 0]} />
    </BarChart></ResponsiveContainer>
  </AccessibleChart></div>
}

function revenueTrendForRange(data: RevenueTrendPoint[], rangeDays: number) {
  if (rangeDays === 1) {
    const hourlyWeights = [0.05, 0.08, 0.11, 0.14, 0.16, 0.15, 0.12, 0.09, 0.06, 0.03, 0.01]
    return data.slice(-1).flatMap((item) => hourlyWeights.map((weight, index) => {
      const hour = index + 9
      return {
      label: `${hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`,
      ticketing: Math.round(item.ticketing * weight),
      memberships: Math.round(item.memberships * weight),
      foodAndBeverage: Math.round(item.foodAndBeverage * weight),
      retail: Math.round(item.retail * weight),
      events: Math.round(item.events * weight),
      }
    }))
  }

  if (rangeDays <= 7) return data.slice(-rangeDays)

  const end = new Date(Date.UTC(2026, 10, 12))
  return Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(end.getTime() - (rangeDays - index - 1) * 86_400_000)
    const source = data[index % data.length]
    return {
      ...source,
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date),
      ticketing: Math.round(source.ticketing * (0.86 + (index % 5) * 0.04)),
      memberships: Math.round(source.memberships * (0.86 + (index % 5) * 0.04)),
      foodAndBeverage: Math.round(source.foodAndBeverage * (0.86 + (index % 5) * 0.04)),
      retail: Math.round(source.retail * (0.86 + (index % 5) * 0.04)),
      events: Math.round(source.events * (0.86 + (index % 5) * 0.04)),
    }
  })
}

export function RevenueTrendChart({ data, rangeDays }: { data: RevenueTrendPoint[]; rangeDays: number }) {
  const view = useChartView()
  const rangeData = revenueTrendForRange(data, rangeDays)
  const chartData = view === 'selected' ? rangeData : rangeData.map((item) => ({ ...item, ticketing: Math.round(item.ticketing * 0.92), memberships: Math.round(item.memberships * 0.92), foodAndBeverage: Math.round(item.foodAndBeverage * 0.92), retail: Math.round(item.retail * 0.92), events: Math.round(item.events * 0.92) }))
  const series = [
    ['ticketing', 'Ticketing', '#b89a6a'],
    ['memberships', 'Memberships', '#000000'],
    ['foodAndBeverage', 'Food & beverage', '#688276'],
    ['retail', 'Retail', '#55758a'],
    ['events', 'Events', '#9b806d'],
  ] as const
  return <AccessibleChart label="Revenue trend over time by category stream" height={290}>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 16, right: 18, bottom: 4, left: -8 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
      <YAxis tickFormatter={(value) => `$${Number(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} fontSize={11} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => `$${Number(value).toLocaleString()}`} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      {series.map(([key, name, color]) => <Line key={key} type="monotone" dataKey={key} name={name} stroke={color} strokeWidth={2} dot={{ r: 2 }} />)}
    </LineChart></ResponsiveContainer>
  </AccessibleChart>
}

export function GalleryPerformanceChart({ data }: { data: GalleryPerformance[] }) {
  const view = useChartView()
  const chartData = [...data]
    .map((item) => view === 'selected' ? item : { ...item, dwellTime: Math.round(item.dwellTime * 0.95), visitors: Math.round(item.visitors * 0.92) })
    .sort((first, second) => second.visitors - first.visitors)
  return <AccessibleChart label="Top ten galleries by visitor count with average dwell time" height={350}>
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 16, right: 12, bottom: 38, left: -8 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={9} angle={-30} textAnchor="end" interval={0} height={58} />
      <YAxis yAxisId="visitors" tickFormatter={(value) => Number(value).toLocaleString()} tickLine={false} axisLine={false} fontSize={11} />
      <YAxis yAxisId="dwell" orientation="right" tickFormatter={(value) => `${value}m`} tickLine={false} axisLine={false} fontSize={11} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => name === 'Dwell time' ? `${value} min` : `${Number(value).toLocaleString()} visitors`} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      <Bar yAxisId="visitors" dataKey="visitors" name="Visitors" fill="#b89a6a" radius={[0, 0, 0, 0]} />
      <Line yAxisId="dwell" type="monotone" dataKey="dwellTime" name="Dwell time" stroke="#000000" strokeWidth={2} dot={{ r: 3 }} />
    </ComposedChart></ResponsiveContainer>
  </AccessibleChart>
}

function DemographicTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ payload?: DemographicValue & { totalRevenue: number } }>
  label?: string
}) {
  const item = payload?.[0]?.payload
  if (!active || !item) return null
  return <div style={tooltipStyle} className="chart-tooltip">
    <strong>{label}</strong>
    <span>Visitors <b>{item.visitors.toLocaleString()}</b></span>
    <span>Ticket price <b>${item.ticketPrice.toFixed(2)}</b></span>
    <span>Total revenue <b>${Math.round(item.totalRevenue).toLocaleString()}</b></span>
  </div>
}

function DemographicAxisTick({ x = 0, y = 0, payload }: {
  x?: number
  y?: number
  payload?: { value: string }
}) {
  const value = payload?.value ?? ''
  return <text x={x} y={y} dy="0.8em" textAnchor="middle" fill="#66635c" fontSize={11}>{value === 'Corporate Guest' ? <><tspan x={x} dy="0.8em">Corporate</tspan><tspan x={x} dy="1.15em">Guest</tspan></> : value}</text>
}

export function DemographicPriceChart({ data }: { data: DemographicValue[] }) {
  const view = useChartView()
  const periodData = view === 'selected' ? data : data.map((item) => ({ ...item, visitors: Math.round(item.visitors * 0.92) }))
  const chartData = periodData.map((item) => ({ ...item, totalRevenue: item.visitors * item.ticketPrice + (item.stackedVisitors ?? 0) * (item.stackedTicketPrice ?? 0) }))
  return <AccessibleChart label="Visitor volume and total ticket revenue by aggregated visitor demographic" height={280}>
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 18, right: 12, bottom: 4, left: -8 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="name" tick={<DemographicAxisTick />} tickLine={false} axisLine={false} height={38} interval={0} />
      <YAxis yAxisId="visitors" tickFormatter={(value) => Number(value).toLocaleString()} tickLine={false} axisLine={false} fontSize={12} />
      <YAxis yAxisId="revenue" orientation="right" tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip content={<DemographicTooltip />} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Bar yAxisId="visitors" dataKey="visitors" name="Visitors" fill="#b89a6a" stackId="visitor-demand" radius={[0, 0, 0, 0]} />
      <Bar yAxisId="visitors" dataKey="stackedVisitors" name="Teen" fill="#806b4b" stackId="visitor-demand" radius={[0, 0, 0, 0]} />
      <Line yAxisId="revenue" type="monotone" dataKey="totalRevenue" name="Total revenue" stroke="#000000" strokeWidth={3} dot={{ r: 4 }} />
    </ComposedChart></ResponsiveContainer>
  </AccessibleChart>
}

export function FunnelChart({ data }: { data: CategoryValue[] }) {
  const view = useChartView()
  const chartData = categoryView(data, view).map((item) => ({ ...item, value: Math.round(item.value) }))
  const max = chartData[0]?.value || 1
  const losses = chartData.slice(1).map((step, index) => Math.max(0, chartData[index].value - step.value))
  const totalLoss = losses.reduce((sum, loss) => sum + loss, 0) || 1
  const lossShares = losses.map((loss) => Math.round((loss / totalLoss) * 100))
  if (lossShares.length) lossShares[lossShares.length - 1] += 100 - lossShares.reduce((sum, share) => sum + share, 0)
  return <div className="funnel-chart" role="img" aria-label="Online drop-off funnel from awareness to action">
    {chartData.map((step, index) => {
      const width = Math.max(26, (step.value / max) * 100)
      const detail = index === 0
        ? `${step.value.toLocaleString()} sessions · starting audience`
        : `${step.value.toLocaleString()} remaining · ${losses[index - 1].toLocaleString()} dropped · ${lossShares[index - 1]}% of total drop-off`
      return <div className="funnel-step" key={step.name} tabIndex={0} data-funnel-tooltip={detail}><div style={{ width: `${width}%`, background: colors[index % colors.length] }}><span>{step.name}</span></div></div>
    })}
  </div>
}

export function CapacityChart({ data }: { data: TimePoint[] }) {
  const view = useChartView()
  const chartData = view === 'selected' ? data : data.map((item) => ({ ...item, current: Math.round(item.prior) }))
  return <AccessibleChart label="Capacity utilization by completed operating hour">
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 16, bottom: 4, left: -18 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
      <Area type="monotone" dataKey="current" name="Utilization" stroke="#b89a6a" fill="#efe7d7" strokeWidth={3} />
      <Line type="monotone" dataKey="prior" name="Prior comparable" stroke="#7a7a7a" strokeWidth={2} dot={false} />
    </AreaChart></ResponsiveContainer>
  </AccessibleChart>
}

export function HorizontalBarChart({ data, label, unit = '' }: { data: CategoryValue[]; label: string; unit?: string }) {
  const view = useChartView()
  const chartData = categoryView(data, view)
  return <AccessibleChart label={label} height={Math.max(240, data.length * 38)}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 22 }}>
      <CartesianGrid stroke="#e6e2da" horizontal={false} />
      <XAxis type="number" hide />
      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={102} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toLocaleString()}${unit}`} />
      <Bar dataKey="value" fill="#285f7a" radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" formatter={(value) => `${Math.round(Number(value)).toLocaleString()}${unit}`} fontSize={12} /></Bar>
    </BarChart></ResponsiveContainer>
  </AccessibleChart>
}

export function AreaPairChart({ data, label, firstName, secondName }: { data: TimePoint[]; label: string; firstName: string; secondName: string }) {
  const view = useChartView()
  const chartData = view === 'selected' ? data : data.map((item) => ({ ...item, current: Math.round(item.prior), secondary: Math.round(item.prior * 0.72) }))
  return <AccessibleChart label={label}>
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 16, bottom: 4, left: -8 }}>
      <CartesianGrid stroke="#ebebeb" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Area type="monotone" dataKey="current" name={firstName} stroke="#b89a6a" fill="#efe7d7" strokeWidth={2} />
      <Area type="monotone" dataKey="secondary" name={secondName} stroke="#000000" fill="#ededed" strokeWidth={2} />
    </AreaChart></ResponsiveContainer>
  </AccessibleChart>
}

export function Heatmap({ data }: { data: HeatmapCell[] }) {
  const view = useChartView()
  const chartData = view === 'selected' ? data : data.map((cell) => ({ ...cell, value: Math.round(cell.value * 0.92) }))
  const hours = [...new Set(chartData.map((cell) => cell.hour))]
  const zones = [...new Set(chartData.map((cell) => cell.zone))]
  return <div className="heatmap-wrap" role="img" aria-label="Visitor congestion by zone and hour; darker cells indicate higher traffic">
    <div className="heatmap" style={{ gridTemplateColumns: `88px repeat(${hours.length}, minmax(36px, 1fr))` }}>
      <span />{hours.map((hour) => <b key={hour}>{hour.replace(' ', '\n')}</b>)}
      {zones.flatMap((zone) => [<strong key={`${zone}-label`}>{zone}</strong>, ...hours.map((hour) => { const value = chartData.find((cell) => cell.zone === zone && cell.hour === hour)?.value ?? 0; return <span key={`${zone}-${hour}`} style={{ backgroundColor: `color-mix(in srgb, #b89a6a ${value}%, #f5f5f5)` }} title={`${zone}, ${hour}: traffic index ${value}`}><i>{value}</i></span> })])}
    </div>
    <div className="heatmap-legend"><span>Lower traffic</span><i /><i /><i /><i /><span>Higher traffic</span></div>
  </div>
}

const visitorThemes = [
  ['cinema', 96], ['family', 82], ['galleries', 76], ['architecture', 68], ['artists', 63],
  ['storytelling', 59], ['exhibitions', 54], ['food', 48], ['animation', 45], ['design', 41],
  ['learning', 37], ['retail', 32], ['events', 29], ['accessibility', 25], ['membership', 22],
] as const

export function WordCloud() {
  const minCount = Math.min(...visitorThemes.map(([, count]) => count))
  const maxCount = Math.max(...visitorThemes.map(([, count]) => count))
  return <div className="word-cloud" role="img" aria-label="Visitor feedback themes, with larger words representing more frequent themes">
    {visitorThemes.map(([term, count], index) => {
      const size = 14 + ((count - minCount) / (maxCount - minCount)) * 24
      return <span key={term} style={{ fontSize: `${size}px`, color: colors[index % colors.length], fontWeight: count > 60 ? 700 : 500 }} title={`${term}: ${count} mentions`}>{term}</span>
    })}
  </div>
}

export function FlowMap({ scale = 1 }: { scale?: number }) {
  const view = useChartView()
  const flow = view === 'selected' ? { upper: 438, lower: 612 } : { upper: 403, lower: 563 }
  return <div className="flow-map" role="img" aria-label="Simplified visitor flow between museum floors and zones">
    <div className="flow-node flow-5"><b>5</b><span>Dining + garden</span><small>Downflow peak 3:10 PM</small></div>
    <div className="flow-arrow">↓ <span>{Math.round(flow.upper * scale).toLocaleString()}</span></div>
    <div className="flow-node flow-4"><b>4</b><span>Galleries + theaters</span><small>Elevator upflow peak 1:25 PM</small></div>
    <div className="flow-arrow">↓ <span>{Math.round(flow.lower * scale).toLocaleString()}</span></div>
    <div className="flow-node flow-1"><b>1</b><span>Lobby + retail</span><small>Arrival peak 1:05 PM</small></div>
  </div>
}