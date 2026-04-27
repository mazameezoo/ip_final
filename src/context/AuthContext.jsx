import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, getToken, setToken, clearToken } from '../utils/api'

const AUTH_KEY = 'tf_auth'

const loadAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  }, [user])

  const login = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login({ email, password })
      setToken(data.token)
      const userInfo = {
        _id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role,
        company: data.company,
      }
      setUser(userInfo)
      return userInfo
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ email, password, firstName, lastName, role = 'candidate', company }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.register({ email, password, firstName, lastName, role, company })
      setToken(data.token)
      const userInfo = {
        _id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role,
        company: data.company,
      }
      setUser(userInfo)
      return userInfo
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}