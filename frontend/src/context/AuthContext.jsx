/**
 * INUA AuthContext
 * Provides authentication state and actions to the entire React tree.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('inua_token'))
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('inua_user')) } catch { return null }
  })

  const login = useCallback((accessToken, userData) => {
    localStorage.setItem('inua_token', accessToken)
    localStorage.setItem('inua_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('inua_token')
    localStorage.removeItem('inua_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
