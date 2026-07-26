import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobsApi, applicationsApi } from '../api/services'

const STATUS_OPTIONS = [
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'HIRED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' }
]

const STATUS_STYLES = {
  APPLIED: { bg: '#f5f0e8', text: '#6c6a64' },
  SHORTLISTED: { bg: '#e8f4ea', text: '#2f6b3f' },
  HIRED: { bg: '#e8f4ea', text: '#2f6b3f' },
  REJECTED: { bg: '#fbeaea', text: '#a53535' }
}

function initials(name) {
  return (name || 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [applicationsByJob, setApplicationsByJob] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    jobsApi
      .mine()
      .then(setJobs)
      .catch(() => setError('Could not load your job postings.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleApplications(jobId) {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }

    setExpandedJobId(jobId)
    if (!applicationsByJob[jobId]) {
      try {
        const data = await applicationsApi.forJob(jobId)
        setApplicationsByJob((current) => ({ ...current, [jobId]: data }))
      } catch {
        setApplicationsByJob((current) => ({ ...current, [jobId]: [] }))
      }
    }
  }

  async function updateStatus(jobId, applicationId, status) {
    const updated = await applicationsApi.updateStatus(applicationId, status)
    setApplicationsByJob((current) => ({
      ...current,
      [jobId]: (current[jobId] || []).map((item) => (item.id === applicationId ? updated : item))
    }))
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-8 w-64 bg-surfaceCard rounded mb-8" />
        <div className="h-20 bg-surfaceCard rounded-card mb-4" />
        <div className="h-20 bg-surfaceCard rounded-card" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-ink">Employer applications</h1>
          <p className="text-muted text-sm mt-1">Review candidates and update their status.</p>
        </div>
        <Link to="/employer/post-job" className="btn-primary">
          Post a new job
        </Link>
      </div>

      {error && <p className="text-danger mb-6">{error}</p>}

      {jobs.length === 0 && !error && (
        <div className="card-outline text-center py-16">
          <p className="text-ink text-xl">No job postings yet.</p>
          <p className="text-muted mt-2">Post a role to start collecting applications.</p>
          <Link to="/employer/post-job" className="btn-primary inline-flex mt-5">
            Post a new job
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {jobs.map((job) => {
          const applications = applicationsByJob[job.id] || []
          return (
            <div key={job.id} className="card-outline">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-ink">{job.title}</h3>
                  <p className="text-muted text-sm mt-0.5">
                    {job.location} · <span className={job.active ? 'text-[#2f6b3f]' : 'text-muted'}>{job.active ? 'Active' : 'Inactive'}</span>
                  </p>
                </div>
                <button className="btn-secondary" onClick={() => toggleApplications(job.id)}>
                  {expandedJobId === job.id ? 'Hide applications' : 'View applications'}
                </button>
              </div>

              {expandedJobId === job.id && (
                <div className="mt-5 pt-5 border-t border-hairline">
                  {!applicationsByJob[job.id] && <p className="text-muted text-sm">Loading applications…</p>}
                  {applications.length === 0 && applicationsByJob[job.id] && (
                    <div className="text-center py-10">
                      <p className="text-ink text-base">No applications yet.</p>
                      <p className="text-muted text-sm mt-1">Candidates will appear here once they apply.</p>
                    </div>
                  )}

                  {applications.length > 0 && (
                    <div className="space-y-3">
                      {applications.map((app) => {
                        const style = STATUS_STYLES[app.status] || STATUS_STYLES.APPLIED
                        return (
                          <div key={app.id} className="bg-surfaceDark rounded-card p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: '#cc785c', color: '#fff' }}>
                                  {initials(app.applicantName)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-onDark text-sm font-medium truncate">{app.applicantName}</p>
                                  <p className="text-onDarkSoft text-xs truncate">{app.applicantEmail}</p>
                                  <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-[#e8a186] text-xs hover:underline">
                                    View resume
                                  </a>
                                </div>
                              </div>

                              <span className="text-xs font-medium rounded-full px-3 py-1.5" style={{ backgroundColor: style.bg, color: style.text }}>
                                {app.status}
                              </span>
                            </div>

                            <div className="mt-3">
                              <p className="text-onDarkSoft text-xs mb-1">Cover letter</p>
                              <p className="text-onDark text-sm whitespace-pre-line">{app.coverNote || 'No cover letter provided.'}</p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {STATUS_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-surfaceDarkElevated text-onDarkSoft hover:text-onDark"
                                  onClick={() => updateStatus(job.id, app.id, option.value)}
                                  disabled={app.status === option.value}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
