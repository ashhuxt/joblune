import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobsApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [applyError, setApplyError] = useState(null)
  const [applyLoading, setApplyLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    jobsApi
      .getById(id)
      .then(setJob)
      .catch(() => setError('This job could not be found.'))
      .finally(() => setLoading(false))
  }, [id])

  const canApply = useMemo(() => isAuthenticated && user?.role === 'JOB_SEEKER', [isAuthenticated, user?.role])

  useEffect(() => {
    if (!isModalOpen) return
    setResumeUrl(user?.resumeUrl || '')
    setCoverLetter('')
    setResumeError('')
    setApplyError(null)
  }, [isModalOpen, user?.resumeUrl])

  async function handleApply(e) {
    e.preventDefault()
    const trimmedResumeUrl = resumeUrl.trim()
    if (!trimmedResumeUrl) {
      setResumeError('Resume URL is required.')
      return
    }

    setApplyLoading(true)
    setApplyError(null)
    setResumeError('')

    try {
      await jobsApi.apply(id, {
        jobId: id,
        resumeUrl: trimmedResumeUrl,
        coverNote: coverLetter.trim() || null
      })
      setApplied(true)
      setIsModalOpen(false)
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Could not submit your application. Please try again.')
    } finally {
      setApplyLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-4 w-16 bg-surfaceCard rounded mb-8" />
        <div className="h-9 w-2/3 bg-surfaceCard rounded mb-3" />
        <div className="h-4 w-1/3 bg-surfaceCard rounded mb-8" />
        <div className="h-40 bg-surfaceCard rounded-card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="card-outline text-center py-12">
          <p className="text-ink text-lg">{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary mt-5">
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <button onClick={() => navigate(-1)} className="text-muted hover:text-ink text-sm mb-8">
        ← Back
      </button>

      <h1 className="font-display text-4xl text-ink tracking-tight">{job.title}</h1>
      <p className="text-muted mt-2">
        {job.companyName} · {job.location} · {job.type.replace('_', ' ').toLowerCase()}
      </p>

      <div className="card mt-8 space-y-6">
        <div>
          <h2 className="text-xl text-coral mb-2">About the role</h2>
          <p className="text-body whitespace-pre-line leading-relaxed">{job.description}</p>
        </div>
        {job.requirements && (
          <div>
            <h2 className="text-xl text-coral mb-2">What we're looking for</h2>
            <p className="text-body whitespace-pre-line leading-relaxed">{job.requirements}</p>
          </div>
        )}
      </div>

      <div className="mt-10">
        {!isAuthenticated && (
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Apply Now
          </button>
        )}

        {user?.role === 'EMPLOYER' && null}

        {canApply && (
          <>
            <button
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
              disabled={applied}
            >
              {applied ? 'Applied' : 'Apply Now'}
            </button>
            <p className="text-muted text-sm mt-3">
              {applied ? 'Your application has been submitted.' : 'A resume URL is required before you submit.'}
            </p>
            {applyError && <p className="text-danger text-sm mt-3">{applyError}</p>}
          </>
        )}
      </div>

      {isModalOpen && canApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close apply modal"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-card bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-ink">Apply now</h2>
                <p className="text-sm text-muted mt-1">Add your resume URL and an optional cover letter.</p>
              </div>
              <button
                type="button"
                className="text-muted hover:text-ink text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Resume URL</label>
                <input
                  type="url"
                  required
                  className="input-field w-full"
                  placeholder="https://example.com/resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
                {resumeError && <p className="text-danger text-sm mt-1">{resumeError}</p>}
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Cover letter (optional)</label>
                <textarea
                  className="input-field w-full min-h-[120px]"
                  placeholder="Tell us why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {applyError && <p className="text-danger text-sm">{applyError}</p>}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={applyLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={applyLoading}>
                  {applyLoading ? 'Submitting…' : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
