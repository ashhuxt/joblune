import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, usersApi } from '../api/services'
import { AUTH_SESSION_CLEARED_EVENT, clearSession } from '../api/client'

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('joblune_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const syncCurrentUser = async () => {
      const token = localStorage.getItem('joblune_access_token')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const data = await usersApi.me()
        setUser(data)
        localStorage.setItem('joblune_user', JSON.stringify(data))
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    syncCurrentUser()
  }, [])

  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null)
    }

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleAuthCleared)
    return () => window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleAuthCleared)
  }, [])

  const persistSession = useCallback((authResponse) => {
    localStorage.setItem('joblune_access_token', authResponse.accessToken)
    localStorage.setItem('joblune_refresh_token', authResponse.refreshToken)
    localStorage.setItem('joblune_user', JSON.stringify(authResponse.user))
    setUser(authResponse.user)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password })
      persistSession(res)
      return res.user
    },
    [persistSession]
  )

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload)
      persistSession(res)
      return res.user
    },
    [persistSession]
  )

  const refreshUser = useCallback(async () => {
    const data = await usersApi.me()
    setUser(data)
    localStorage.setItem('joblune_user', JSON.stringify(data))
    return data
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refreshUser, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
