import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { jobsApi } from '../api/services'
import JobCard from '../components/JobCard'

const JOB_TYPES = [
  { value: '', label: 'All types' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' }
]

export default function HomePage() {
  const location = useLocation()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ search: '', type: '' })
  const [bannerMessage, setBannerMessage] = useState(location.state?.message || '')

  const fetchJobs = useCallback(async (activeFilters) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (activeFilters.search) {
        params.keyword = activeFilters.search
        params.location = activeFilters.search
      }
      if (activeFilters.type) {
        params.type = activeFilters.type
      }
      const page = await jobsApi.search(params)
      setJobs(page.content || [])
    } catch (err) {
      setError('Could not load jobs right now. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!location.state?.message) return

    setBannerMessage(location.state.message)
    const timer = window.setTimeout(() => setBannerMessage(''), 5000)
    window.history.replaceState({}, '')

    return () => window.clearTimeout(timer)
  }, [location.state])

  function handleSubmit(e) {
    e.preventDefault()
    fetchJobs(filters)
  }

  function clearFilters() {
    const nextFilters = { search: '', type: '' }
    setFilters(nextFilters)
    fetchJobs(nextFilters)
  }

  const hasActiveFilters = Boolean(filters.search || filters.type)

  return (
    <div>
      {bannerMessage && (
        <section className="max-w-6xl mx-auto px-6 pt-6">
          <div className="flex items-start justify-between gap-4 rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            <p className="text-sm font-medium">{bannerMessage}</p>
            <button
              type="button"
              className="text-sm font-semibold text-emerald-900/70 hover:text-emerald-900"
              onClick={() => setBannerMessage('')}
              aria-label="Dismiss success message"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      <section className="border-b border-hairline">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-medium text-coral tracking-[1.5px] uppercase mb-5">
              Careers that run after dark
            </p>
            <h1 className="text-5xl md:text-6xl leading-[1.05] tracking-[-1.5px] text-ink">
              Find work while the world sleeps.
            </h1>
            <p className="text-body text-lg mt-6 max-w-md leading-relaxed">
              JobLune connects night-shift talent with employers who never stop hiring.
              Browse open roles, apply in minutes, hear back fast.
            </p>
            <div className="flex gap-3 mt-8">
              <a href="#listings" className="btn-primary">
                Browse jobs
              </a>
              <Link to="/register" className="btn-secondary">
                Post a job
              </Link>
            </div>
          </div>

          <div className="card-dark">
            <p className="text-xs text-onDarkSoft uppercase tracking-[1.5px] mb-4">Now hiring</p>
            <div className="space-y-3">
              <div className="bg-surfaceDarkElevated rounded-md px-4 py-3">
                <p className="text-onDark text-sm font-medium">Backend Engineer</p>
                <p className="text-onDarkSoft text-xs mt-1">Globalco Â· Hyderabad Â· Full-time</p>
              </div>
              <div className="bg-surfaceDarkElevated rounded-md px-4 py-3">
                <p className="text-onDark text-sm font-medium">Night-shift Support Lead</p>
                <p className="text-onDarkSoft text-xs mt-1">Nocturne Ops Â· Manila Â· Remote</p>
              </div>
              <div className="bg-surfaceDarkElevated rounded-md px-4 py-3">
                <p className="text-onDark text-sm font-medium">QA Analyst</p>
                <p className="text-onDarkSoft text-xs mt-1">Globalco Â· Hyderabad Â· Full-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12" id="listings">
        <form onSubmit={handleSubmit} className="card-outline flex flex-col md:flex-row gap-3 items-stretch">
          <input
            className="input-field flex-1"
            placeholder="Search jobs or locations"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <select
            className="input-field md:w-48"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary md:w-32">
            Search
          </button>
          {hasActiveFilters && (
            <button type="button" className="btn-secondary md:w-40" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </form>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-outline h-32">
                <div className="h-4 w-2/3 bg-surfaceCard rounded mb-3" />
                <div className="h-3 w-1/2 bg-surfaceCard rounded mb-4" />
                <div className="h-3 w-1/3 bg-surfaceCard rounded" />
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <div className="card-outline text-center py-16">
            <p className="text-ink text-xl">No roles match yet.</p>
            <p className="text-muted mt-2">
              {hasActiveFilters
                ? 'Try a different search or clear your filters.'
                : 'Check back soon for new openings.'}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  )
}
