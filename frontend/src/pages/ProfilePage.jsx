/**
 * INUA Profile Management Page — Mentee & Mentor profile view and edit screen.
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 */
import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiError, initials } from '../utils/helpers'

const CAREER_STAGES = ['Year1', 'Year2', 'Year3', 'Year4', 'Graduate', 'EarlyCareer']
const CAREER_INTERESTS = [
  'Software Engineering',
  'Data Science',
  'Cybersecurity',
  'Artificial Intelligence',
  'Cloud Computing',
  'UI/UX',
  'Product Management',
  'Finance',
  'Entrepreneurship',
]
const INDUSTRIES = [
  'Technology',
  'Banking & Finance',
  'Academia',
  'Healthcare',
  'NGO',
  'Government',
  'Entrepreneurship',
]

export default function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    university: 'Strathmore University',
    career_stage: 'Year4',
    career_interest: 'Software Engineering',
    industry: 'Technology',
    expertise: 'Backend Engineering',
    experience_years: 6,
  })

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const { data } = await api.get('/auth/profile')
        setProfileData(data)
        const p = data.profile || {}
        setForm({
          name: data.name || '',
          university: p.university || 'Strathmore University',
          career_stage: p.career_stage || 'Year4',
          career_interest: p.career_interest || 'Software Engineering',
          industry: p.industry || 'Technology',
          expertise: p.expertise || 'Backend Engineering',
          experience_years: p.experience_years ?? 6,
        })
      } catch (err) {
        setError(apiError(err))
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { name: form.name }
      if (user?.role === 'mentee') {
        payload.university = form.university
        payload.career_stage = form.career_stage
        payload.career_interest = form.career_interest
      } else if (user?.role === 'mentor') {
        payload.industry = form.industry
        payload.expertise = form.expertise
        payload.experience_years = Number(form.experience_years)
      }
      const { data } = await api.put('/auth/profile', payload)
      setProfileData(data)
      toast('Profile updated successfully!', 'success')
    } catch (err) {
      setError(apiError(err))
      toast(apiError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card p-10 text-center text-slate-500">Loading profile details…</div>
  }

  const role = profileData?.role || user?.role

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">👤 Profile & Pre-Session Attributes</h1>
        <p className="section-sub">
          Manage your institutional identity and domain attributes used by the U-CS 5 pre-session effectiveness model.
        </p>
      </div>

      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0B1324] text-white flex items-center justify-center font-extrabold text-lg">
          {initials(form.name || user?.name)}
        </div>
        <div>
          <div className="text-lg font-extrabold text-slate-900">{form.name || user?.name}</div>
          <div className="text-xs text-slate-500">{profileData?.email || user?.email}</div>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
            {role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 flex flex-col gap-5">
        {error && <div className="alert alert-error">{error}</div>}

        <div>
          <label className="field-label">Full Name</label>
          <input
            type="text"
            className="field-input"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            required
          />
        </div>

        {role === 'mentee' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Institution / University</label>
              <input
                type="text"
                className="field-input"
                value={form.university}
                onChange={(e) => setField('university', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Career Stage</label>
              <select
                className="field-input"
                value={form.career_stage}
                onChange={(e) => setField('career_stage', e.target.value)}
              >
                {CAREER_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Target Career Interest</label>
              <select
                className="field-input"
                value={form.career_interest}
                onChange={(e) => setField('career_interest', e.target.value)}
              >
                {CAREER_INTERESTS.map((ci) => (
                  <option key={ci} value={ci}>
                    {ci}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === 'mentor' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Industry Sector</label>
              <select
                className="field-input"
                value={form.industry}
                onChange={(e) => setField('industry', e.target.value)}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Domain Specialization</label>
              <input
                type="text"
                className="field-input"
                value={form.expertise}
                onChange={(e) => setField('expertise', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Industry Tenure (Years)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                className="field-input"
                value={form.experience_years}
                onChange={(e) => setField('experience_years', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving Profile…' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
