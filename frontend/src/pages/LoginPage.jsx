/**
 * INUA Login Page — implements the split-screen design from
 * design/wireframes/1-mentee-login-register.png with one-click demo role selector.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiError } from '../utils/helpers'
import InuaLogo from '../components/common/InuaLogo'

const DEMO_CREDS = [
  { key: 'mentee', label: 'Mentee', email: 'michelle.mutinda@strathmore.edu', password: 'Password123!' },
  { key: 'mentor', label: 'Mentor', email: 'david.mwangi@safaricom.co.ke', password: 'Password123!' },
  { key: 'admin',  label: 'Admin',  email: 'admin@inua.strathmore.edu', password: 'Password123!' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('mentee')
  const [form, setForm] = useState({
    email: DEMO_CREDS[0].email,
    password: DEMO_CREDS[0].password,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    setError('')
  }

  function selectPersona(cred) {
    setActiveTab(cred.key)
    setForm({ email: cred.email, password: cred.password })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.access_token, data.user)
      toast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success')
      const role = data.user.role
      if (role === 'mentee') navigate('/mentors')
      else if (role === 'mentor') navigate('/mentor/quality')
      else navigate('/admin/overview')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Half: Dark Navy Brand Showcase (matches 1-mentee-login-register.png) */}
      <div className="lg:col-span-5 bg-[#0B1324] text-white p-8 sm:p-12 flex flex-col justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white no-underline">
            <span>←</span> Back to INUA Home
          </Link>
        </div>

        <div className="my-auto py-12 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <InuaLogo size={56} showText={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white mb-4">
            Your Professional Growth Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
            Connect with vetted industry guides, set metrics-backed goals, and elevate your
            career capabilities with data-driven mentorship insights.
          </p>

          {/* Network Graphic Card */}
          <div className="rounded-2xl bg-[#131F36] border border-slate-800 p-6 shadow-inner">
            <svg viewBox="0 0 320 140" className="w-full h-32">
              <line x1="60" y1="75" x2="155" y2="35" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="60" y1="75" x2="230" y2="95" stroke="#14B8A6" strokeWidth="2" />
              <line x1="155" y1="35" x2="230" y2="95" stroke="#64748B" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="155" y1="35" x2="270" y2="45" stroke="#14B8A6" strokeWidth="1.2" strokeOpacity="0.7" />
              <line x1="60" y1="75" x2="120" y2="115" stroke="#64748B" strokeWidth="1" />
              <line x1="120" y1="115" x2="230" y2="95" stroke="#D97706" strokeWidth="1.2" strokeOpacity="0.5" />
              <circle cx="60" cy="75" r="9" fill="#D97706" />
              <text x="60" y="98" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="bold">Mentor</text>
              <circle cx="230" cy="95" r="9" fill="#14B8A6" />
              <text x="230" y="118" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="bold">Mentee</text>
              <circle cx="155" cy="35" r="5" fill="#94A3B8" />
              <circle cx="270" cy="45" r="5" fill="#14B8A6" />
              <circle cx="120" cy="115" r="4" fill="#D97706" />
            </svg>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center">
          Strathmore University · School of Computing & Engineering Sciences
        </div>
      </div>

      {/* Right Half: White Sign-In Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Role Switcher Tabs (matches wireframe top switcher) */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-8">
            {DEMO_CREDS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => selectPersona(c)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === c.key
                    ? 'bg-[#0B1324] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#0B1324]">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your session dashboard (click a role tab above to pre-fill demo credentials)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="alert alert-error text-xs">
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0B1324] focus:bg-white transition-colors"
                placeholder="you@strathmore.edu"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0B1324] focus:bg-white transition-colors"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-lg bg-[#0B1324] hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all cursor-pointer mt-2"
            >
              {loading ? <span className="spinner" /> : 'Log In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            New here?{' '}
            <Link to="/register" className="text-[#D97706] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
