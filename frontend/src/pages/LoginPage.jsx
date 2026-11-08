/**
 * INUA Login Page — authenticates any user role.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiError } from '../utils/helpers'

const DEMO_CREDS = [
  { label: 'Mentee',    email: 'michelle.mutinda@strathmore.edu', password: 'Password123!' },
  { label: 'Mentor',    email: 'david.mwangi@safaricom.co.ke',    password: 'Password123!' },
  { label: 'Admin',     email: 'admin@inua.strathmore.edu',       password: 'Password123!' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const toast     = useToast()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.access_token, data.user)
      toast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success')
      const role = data.user.role
      if (role === 'mentee')        navigate('/mentors')
      else if (role === 'mentor')   navigate('/mentor/sessions')
      else                          navigate('/admin/overview')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(cred) {
    setForm({ email: cred.email, password: cred.password })
    setError('')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#40855d,#2f6847)' }}
          >
            <span className="text-white font-bold text-xl">IN</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate2-900">Sign in to INUA</h1>
          <p className="text-sm text-slate2-500 mt-1">Your smart mentorship companion</p>
        </div>

        {/* Demo buttons */}
        <div className="card p-3 mb-5">
          <p className="text-xs text-slate2-500 font-semibold uppercase tracking-wider mb-2 px-1">
            Demo credentials
          </p>
          <div className="flex gap-2">
            {DEMO_CREDS.map((c) => (
              <button
                key={c.label}
                onClick={() => fillDemo(c)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 text-sage-700
                           hover:bg-sage-100 transition-colors"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate2-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-sage-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
