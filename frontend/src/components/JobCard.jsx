import { Link } from 'react-router-dom'

const TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote'
}

function formatSalary(min, max) {
  if (!min && !max) return null
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
  if (min && max) return `${fmt(min)} – ${fmt(max)} / month`
  return `${fmt(min || max)} / month`
}

export default function JobCard({ job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax)

  return (
    <Link to={`/jobs/${job.id}`} className="card-outline block hover:border-ink/25 transition group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg text-ink group-hover:text-coral transition">
            {job.title}
          </h3>
          <p className="text-muted text-sm mt-1">
            {job.companyName} · {job.location}
          </p>
        </div>
        <span className="badge-pill whitespace-nowrap">{TYPE_LABELS[job.type] || job.type}</span>
      </div>

      {salary && <p className="text-sm text-body mt-3 font-mono">{salary}</p>}

      {job.tags && (
        <div className="flex flex-wrap gap-2 mt-4">
          {job.tags.split(',').map((tag) => (
            <span key={tag} className="badge-pill">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
