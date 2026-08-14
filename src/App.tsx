import { useDeferredValue, useEffect, useState } from 'react'
import { DashboardShell } from './components/DashboardShell'
import { ExecutiveOverview } from './pages/ExecutiveOverview'
import { OperationsPage } from './pages/OperationsPage'
import { dashboardDataAdapter } from './services/dashboardService'
import type { DashboardData, Filters, PageId } from './types/dashboard'

const initialFilters: Filters = {
  period: 'last-business-day',
  membershipLevel: 'All membership levels',
  demographic: 'All demographics',
  ticketPrice: 'All ticket prices',
  membershipChannel: 'All membership channels',
  customStart: '2026-11-12',
  customEnd: '2026-11-12',
}

function App() {
  const [page, setPage] = useState<PageId>(() => window.location.hash === '#operations' ? 'operations' : 'overview')
  const [filters, setFilters] = useState(initialFilters)
  const deferredFilters = useDeferredValue(filters)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    setLoadState('loading')
    dashboardDataAdapter.getDashboardData(deferredFilters, controller.signal)
      .then((result) => {
        setData(result)
        setLoadState('loaded')
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadState('error')
      })
    return () => controller.abort()
  }, [deferredFilters])

  const navigate = (nextPage: PageId) => {
    setPage(nextPage)
    window.location.hash = nextPage === 'operations' ? 'operations' : ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardShell page={page} onNavigate={navigate} filters={filters} onFiltersChange={setFilters}>
      {page === 'overview'
        ? <ExecutiveOverview data={data} state={loadState} onRetry={() => setFilters({ ...filters })} />
        : data
          ? <OperationsPage data={data} />
          : <div className="page-loading">Loading completed-period operations data...</div>}
    </DashboardShell>
  )
}

export default App