import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsApi } from '../api/services'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']

export default function PostJobPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    tags: ''
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null
      }
      await jobsApi.create(payload)
      setSuccess('Job posted successfully. Redirecting to the job feed...')
      setTimeout(() => navigate('/', { replace: true, state: { message: 'Job posted successfully!' } }), 700)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-8">Post a job</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm text-muted mb-1">Job title</label>
          <input required className="input-field w-full" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">Location</label>
            <input required className="input-field w-full" value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Job type</label>
            <select className="input-field w-full" value={form.type} onChange={(e) => update('type', e.target.value)}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">Min salary (₹/month)</label>
            <input type="number" className="input-field w-full" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Max salary (₹/month)</label>
            <input type="number" className="input-field w-full" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Description</label>
          <textarea
            required
            className="input-field w-full min-h-[140px]"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Requirements</label>
          <textarea
            className="input-field w-full min-h-[100px]"
            value={form.requirements}
            onChange={(e) => update('requirements', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Tags (comma-separated)</label>
          <input
            className="input-field w-full"
            placeholder="java, spring-boot, night-shift"
            value={form.tags}
            onChange={(e) => update('tags', e.target.value)}
          />
        </div>

        {success && <p className="text-success text-sm">{success}</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Posting…' : 'Post job'}
        </button>
      </form>
    </div>
  )
}
