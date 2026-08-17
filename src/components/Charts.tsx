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
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoryValue, DemographicValue, HeatmapCell, TimePoint } from '../types/dashboard'

const colors = ['#285f7a', '#bf6449', '#927039', '#4f7b65', '#73536f', '#7393a1', '#d4a947']
const tooltipStyle = { border: '1px solid #d9d5cb', borderRadius: 6, boxShadow: '0 8px 24px rgba(35,32,28,.08)', fontSize: 12 }

export type ChartView = 'selected' | 'prior'
const ChartViewContext = createContext<ChartView>('selected')

export function ChartViewProvider({ value, children }: { value: ChartView; children: ReactNode }) {
  return <ChartViewContext.Provider value={value}>{children}</ChartViewContext.Provider>
}

function useChartView() {
  return useContext(ChartViewContext)
}

function categoryView(data: CategoryValue[], view: ChartView): CategoryValue[] {
  if (view === 'selected') return data
  return data.map((item) => ({ ...item, value: Math.round(item.prior ?? item.value * 0.92) }))
}

function AccessibleChart({ label, children, height = 260 }: { label: string; children: React.ReactNode; height?: number }) {
  return <div className="chart-frame" style={{ height }} role="img" aria-label={label}>{children}</div>
}

export function SalesAttendanceChart({ data }: { data: TimePoint[] }) {
  const view = useChartView()
  const chartData = view === 'selected' ? data : data.map((item) => ({ ...item, current: Math.round(item.prior), secondary: Math.round(item.prior * 0.84) }))
  return <AccessibleChart label="Ticket sales and visitor attendance by hour with available capacity">
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 16, right: 16, bottom: 4, left: -16 }}>
      <CartesianGrid stroke="#e6e2da" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="current" name="Tickets sold" fill="#285f7a" radius={[3, 3, 0, 0]} />
      <Line type="monotone" dataKey="secondary" name="Visitors checked in" stroke="#bf6449" strokeWidth={3} dot={{ r: 3 }} />
      <Line type="step" dataKey="capacity" name="Capacity" stroke="#927039" strokeDasharray="5 4" dot={false} />
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
  return <div className="membership-chart">
    <DonutChart data={channels} label="Membership sales split between online and in-person channels" />
    <AccessibleChart label="Memberships sold by level" height={250}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={levelData} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 95 }}>
        <CartesianGrid stroke="#e6e2da" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={82} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
        <Bar dataKey="value" name={view === 'selected' ? 'Selected period' : 'Prior comparable'} fill="#4f7b65" radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" formatter={(value) => Number(value).toLocaleString()} fontSize={12} /></Bar>
      </BarChart></ResponsiveContainer>
    </AccessibleChart>
  </div>
}

export function DemographicPriceChart({ data }: { data: DemographicValue[] }) {
  const view = useChartView()
  const chartData = view === 'selected' ? data : data.map((item) => ({ ...item, visitors: Math.round(item.visitors * 0.92) }))
  const shortLabels: Record<string, string> = {
    'Adult 18–64': 'Adult',
    'Youth 6–17': 'Youth',
    'Child under 6': 'Under 6',
    'Senior 65+': 'Senior',
  }
  return <AccessibleChart label="Visitor volume and average ticket price by aggregated visitor demographic" height={280}>
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 18, right: 12, bottom: 4, left: -8 }}>
      <CartesianGrid stroke="#e6e2da" vertical={false} />
      <XAxis dataKey="name" tickFormatter={(value) => shortLabels[value] ?? value} tickLine={false} axisLine={false} fontSize={11} interval={0} />
      <YAxis yAxisId="visitors" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis yAxisId="price" orientation="right" domain={[0, 40]} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => String(name) === 'Average ticket price' ? `$${Number(value).toFixed(2)}` : Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Bar yAxisId="visitors" dataKey="visitors" name="Visitors" fill="#285f7a" radius={[3, 3, 0, 0]} />
      <Line yAxisId="price" type="monotone" dataKey="averageTicketPrice" name="Average ticket price" stroke="#bf6449" strokeWidth={3} dot={{ r: 4 }} />
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
      <CartesianGrid stroke="#e6e2da" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
      <ReferenceLine y={85} stroke="#bf6449" strokeDasharray="5 4" label={{ value: 'At risk 85%', fontSize: 11, fill: '#8d4230' }} />
      <ReferenceLine y={70} stroke="#927039" strokeDasharray="4 4" label={{ value: 'Watch 70%', fontSize: 11, fill: '#735a2e' }} />
      <Area type="monotone" dataKey="current" name="Utilization" stroke="#285f7a" fill="#d9e5e9" strokeWidth={3} />
      <Line type="monotone" dataKey="prior" name="Prior comparable" stroke="#73536f" strokeWidth={2} dot={false} />
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
      <CartesianGrid stroke="#e6e2da" vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      <Area type="monotone" dataKey="current" name={firstName} stroke="#285f7a" fill="#d9e5e9" strokeWidth={2} />
      <Area type="monotone" dataKey="secondary" name={secondName} stroke="#bf6449" fill="#f2ddd5" strokeWidth={2} />
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
      {zones.flatMap((zone) => [<strong key={`${zone}-label`}>{zone}</strong>, ...hours.map((hour) => { const value = chartData.find((cell) => cell.zone === zone && cell.hour === hour)?.value ?? 0; return <span key={`${zone}-${hour}`} style={{ backgroundColor: `color-mix(in srgb, #285f7a ${value}%, #f2efe8)` }} title={`${zone}, ${hour}: traffic index ${value}`}><i>{value}</i></span> })])}
    </div>
    <div className="heatmap-legend"><span>Lower traffic</span><i /><i /><i /><i /><span>Higher traffic</span></div>
  </div>
}

export function FlowMap() {
  const view = useChartView()
  const flow = view === 'selected' ? { upper: 438, lower: 612 } : { upper: 403, lower: 563 }
  return <div className="flow-map" role="img" aria-label="Simplified visitor flow between museum floors and zones">
    <div className="flow-node flow-5"><b>5</b><span>Dining + garden</span><small>Downflow peak 3:10 PM</small></div>
    <div className="flow-arrow">↓ <span>{flow.upper.toLocaleString()}</span></div>
    <div className="flow-node flow-4"><b>4</b><span>Galleries + theaters</span><small>Elevator upflow peak 1:25 PM</small></div>
    <div className="flow-arrow">↓ <span>{flow.lower.toLocaleString()}</span></div>
    <div className="flow-node flow-1"><b>1</b><span>Lobby + retail</span><small>Arrival peak 1:05 PM</small></div>
  </div>
}