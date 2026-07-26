import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MoonMark from '../components/MoonMark'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER',
    companyName: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="flex items-center gap-2 text-coral justify-center mb-8">
        <MoonMark className="w-8 h-8" />
        <span className="font-display text-2xl text-ink">JobLune</span>
      </div>

      <div className="card">
        <h1 className="font-display text-2xl text-ink mb-6">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update('role', 'JOB_SEEKER')}
              className={`flex-1 py-2 rounded-card border text-sm ${
                form.role === 'JOB_SEEKER' ? 'border-coral text-coral' : 'border-hairline/30 text-muted'
              }`}
            >
              I'm looking for work
            </button>
            <button
              type="button"
              onClick={() => update('role', 'EMPLOYER')}
              className={`flex-1 py-2 rounded-card border text-sm ${
                form.role === 'EMPLOYER' ? 'border-coral text-coral' : 'border-hairline/30 text-muted'
              }`}
            >
              I'm hiring
            </button>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Full name</label>
            <input
              required
              className="input-field w-full"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              required
              className="input-field w-full"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field w-full"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>

          {form.role === 'EMPLOYER' && (
            <div>
              <label className="block text-sm text-muted mb-1">Company name</label>
              <input
                required
                className="input-field w-full"
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-muted text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-coral">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
