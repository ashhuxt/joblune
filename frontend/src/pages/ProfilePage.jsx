import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/services'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    resumeUrl: '',
    companyName: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setForm({
      fullName: user.fullName || '',
      resumeUrl: user.resumeUrl || '',
      companyName: user.companyName || ''
    })
    setLoading(false)
  }, [user])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')

    try {
      const payload =
        user.role === 'JOB_SEEKER'
          ? {
              fullName: form.fullName,
              resumeUrl: form.resumeUrl
            }
          : {
              fullName: form.fullName,
              companyName: form.companyName
            }

      const updated = await usersApi.updateMe(payload)
      await refreshUser()
      setForm({
        fullName: updated.fullName || '',
        resumeUrl: updated.resumeUrl || '',
        companyName: updated.companyName || ''
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-8 w-40 bg-surfaceCard rounded mb-6" />
        <div className="h-40 bg-surfaceCard rounded-card" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Profile</h1>
      <p className="text-muted mb-8">Update your account details here.</p>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm text-muted mb-1">Full name</label>
          <input
            required
            className="input-field w-full"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
        </div>

        {user.role === 'JOB_SEEKER' && (
          <div>
            <label className="block text-sm text-muted mb-1">Resume URL</label>
            <input
              type="url"
              className="input-field w-full"
              placeholder="https://example.com/resume.pdf"
              value={form.resumeUrl}
              onChange={(e) => update('resumeUrl', e.target.value)}
            />
          </div>
        )}

        {user.role === 'EMPLOYER' && (
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

        {success && <p className="text-success text-sm">{success}</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
