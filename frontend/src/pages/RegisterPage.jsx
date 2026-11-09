/**
 * INUA Register Page — split-screen layout matching 1-mentee-login-register.png.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiError } from '../utils/helpers'

const FIELDS_OF_STUDY = [
  'Computer Science', 'Engineering', 'Business',
  'Data Analytics', 'Health Sciences', 'Education', 'Social Sciences', 'Other STEM',
]
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Consulting', 'Energy', 'Government', 'Non-Profit', 'Other',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const [role, setRole] = useState('mentee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: 'Strathmore University',
    academic_level: 'Year4',
    career_interest: 'Software Engineering',
    field_of_study: 'Computer Science',
    industry: 'Technology',
    expertise: '',
    experience_years: 5,
    bio: '',
  })

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role }
      if (role === 'mentee') {
        payload.university = form.university
        payload.career_stage = form.academic_level
        payload.career_interest = form.career_interest
      } else {
        payload.industry = form.industry
        payload.expertise = form.expertise
        payload.experience_years = Number(form.experience_years)
      }
      const { data } = await api.post('/auth/register', payload)
      if (data?.access_token && data?.user) {
        login(data.access_token, data.user)
      } else {
        const loginRes = await api.post('/auth/login', { email: form.email, password: form.password })
        login(loginRes.data.access_token, loginRes.data.user)
      }
      toast(`Welcome to INUA, ${form.name.split(' ')[0]}!`, 'success')
      if (role === 'mentee') navigate('/mentors')
      else navigate('/mentor/quality')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Half: Dark Navy Brand Showcase */}
      <div className="lg:col-span-5 bg-[#0B1324] text-white p-8 sm:p-12 flex flex-col justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white no-underline">
            <span>←</span> Back to INUA Home
          </Link>
        </div>

        <div className="my-auto py-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#D97706] text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            I
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white mb-4">
            Your Professional Growth Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Join Kenya’s intelligent mentorship ecosystem. Set structured career milestones and
            receive real-time XGBoost & TreeSHAP effectiveness diagnostics.
          </p>
        </div>

        <div className="text-[11px] text-slate-500 text-center">
          Strathmore University · School of Computing & Engineering Sciences
        </div>
      </div>

      {/* Right Half: White Registration Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-6">
            {['mentee', 'mentor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  role === r
                    ? 'bg-[#0B1324] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'mentee' ? 'Mentee Account' : 'Mentor Account'}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#0B1324]">Create Your Account</h2>
            <p className="text-xs text-slate-500 mt-1">Register your profile on the INUA platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="alert alert-error text-xs">
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                placeholder="Michelle Mutinda"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                  placeholder="you@strathmore.edu"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {role === 'mentee' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                    value={form.university}
                    onChange={(e) => set('university', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Stage</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm"
                      value={form.academic_level}
                      onChange={(e) => set('academic_level', e.target.value)}
                    >
                      {['Year1', 'Year2', 'Year3', 'Year4', 'Graduate', 'EarlyCareer'].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm"
                      value={form.field_of_study}
                      onChange={(e) => set('field_of_study', e.target.value)}
                    >
                      {FIELDS_OF_STUDY.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Career Interest</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm"
                    value={form.career_interest}
                    onChange={(e) => set('career_interest', e.target.value)}
                  >
                    {[
                      'Data Science', 'Software Engineering', 'Cybersecurity', 'Artificial Intelligence',
                      'Cloud Computing', 'UI/UX', 'Product Management', 'Finance', 'Entrepreneurship',
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm"
                      value={form.industry}
                      onChange={(e) => set('industry', e.target.value)}
                    >
                      {INDUSTRIES.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                      value={form.experience_years}
                      onChange={(e) => set('experience_years', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Expertise</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                    placeholder="e.g. Cloud Architecture & Distributed Systems"
                    value={form.expertise}
                    onChange={(e) => set('expertise', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-lg bg-[#0B1324] hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all cursor-pointer mt-2"
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D97706] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
