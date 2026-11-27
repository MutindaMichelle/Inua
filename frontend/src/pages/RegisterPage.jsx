/**
 * INUA Register Page — split-screen layout with Mentor Credential Proof submission.
 */
import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiError, initials, PRESET_AVATARS, saveStoredAvatar } from '../utils/helpers'
import InuaLogo from '../components/common/InuaLogo'

const FIELDS_OF_STUDY = [
  'Computer Science', 'Engineering', 'Business',
  'Data Analytics', 'Health Sciences', 'Education', 'Social Sciences', 'Other STEM',
]
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Consulting', 'Energy', 'Government', 'Non-Profit', 'Other',
]
const CREDENTIAL_TYPES = [
  'Professional Certification',
  'Academic Degree / Diploma',
  'Employer Verification Letter',
  'Consultancy / Firm Registration',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const [role, setRole] = useState('mentee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [showPresets, setShowPresets] = useState(false)
  const fileInputRef = useRef(null)

  function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('Photo file must be under 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(reader.result)
      toast('Profile photo selected! It will be saved with your account.', 'success')
    }
    reader.readAsDataURL(file)
  }

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
    credential_type: 'Professional Certification',
    credential_issuer: '',
    credential_reference: '',
    credential_document_url: '',
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
        payload.credential_type = form.credential_type
        payload.credential_issuer = form.credential_issuer
        payload.credential_reference = form.credential_reference
        payload.credential_document_url = form.credential_document_url || undefined
      }
      const { data } = await api.post('/auth/register', payload)
      if (avatarUrl) {
        saveStoredAvatar(form.email, avatarUrl, form.name)
      }
      if (data?.access_token && data?.user) {
        login(data.access_token, data.user)
      } else {
        const loginRes = await api.post('/auth/login', { email: form.email, password: form.password })
        login(loginRes.data.access_token, loginRes.data.user)
      }
      if (role === 'mentee') {
        toast(`Welcome to INUA, ${form.name.split(' ')[0]}!`, 'success')
        navigate('/mentors')
      } else {
        toast('Account created! Your credentials have been submitted for Admin verification.', 'info')
        navigate('/profile')
      }
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
          <div className="flex justify-center mb-6">
            <InuaLogo size={56} showText={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white mb-4">
            Your Professional Growth Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Join Kenya’s intelligent mentorship ecosystem. Set structured career milestones,
            connect with credential-verified industry mentors, and receive data-driven session guidance.
          </p>
        </div>

        <div className="text-[11px] text-slate-500 text-center">
          Strathmore University · School of Computing & Engineering Sciences
        </div>
      </div>

      {/* Right Half: White Registration Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg">
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
                {r === 'mentee' ? 'Mentee Account' : 'Mentor Account (Verified Experts)'}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#0B1324]">Create Your Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'mentee'
                ? 'Register your student or early-career mentee profile on INUA'
                : 'Apply as an industry or faculty mentor with verifiable proof of expertise'}
            </p>
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
                  placeholder={role === 'mentee' ? 'you@strathmore.edu' : 'you@company.co.ke'}
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

            {/* Profile Photo & Avatar Field */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Profile Photo (Optional)
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  {role === 'mentor' ? 'Verified Expert Headshot' : 'Student Scholar Portrait'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to select image file"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0B1324] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      {initials(form.name || 'U')}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                    📷
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPresets(!showPresets)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {showPresets ? 'Hide Presets' : 'Choose Preset'}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {avatarUrl ? '✓ Photo selected for your account' : 'Upload custom headshot or pick an executive preset'}
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              {showPresets && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 animate-fadeIn">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                    Click to select a professional portrait:
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(p.url)
                          setShowPresets(false)
                          toast('Preset portrait selected!', 'success')
                        }}
                        className={`rounded-lg overflow-hidden border transition-all p-0.5 ${
                          avatarUrl === p.url ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200 hover:border-amber-400'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-9 object-cover rounded" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Specialization</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm"
                    placeholder="e.g. Cloud Architecture & Distributed Systems"
                    value={form.expertise}
                    onChange={(e) => set('expertise', e.target.value)}
                    required
                  />
                </div>

                {/* Credential Verification Proof Box */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-amber-900">
                        🛡️ Proof of Expertise & Credential Verification
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        To protect mentorship quality, all mentors must submit proof of qualification
                        (degree certificate, employer verification letter, or consultancy registration)
                        for Administrator review before appearing in the mentee directory.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Credential Proof Category</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={form.credential_type}
                      onChange={(e) => set('credential_type', e.target.value)}
                      required
                    >
                      {CREDENTIAL_TYPES.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Issuing Body / Employer / Firm
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        placeholder="e.g. Safaricom PLC / AWS / BRS Kenya"
                        value={form.credential_issuer}
                        onChange={(e) => set('credential_issuer', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Certificate / Letter / Registration Ref #
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        placeholder="e.g. AWS-SAP-88392 or PVT-2022048"
                        value={form.credential_reference}
                        onChange={(e) => set('credential_reference', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Verification Link or Document URL (Credly / LinkedIn / Drive PDF)
                    </label>
                    <input
                      type="url"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="https://www.credly.com/badges/... or https://drive.google.com/..."
                      value={form.credential_document_url}
                      onChange={(e) => set('credential_document_url', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-lg bg-[#0B1324] hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all cursor-pointer mt-2"
            >
              {loading
                ? <span className="spinner" />
                : role === 'mentor'
                ? 'Submit Mentor Application & Credentials'
                : 'Create Account'}
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
