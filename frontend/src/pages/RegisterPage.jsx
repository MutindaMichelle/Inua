/**
 * INUA Register Page — creates a new mentee or mentor account.
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
  const toast     = useToast()

  const [role,    setRole]    = useState('mentee')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    name: '', email: '', password: '',
    // mentee-specific
    university: 'Strathmore University',
    academic_level: 'Year4',
    career_interest: 'Software Engineering',
    field_of_study: 'Computer Science',
    // mentor-specific
    industry: 'Technology',
    expertise: '',
    experience_years: 5,
    bio: '',
  })

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role }
      if (role === 'mentee') {
        payload.university      = form.university
        payload.career_stage    = form.academic_level
        payload.career_interest = form.career_interest
      } else {
        payload.industry         = form.industry
        payload.expertise        = form.expertise
        payload.experience_years = Number(form.experience_years)
      }
      const { data } = await api.post('/auth/register', payload)
      // Use token returned from registration (or fallback to login)
      if (data?.access_token && data?.user) {
        login(data.access_token, data.user)
      } else {
        const loginRes = await api.post('/auth/login', { email: form.email, password: form.password })
        login(loginRes.data.access_token, loginRes.data.user)
      }
      toast(`Welcome to INUA, ${form.name.split(' ')[0]}! 🌱`, 'success')
      if (role === 'mentee') navigate('/mentors')
      else                   navigate('/mentor/sessions')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#40855d,#2f6847)' }}
          >
            <span className="text-white font-bold text-xl">IN</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate2-900">Create your INUA account</h1>
          <p className="text-sm text-slate2-500 mt-1">Join Kenya's mentorship network</p>
        </div>

        {/* Role toggle */}
        <div className="card p-1.5 flex gap-1 mb-5">
          {['mentee', 'mentor'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setError('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                role === r
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-slate2-600 hover:bg-sage-50'
              }`}
            >
              {r === 'mentee' ? '🎓 Student / Mentee' : '💼 Industry Mentor'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="Michelle Mutinda" value={form.name}
              onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field-input" placeholder="Min. 8 characters"
              value={form.password} onChange={(e) => set('password', e.target.value)}
              minLength={8} required />
          </div>

          <div className="divider" />

          {/* Mentee-specific */}
          {role === 'mentee' && (
            <>
              <div>
                <label className="field-label">University</label>
                <input className="field-input" value={form.university}
                  onChange={(e) => set('university', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Academic Level</label>
                  <select className="field-input" value={form.academic_level}
                    onChange={(e) => set('academic_level', e.target.value)}>
                    {['Year1','Year2','Year3','Year4','Graduate','EarlyCareer'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Field of Study</label>
                  <select className="field-input" value={form.field_of_study}
                    onChange={(e) => set('field_of_study', e.target.value)}>
                    {FIELDS_OF_STUDY.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Career Interest</label>
                <select className="field-input" value={form.career_interest}
                  onChange={(e) => set('career_interest', e.target.value)}>
                  {['Data Science','Software Engineering','Cybersecurity','Artificial Intelligence',
                    'Cloud Computing','UI/UX','Product Management','Finance','Entrepreneurship'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Mentor-specific */}
          {role === 'mentor' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Industry</label>
                  <select className="field-input" value={form.industry}
                    onChange={(e) => set('industry', e.target.value)}>
                    {INDUSTRIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Years of Experience</label>
                  <input type="number" className="field-input" min={1} max={40}
                    value={form.experience_years}
                    onChange={(e) => set('experience_years', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="field-label">Expertise / Specialisation</label>
                <input className="field-input" placeholder="e.g. Backend Engineering, Data Science"
                  value={form.expertise} onChange={(e) => set('expertise', e.target.value)} required />
              </div>
              <div>
                <label className="field-label">Short Bio (optional)</label>
                <textarea className="field-input" rows={2} placeholder="Tell mentees about yourself…"
                  value={form.bio} onChange={(e) => set('bio', e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate2-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
