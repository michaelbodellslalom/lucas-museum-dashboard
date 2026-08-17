import type { ReactNode } from 'react'
import {
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Settings2,
  TicketCheck,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { filterOptions } from '../data/mockData'
import type { Filters, PageId, ReportingPeriod } from '../types/dashboard'

const periodOptions: { value: ReportingPeriod; label: string; start: string; end: string }[] = [
  { value: 'last-business-day', label: 'Last complete business day', start: '2026-11-12', end: '2026-11-12' },
  { value: 'last-7', label: 'Last 7 completed days', start: '2026-11-06', end: '2026-11-12' },
  { value: 'last-30', label: 'Last 30 completed days', start: '2026-10-14', end: '2026-11-12' },
  { value: 'mtd', label: 'Month to date', start: '2026-11-01', end: '2026-11-12' },
  { value: 'ytd', label: 'Year to date', start: '2026-01-01', end: '2026-11-12' },
  { value: 'custom', label: 'Custom range', start: '2026-11-06', end: '2026-11-12' },
]

const navigation = [
  { id: 'overview', pageId: 'overview' as PageId, label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'financials', label: 'Financials', icon: CircleDollarSign },
  { id: 'memberships', label: 'Memberships', icon: Users },
  { id: 'operations', pageId: 'operations' as PageId, label: 'Operations', icon: ClipboardCheck },
  { id: 'admissions', label: 'Admissions', icon: TicketCheck },
]

function Field({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="filter-field"><span>{label}</span><div><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></div></label>
}

function formatUsInputDate(value: string) {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${month}/${day}/${year}` : value
}

function parseUsInputDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const [, month, day, year] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function UsDateInput({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(() => formatUsInputDate(value))

  useEffect(() => setDraft(formatUsInputDate(value)), [value])

  const commit = (nextDraft: string) => {
    const parsed = parseUsInputDate(nextDraft)
    if (parsed && (!min || parsed >= min) && (!max || parsed <= max)) {
      onChange(parsed)
      setDraft(formatUsInputDate(parsed))
      return
    }
    setDraft(formatUsInputDate(value))
  }

  return <label><span>{label}</span><input type="text" inputMode="numeric" placeholder="MM/DD/YYYY" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={(event) => commit(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} /></label>
}

export function FilterBar({ filters, onChange, onOpenNavigation }: {
  filters: Filters
  onChange: (next: Filters) => void
  onOpenNavigation: () => void
}) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value })
  const updatePeriod = (period: ReportingPeriod) => {
    const option = periodOptions.find((item) => item.value === period)
    if (!option) return
    onChange({ ...filters, period, customStart: option.start, customEnd: option.end })
  }
  const updateDate = (key: 'customStart' | 'customEnd', value: string) => onChange({ ...filters, period: 'custom', [key]: value })
  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      <button className="menu-button" onClick={onOpenNavigation} aria-label="Open navigation"><Menu /></button>
      <div className="filter-title"><Settings2 size={18} /><div><strong>Reporting view</strong><span>Completed periods only</span></div></div>
      <div className="filter-controls">
        <div className="date-filter-group" role="group" aria-label="Reporting dates">
          <label className="filter-field period-field"><span>Date range</span><div><select value={filters.period} onChange={(event) => updatePeriod(event.target.value as ReportingPeriod)}>{periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14} /></div></label>
          <div className="custom-range"><UsDateInput label="Start" value={filters.customStart} max={filters.customEnd} onChange={(value) => updateDate('customStart', value)} /><UsDateInput label="End" value={filters.customEnd} min={filters.customStart} max="2026-11-12" onChange={(value) => updateDate('customEnd', value)} /></div>
        </div>
        <Field label="Membership level" value={filters.membershipLevel} options={filterOptions.membershipLevel} onChange={(value) => update('membershipLevel', value)} />
        <Field label="Demographics" value={filters.demographic} options={filterOptions.demographic} onChange={(value) => update('demographic', value)} />
        <Field label="Ticket prices" value={filters.ticketPrice} options={filterOptions.ticketPrice} onChange={(value) => update('ticketPrice', value)} />
        <Field label="Membership channel" value={filters.membershipChannel} options={filterOptions.membershipChannel} onChange={(value) => update('membershipChannel', value)} />
      </div>
    </section>
  )
}

function Sidebar({ page, onNavigate, open, onClose }: { page: PageId; onNavigate: (page: PageId) => void; open: boolean; onClose: () => void }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="wordmark"><span>LUCAS MUSEUM</span><small>OF NARRATIVE ART / INTERNAL</small></div>
      <button className="mobile-close" onClick={onClose} aria-label="Close navigation"><X /></button>
      <nav aria-label="Primary navigation">
        {navigation.map(({ id, pageId, label, icon: Icon }) => pageId ? (
          <button key={id} className={page === pageId ? 'nav-active' : ''} onClick={() => { onNavigate(pageId); onClose() }} aria-current={page === pageId ? 'page' : undefined}><Icon size={19} /><span>{label}</span></button>
        ) : (
          <div key={id} className="nav-disabled" tabIndex={0} aria-disabled="true" data-tooltip="This detailed view is planned for a future release."><Icon size={19} /><span>{label}<small>Coming in Phase 2</small></span><b>Planned</b></div>
        ))}
      </nav>
    </aside>
  )
}

export function DashboardShell({ page, onNavigate, filters, onFiltersChange, children }: {
  page: PageId
  onNavigate: (page: PageId) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  children: ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={onNavigate} open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
      <div className="app-main">
        <FilterBar filters={filters} onChange={onFiltersChange} onOpenNavigation={() => setNavOpen(true)} />
        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}