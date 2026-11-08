/**
 * INUA Mentors Page — mentee view: browse verified mentors & book a session.
 */
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { avatarColor, initials, apiError } from '../../utils/helpers'

const SESSION_TYPES  = ['Career Guidance','CV Review','Interview Preparation','Technical Coaching','Networking']
const GOAL_CATEGORIES = ['Internship','Portfolio Development','Technical Skills','Career Transition','Leadership','Research']
const PLATFORMS      = ['Teams','Zoom','Meet','Physical']

function StarBar({ value }) {
  return (
    <span className="text-amber-400 text-xs">
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
      <span className="text-slate2-400 ml-1 font-medium">{value.toFixed(1)}</span>
    </span>
  )
}

function BookingModal({ mentor, onClose, onBooked }) {
  const toast = useToast()
  const [form, setForm] = useState({
    session_type: 'Career Guidance',
    session_date: '',
    duration: 60,
    meeting_platform: 'Teams',
    goal_category: 'Internship',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); setError('') }

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/sessions/book', {
        mentor_id:        mentor.mentor_id,
        session_type:     form.session_type,
        session_date:     new Date(form.session_date).toISOString(),
        duration:         Number(form.duration),
        meeting_platform: form.meeting_platform,
        goal_category:    form.goal_category,
        notes:            form.notes || undefined,
      })
      toast(`Session booked with ${mentor.name}! 📅`, 'success')
      onBooked()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100">
          <div>
            <h2 className="font-bold text-slate2-900">Book a Session</h2>
            <p className="text-xs text-slate2-500 mt-0.5">with {mentor.name}</p>
          </div>
          <button onClick={onClose} className="btn-ghost py-1.5 px-3 text-slate2-400">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Session Type</label>
              <select className="field-input" value={form.session_type}
                onChange={(e) => set('session_type', e.target.value)}>
                {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Goal Category</label>
              <select className="field-input" value={form.goal_category}
                onChange={(e) => set('goal_category', e.target.value)}>
                {GOAL_CATEGORIES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Date & Time</label>
            <input type="datetime-local" className="field-input" value={form.session_date}
              onChange={(e) => set('session_date', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Duration (min)</label>
              <input type="number" className="field-input" min={15} max={180}
                value={form.duration} onChange={(e) => set('duration', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Platform</label>
              <select className="field-input" value={form.meeting_platform}
                onChange={(e) => set('meeting_platform', e.target.value)}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Notes (optional)</label>
            <textarea className="field-input" rows={2} placeholder="What do you want to discuss?"
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MentorsPage() {
  const [mentors,  setMentors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)   // mentor to book
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/mentors/quality-profiles')
      setMentors(Array.isArray(data) ? data : data.mentors ?? [])
    } catch {
      try {
        const { data } = await api.get('/mentors')
        setMentors(Array.isArray(data) ? data : data.mentors ?? [])
      } catch (err) {
        toast(apiError(err), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = mentors.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.name?.toLowerCase().includes(q) ||
      m.industry?.toLowerCase().includes(q) ||
      m.expertise?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Find a Mentor</h1>
          <p className="section-sub">Browse industry-verified mentors and book a session</p>
        </div>
        <input
          className="field-input max-w-xs"
          placeholder="Search by name, industry…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <span className="spinner w-8 h-8 border-4" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate2-400">
          No mentors found{search ? ` for "${search}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div key={m.mentor_id} className="mentor-card flex flex-col gap-3">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ background: avatarColor(m.name) }}>
                  {initials(m.name)}
                </div>
                <div>
                  <div className="font-bold text-slate2-900 text-sm">{m.name}</div>
                  <div className="text-xs text-slate2-500">{m.industry}</div>
                </div>
                {m.is_verified && (
                  <span className="ml-auto text-sage-600 text-lg" title="Verified">✓</span>
                )}
              </div>

              {/* Expertise & exp */}
              <div>
                <span className="inline-block bg-sage-50 text-sage-700 text-xs font-semibold
                                  px-2.5 py-0.5 rounded-full mb-1">
                  {m.expertise}
                </span>
                <p className="text-xs text-slate2-500">
                  {m.experience_years} yrs experience
                  {m.availability && ` · ${m.availability} availability`}
                </p>
              </div>

              {/* Rating */}
              {m.average_overall_rating > 0 && (
                <StarBar value={m.average_overall_rating} />
              )}

              <button
                className="btn-primary w-full mt-auto"
                onClick={() => setSelected(m)}
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <BookingModal
          mentor={selected}
          onClose={() => setSelected(null)}
          onBooked={() => { setSelected(null); load() }}
        />
      )}
    </div>
  )
}
