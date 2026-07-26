import { Link } from 'react-router-dom'
import MoonMark from '../components/MoonMark'

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="flex items-center justify-center gap-2 text-coral mb-8">
        <MoonMark className="w-8 h-8" />
      </div>
      <h1 className="text-3xl text-ink mb-3">This page has drifted off.</h1>
      <p className="text-muted mb-8">
        The page you're looking for doesn't exist, or the role may no longer be listed.
      </p>
      <Link to="/" className="btn-primary">
        Back to listings
      </Link>
    </div>
  )
}
