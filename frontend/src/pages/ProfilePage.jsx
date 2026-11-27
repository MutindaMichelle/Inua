/**
 * INUA Profile Management Page — Mentee & Mentor profile view, credential proof management, and status banner.
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 */
import React, { useEffect, useState, useRef } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  apiError,
  initials,
  getStoredAvatar,
  saveStoredAvatar,
  removeStoredAvatar,
  PRESET_AVATARS,
} from '../utils/helpers'

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
  'Finance',
  'Banking & Finance',
  'Consulting',
  'Academia',
  'Healthcare',
  'Education',
  'NGO',
  'Government',
  'Entrepreneurship',
]
const CREDENTIAL_TYPES = [
  'Professional Certification',
  'Academic Degree / Diploma',
  'Employer Verification Letter',
  'Consultancy / Firm Registration',
]

export default function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [showPresets, setShowPresets] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    university: 'Strathmore University',
    career_stage: 'Year4',
    career_interest: 'Software Engineering',
    industry: 'Technology',
    expertise: 'Backend Engineering',
    experience_years: 6,
    credential_type: 'Professional Certification',
    credential_issuer: '',
    credential_reference: '',
    credential_document_url: '',
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
          credential_type: p.credential_type || 'Professional Certification',
          credential_issuer: p.credential_issuer || '',
          credential_reference: p.credential_reference || '',
          credential_document_url: p.credential_document_url || '',
        })
        const initialPic = getStoredAvatar(data.email || user?.email, data.name || user?.name)
        setAvatarUrl(initialPic)
      } catch (err) {
        setError(apiError(err))
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('Photo file must be under 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setAvatarUrl(dataUrl)
      const email = profileData?.email || user?.email
      const name = form.name || user?.name
      saveStoredAvatar(email, dataUrl, name)
      if (user?.role === 'mentor' && profileData?.profile?.mentor_id) {
        saveStoredAvatar(profileData.profile.mentor_id, dataUrl, name)
      }
      toast('Profile photo updated successfully!', 'success')
    }
    reader.readAsDataURL(file)
  }

  function handleSelectPreset(presetUrl) {
    setAvatarUrl(presetUrl)
    const email = profileData?.email || user?.email
    const name = form.name || user?.name
    saveStoredAvatar(email, presetUrl, name)
    if (user?.role === 'mentor' && profileData?.profile?.mentor_id) {
      saveStoredAvatar(profileData.profile.mentor_id, presetUrl, name)
    }
    setShowPresets(false)
    toast('Profile photo updated with verified portrait!', 'success')
  }

  function handleRemovePhoto() {
    setAvatarUrl(null)
    const email = profileData?.email || user?.email
    const name = form.name || user?.name
    removeStoredAvatar(email, name)
    if (user?.role === 'mentor' && profileData?.profile?.mentor_id) {
      removeStoredAvatar(profileData.profile.mentor_id, name)
    }
    toast('Profile photo removed (showing initials)', 'info')
  }

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
        payload.credential_type = form.credential_type
        payload.credential_issuer = form.credential_issuer
        payload.credential_reference = form.credential_reference
        payload.credential_document_url = form.credential_document_url
      }
      const { data } = await api.put('/auth/profile', payload)
      setProfileData(data)
      toast('Profile & credential details updated!', 'success')
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
  const mentorProfile = profileData?.profile || {}
  const verificationStatus =
    mentorProfile.verification_status || (mentorProfile.is_verified ? 'Verified' : 'Pending')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">👤 Profile & Pre-Session Attributes</h1>
        <p className="section-sub">
          Manage your institutional identity, domain specialization, and professional credentials.
        </p>
      </div>

      {/* Mentor Verification Status Banner */}
      {role === 'mentor' && (
        <div
          className={`card p-5 mb-6 border-l-4 ${
            verificationStatus === 'Verified'
              ? 'border-l-emerald-600 bg-emerald-50/60'
              : verificationStatus === 'Rejected'
              ? 'border-l-red-600 bg-red-50/60'
              : 'border-l-amber-500 bg-amber-50/70'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                {verificationStatus === 'Verified' && (
                  <span className="text-emerald-700">✓ Verified Industry / Faculty Mentor</span>
                )}
                {verificationStatus === 'Pending' && (
                  <span className="text-amber-800">⏳ Pending Administrator Credential Verification</span>
                )}
                {verificationStatus === 'Rejected' && (
                  <span className="text-red-700">⚠️ Credential Verification Rejected — Action Required</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {verificationStatus === 'Verified'
                  ? 'Your academic or professional credentials have been verified. Your profile is active and bookable by mentees.'
                  : verificationStatus === 'Rejected'
                  ? 'Your submitted credential proof could not be verified. Please update your certificate, employer letter, or consultancy registration details below to request re-evaluation.'
                  : 'Your mentor profile is currently under review by the Platform Administrator. Once your submitted degree, certification, employer letter, or firm registration is verified, mentees will be able to book sessions with you.'}
              </p>
              {mentorProfile.verification_notes && (
                <div className="mt-2.5 text-xs bg-white/80 rounded-lg px-3 py-2 border border-slate-200 text-slate-700">
                  <span className="font-bold">Admin Review Note:</span> {mentorProfile.verification_notes}
                </div>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap ${
                verificationStatus === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : verificationStatus === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              {verificationStatus}
            </span>
          </div>
        </div>
      )}

      {/* Profile Header & Photo Management Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar display with click-to-upload */}
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={form.name || 'User'}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload custom photo"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl bg-[#0B1324] text-white flex items-center justify-center font-extrabold text-xl shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload custom photo"
                >
                  {initials(form.name || user?.name)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-[11px] shadow-sm transition-transform group-hover:scale-110"
                title="Upload photo"
              >
                📷
              </button>
            </div>

            <div>
              <div className="text-lg font-extrabold text-slate-900">{form.name || user?.name}</div>
              <div className="text-xs text-slate-500">{profileData?.email || user?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
                  {role}
                </span>
                <span className="text-[11px] text-slate-400">
                  {avatarUrl ? '✓ Photo Verified' : 'Standard Avatar'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <span>📷</span>
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="py-1.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>🎭</span>
              <span>{showPresets ? 'Hide Presets' : 'Choose Preset'}</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="py-1.5 px-2.5 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                title="Remove custom photo"
              >
                ✕ Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Presets Drawer */}
        {showPresets && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Verified Executive & Scholar Portraits (Click to Apply):</span>
              <span className="text-[10px] text-slate-400 font-normal">HD Unsplash Curated</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {PRESET_AVATARS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                    avatarUrl === p.url
                      ? 'border-amber-500 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} className="w-full h-12 object-cover rounded-lg" />
                  <div className="text-[9px] text-slate-600 text-center truncate mt-0.5 font-medium px-0.5">
                    {p.label.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
          <>
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

            <div className="border-t border-slate-100 pt-4 mt-1">
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                🛡️ Professional Credential Proof (Admin Verification Dossier)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Provide your degree, certification, employer confirmation letter, or consultancy firm registration details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="field-label">Credential Proof Category</label>
                  <select
                    className="field-input"
                    value={form.credential_type}
                    onChange={(e) => setField('credential_type', e.target.value)}
                  >
                    {CREDENTIAL_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Issuing Institution / Employer / Firm</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Safaricom PLC / AWS / BRS Kenya"
                    value={form.credential_issuer}
                    onChange={(e) => setField('credential_issuer', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Certificate / Letter / Registration Ref #</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. AWS-SAP-2024-88392"
                    value={form.credential_reference}
                    onChange={(e) => setField('credential_reference', e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Verification URL / Document Link</label>
                  <input
                    type="url"
                    className="field-input"
                    placeholder="https://www.credly.com/badges/..."
                    value={form.credential_document_url}
                    onChange={(e) => setField('credential_document_url', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving Profile…' : 'Save Profile & Credentials'}
          </button>
        </div>
      </form>
    </div>
  )
}
