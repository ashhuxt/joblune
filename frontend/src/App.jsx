import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoadingScreen from './components/common/LoadingScreen'
import ProtectedRoute from './routes/ProtectedRoute'

import HomePage from './pages/HomePage'
import JobDetailPage from './pages/JobDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import PostJobPage from './pages/PostJobPage'
import EmployerDashboardPage from './pages/EmployerDashboardPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import NotFoundPage from './pages/NotFoundPage'

function AppShell() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Checking your session..." />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <EmployerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="border-t border-hairline/10 py-8 text-center text-muted text-sm">
        JobLune â€” built for the night shift.
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
