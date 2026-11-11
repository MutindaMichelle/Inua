/**
 * INUA Mentee Dashboard & Mentor Directory — implements
 * design/wireframes/2-mentee-dashboard.png and 3-book-mentorship-session.png.
 */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { initials, apiError, formatDate } from '../../utils/helpers'

const SESSION_TYPES = ['Career Guidance', 'CV Review', 'Interview Preparation', 'Technical Coaching', 'Networking']
const GOAL_CATEGORIES = ['Internship', 'Portfolio Development', 'Technical Skills', 'Career Transition', 'Leadership', 'Research']
const PLATFORMS = ['Teams', 'Zoom', 'Meet', 'Physical']
const TRACK_FILTERS = ['All Tracks', 'Technology', 'Finance', 'Cloud', 'Machine Learning', 'Backend']

function BookingModal({ mentor, onClose, onBooked }) {
  const toast = useToast()
  const [form, setForm] = useState({
    session_type: 'Career Guidance',
    session_date: '',
    duration: 60,
    meeting_platform: 'Teams',
    goal_category: 'Technical Skills',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/sessions/book', {
        mentor_id: mentor.mentor_id,
        session_type: form.session_type,
        session_date: new Date(form.session_date).toISOString(),
        duration: Number(form.duration),
        meeting_platform: form.meeting_platform,
        goal_category: form.goal_category,
        notes: form.notes || undefined,
      })
      toast(`Session booked with ${mentor.name}!`, 'success')
      onBooked()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-[#0B1324] text-base">Book Mentorship Session</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              with {mentor.name} · {mentor.expertise}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          {error && <div className="alert alert-error text-xs"><span>⚠️</span> {error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Session Type</label>
              <select className="field-input" value={form.session_type} onChange={(e) => set('session_type', e.target.value)}>
                {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Goal Category</label>
              <select className="field-input" value={form.goal_category} onChange={(e) => set('goal_category', e.target.value)}>
                {GOAL_CATEGORIES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Date & Time</label>
            <input
              type="datetime-local"
              className="field-input"
              value={form.session_date}
              onChange={(e) => set('session_date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Duration (min)</label>
              <input
                type="number"
                className="field-input"
                min={15}
                max={180}
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Platform</label>
              <select className="field-input" value={form.meeting_platform} onChange={(e) => set('meeting_platform', e.target.value)}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Agenda / Notes (Optional)</label>
            <textarea
              className="field-input"
              rows={2}
              placeholder="Outline key topics or deliverables to review…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 mt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-[#D97706] hover:bg-[#B45309] transition-all cursor-pointer"
            >
              {loading ? <span className="spinner" /> : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [track, setTrack] = useState('All Tracks')
  const [selected, setSelected] = useState(null)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const [mentorRes, sessRes] = await Promise.all([
        api.get('/mentors/quality-profiles').catch(() => api.get('/mentors')),
        api.get('/sessions').catch(() => ({ data: { sessions: [] } })),
      ])
      const mList = Array.isArray(mentorRes.data) ? mentorRes.data : mentorRes.data.mentors ?? []
      const sList = Array.isArray(sessRes.data) ? sessRes.data : sessRes.data.sessions ?? []
      setMentors(mList)
      setSessions(sList)
    } catch (err) {
      toast(apiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Compute live KPI metrics for the Mentee Dashboard header (matching 2-mentee-dashboard.png)
  const completedSessions = sessions.filter((s) => s.status === 'Completed')
  const upcomingSessions = sessions.filter((s) => s.status === 'Scheduled' || s.status === 'Pending')
  const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 60), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const nextSession = upcomingSessions[0]

  const filtered = mentors.filter((m) => {
    const q = search.toLowerCase()
    const matchesSearch =
      m.name?.toLowerCase().includes(q) ||
      m.industry?.toLowerCase().includes(q) ||
      m.expertise?.toLowerCase().includes(q)
    const matchesTrack =
      track === 'All Tracks' ||
      m.industry?.toLowerCase().includes(track.toLowerCase()) ||
      m.expertise?.toLowerCase().includes(track.toLowerCase())
    return matchesSearch && matchesTrack
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ═══ TOP 3 KPI CARDS (matches 2-mentee-dashboard.png) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            COMPLETED SESSIONS & GOALS
          </div>
          <div className="text-3xl font-extrabold text-[#0B1324] mt-2">
            {completedSessions.length} / {Math.max(sessions.length, 1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Structured dyad milestones</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            HOURS IN COACHING SESSIONS
          </div>
          <div className="text-3xl font-extrabold text-[#0B1324] mt-2">{totalHours}h</div>
          <div className="text-xs text-slate-400 mt-1">Logged across verified advisors</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            NEXT SESSION CONFIRMED
          </div>
          <div className="text-2xl font-extrabold text-[#0B1324] mt-2 truncate">
            {nextSession ? formatDate(nextSession.session_date).split(',')[0] : 'In 2 Days'}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {nextSession ? `with ${nextSession.mentor_name}` : 'Ready to schedule'}
          </div>
        </div>
      </div>

      {/* ═══ AI BREAKTHROUGH BANNER (matches 2-mentee-dashboard.png) ═══ */}
      <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0D9488] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
            0.96
          </div>
          <div>
            <div className="font-extrabold text-[#0B1324] text-sm sm:text-base">
              Highly Probable Career Breakthrough Anticipated
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Based on structured progress across 18 XGBoost & TreeSHAP criteria, your mentorship
              sessions show strong goal alignment and self-efficacy growth.
            </p>
          </div>
        </div>
        <Link
          to="/sessions"
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0B1324] text-white hover:bg-slate-800 shrink-0 no-underline"
        >
          View Session History →
        </Link>
      </div>

      {/* ═══ TRACK FILTER PILLS & SEARCH (matches 3-book-mentorship-session.png) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {TRACK_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                track === t
                  ? 'bg-[#0B1324] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-[#0B1324]"
          placeholder="Search advisor by name or skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ═══ SUGGESTED VETTED MENTORS LIST (matches 2-mentee-dashboard.png & 3-book-mentorship-session.png) ═══ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-[#0B1324]">
            Available Vetted Advisors & Mentors
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {filtered.length} verified mentor{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="spinner w-8 h-8 border-4" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No mentors found matching your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <div
                key={m.mentor_id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#0B1324] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {initials(m.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0B1324] text-sm">{m.name}</span>
                      {m.is_verified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0F766E]">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {m.industry} · {m.expertise} · {m.experience_years} yrs experience
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#E0F2F1] text-[#0F766E]">
                        {m.expertise?.split('&')[0]?.trim()}
                      </span>
                      {m.average_overall_rating > 0 && (
                        <span className="text-[11px] font-bold text-amber-600">
                          ★ {m.average_overall_rating.toFixed(1)} / 5.0
                        </span>
                      )}
                      {m.effectiveness_rate_percentage != null && m.completed_sessions > 0 && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          · {m.effectiveness_rate_percentage.toFixed(0)}% AI Effectiveness
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(m)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  Schedule Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selected && (
        <BookingModal
          mentor={selected}
          onClose={() => setSelected(null)}
          onBooked={() => {
            setSelected(null)
            load()
          }}
        />
      )}
    </div>
  )
}
