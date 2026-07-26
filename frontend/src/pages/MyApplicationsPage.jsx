import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationsApi } from '../api/services'

const STATUS_COLORS = {
  PENDING: 'text-muted border-hairline/30',
  SHORTLISTED: 'text-success border-success/30',
  HIRED: 'text-success border-success/30',
  REJECTED: 'text-danger border-danger/30'
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsApi
      .myApplications()
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="max-w-3xl mx-auto px-6 py-16 text-muted">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-8">My applications</h1>

      {applications.length === 0 && (
        <div className="card-outline text-center py-16">
          <p className="text-ink font-display text-xl">No applications yet.</p>
          <p className="text-muted mt-2">
            <Link to="/" className="text-coral underline">
              Browse Jobs
            </Link>{' '}
            to find roles and start applying.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="card-outline flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link to={`/jobs/${app.jobId}`} className="text-ink font-display hover:text-coral transition">
                {app.jobTitle}
              </Link>
              <p className="text-muted text-sm mt-1">{app.companyName}</p>
              <p className="text-muted text-xs mt-1">
                Applied {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`text-xs font-mono border rounded-full px-3 py-1 whitespace-nowrap ${
                STATUS_COLORS[app.status] || STATUS_COLORS.PENDING
              }`}
            >
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
