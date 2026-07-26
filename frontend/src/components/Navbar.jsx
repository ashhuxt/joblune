import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MoonMark from './MoonMark'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-hairline bg-canvas h-16 flex items-center sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-coral">
          <MoonMark />
          <span className="font-display text-xl text-ink tracking-tight">JobLune</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-body font-medium">
          <Link to="/" className="text-muted hover:text-ink transition">
            Browse jobs
          </Link>

          {isAuthenticated && user.role === 'JOB_SEEKER' && (
            <Link to="/my-applications" className="text-muted hover:text-ink transition">
              My applications
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/profile" className="text-muted hover:text-ink transition">
              Profile
            </Link>
          )}

          {isAuthenticated && user.role === 'EMPLOYER' && (
            <>
              <Link to="/employer/dashboard" className="text-muted hover:text-ink transition">
                Dashboard
              </Link>
              <Link to="/employer/post-job" className="btn-primary">
                Post a job
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-muted hover:text-error transition">
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-muted hover:text-ink transition">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
