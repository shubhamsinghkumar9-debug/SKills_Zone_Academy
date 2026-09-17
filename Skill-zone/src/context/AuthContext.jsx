import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, clearTokens } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(res => { if (res.success) setUser(res.data.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    if (res.success) setUser(res.data.user)
    return res
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    if (res.success) setUser(res.data.user)
    return res
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
