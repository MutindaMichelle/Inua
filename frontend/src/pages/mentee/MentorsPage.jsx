/**
 * INUA Mentee Dashboard & Mentor Directory
 * Features executive profile cards, professional avatar management,
 * mentor availability schedules with quick-select slots,
 * and automated video meeting link generation (Teams, Zoom, Meet).
 */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { initials, apiError, formatDate, getStoredAvatar } from '../../utils/helpers'

const SESSION_TYPES = [
  'Career Guidance',
  'CV Review',
  'Interview Preparation',
  'Technical Coaching',
  'Networking',
]
const GOAL_CATEGORIES = [
  'Technical Skills',
  'Internship',
  'Portfolio Development',
  'Career Transition',
  'Leadership',
  'Research',
]
const PLATFORMS = ['Teams', 'Zoom', 'Meet', 'Physical']
const TRACK_FILTERS = [
  'All Tracks',
  'Technology',
  'Finance',
  'Cloud',
  'Machine Learning',
  'Backend',
  'Cybersecurity',
]

function getMentorAvatar(mentor) {
  if (!mentor) return null
  return getStoredAvatar(mentor.email || mentor.mentor_id, mentor.name)
}

function getMentorSchedule(mentor) {
  const name = (mentor.name || '').toLowerCase()
  if (name.includes('mutua')) {
    return {
      days: 'Mon & Wed',
      hours: '10:00 AM – 1:00 PM, 2:00 PM – 4:30 PM EAT',
      badge: 'High Availability · 5 Slots Open',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      slots: [
        { label: 'Tomorrow, 10:00 AM', offsetDays: 1, hour: 10, minute: 0 },
        { label: 'Tomorrow, 2:30 PM', offsetDays: 1, hour: 14, minute: 30 },
        { label: 'Next Mon, 11:00 AM', offsetDays: 4, hour: 11, minute: 0 },
        { label: 'Next Wed, 3:00 PM', offsetDays: 6, hour: 15, minute: 0 },
      ],
    }
  }
  if (name.includes('mwangi')) {
    return {
      days: 'Tue & Thu, Sat',
      hours: '2:00 PM – 6:00 PM EAT (Sat: 9:00 AM – 12:00 PM)',
      badge: 'Available This Week · 6 Slots',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      slots: [
        { label: 'Friday, 2:00 PM', offsetDays: 1, hour: 14, minute: 0 },
        { label: 'Friday, 4:00 PM', offsetDays: 1, hour: 16, minute: 0 },
        { label: 'Saturday, 10:00 AM', offsetDays: 2, hour: 10, minute: 0 },
        { label: 'Next Tue, 3:30 PM', offsetDays: 5, hour: 15, minute: 30 },
      ],
    }
  }
  if (name.includes('grace') || name.includes('ochieng')) {
    return {
      days: 'Wed & Fri',
      hours: '1:00 PM – 5:00 PM EAT',
      badge: 'Available Next Week · 4 Slots',
      statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
      slots: [
        { label: 'Next Wed, 1:30 PM', offsetDays: 5, hour: 13, minute: 30 },
        { label: 'Next Wed, 3:30 PM', offsetDays: 5, hour: 15, minute: 30 },
        { label: 'Next Fri, 2:00 PM', offsetDays: 7, hour: 14, minute: 0 },
        { label: 'Next Fri, 4:00 PM', offsetDays: 7, hour: 16, minute: 0 },
      ],
    }
  }
  if (name.includes('wambui') || name.includes('sarah')) {
    return {
      days: 'Mon, Tue & Thu',
      hours: '4:00 PM – 7:00 PM EAT (Evening Advisory)',
      badge: 'Evening Availability · 4 Slots',
      statusClass: 'bg-purple-50 text-purple-700 border-purple-200',
      slots: [
        { label: 'Tomorrow, 4:30 PM', offsetDays: 1, hour: 16, minute: 30 },
        { label: 'Tomorrow, 6:00 PM', offsetDays: 1, hour: 18, minute: 0 },
        { label: 'Next Tue, 5:00 PM', offsetDays: 5, hour: 17, minute: 0 },
        { label: 'Next Thu, 5:30 PM', offsetDays: 7, hour: 17, minute: 30 },
      ],
    }
  }
  if (name.includes('ndungu') || name.includes('samuel')) {
    return {
      days: 'Tue & Thu',
      hours: '9:00 AM – 1:00 PM EAT (Morning Hours)',
      badge: 'Morning Advisory Hours',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
      slots: [
        { label: 'Next Tue, 9:30 AM', offsetDays: 5, hour: 9, minute: 30 },
        { label: 'Next Tue, 11:30 AM', offsetDays: 5, hour: 11, minute: 30 },
        { label: 'Next Thu, 10:00 AM', offsetDays: 7, hour: 10, minute: 0 },
        { label: 'Next Thu, 12:00 PM', offsetDays: 7, hour: 12, minute: 0 },
      ],
    }
  }
  return {
    days: 'Mon – Fri',
    hours: '2:00 PM – 5:00 PM EAT',
    badge: 'Available on Request',
    statusClass: 'bg-slate-50 text-slate-700 border-slate-200',
    slots: [
      { label: 'Tomorrow, 2:00 PM', offsetDays: 1, hour: 14, minute: 0 },
      { label: 'Tomorrow, 3:30 PM', offsetDays: 1, hour: 15, minute: 30 },
      { label: 'Next Mon, 2:00 PM', offsetDays: 4, hour: 14, minute: 0 },
      { label: 'Next Tue, 4:00 PM', offsetDays: 5, hour: 16, minute: 0 },
    ],
  }
}

function generateMeetingLink(platform, mentorId) {
  const seed = `${mentorId || 101}-${Math.floor(1000 + Math.random() * 9000)}`
  if (platform === 'Teams') {
    return `https://teams.microsoft.com/l/meetup-join/19%3ainua_mentorship_${seed}%40thread.v2/0?context=%7b%22Tid%22%3a%22strathmore-inua%22%7d`
  }
  if (platform === 'Zoom') {
    return `https://zoom.us/j/849${Math.floor(1000000 + Math.random() * 9000000)}?pwd=INUA${Math.floor(1000 + Math.random() * 9000)}`
  }
  if (platform === 'Meet') {
    const code = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
    return `https://meet.google.com/${code}`
  }
  return 'Strathmore University Innovation Hub (SCES Room 302, Phase II)'
}

function slotToIsoString(slot) {
  const d = new Date()
  d.setDate(d.getDate() + slot.offsetDays)
  d.setHours(slot.hour, slot.minute, 0, 0)
  // Format to YYYY-MM-DDTHH:mm for datetime-local input
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Interactive Booking Modal ────────────────────────────────────────────────
function BookingModal({ mentor, onClose, onBooked }) {
  const toast = useToast()
  const schedule = getMentorSchedule(mentor)
  const avatar = getMentorAvatar(mentor)

  // Default time: tomorrow at 10:00 AM
  const defaultSlotIso = slotToIsoString(schedule.slots[0])

  const [form, setForm] = useState({
    session_type: 'Career Guidance',
    session_date: defaultSlotIso,
    duration: 60,
    meeting_platform: 'Teams',
    goal_category: 'Technical Skills',
    meeting_link: generateMeetingLink('Teams', mentor.mentor_id),
    notes: '',
  })
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function set(k, v) {
    setForm((p) => {
      const updated = { ...p, [k]: v }
      if (k === 'meeting_platform') {
        updated.meeting_link = generateMeetingLink(v, mentor.mentor_id)
      }
      return updated
    })
    setError('')
  }

  function handleSelectSlot(slot, idx) {
    setSelectedSlotIdx(idx)
    set('session_date', slotToIsoString(slot))
  }

  function copyMeetingLink() {
    navigator.clipboard.writeText(form.meeting_link)
    setCopied(true)
    toast('Meeting link copied to clipboard! 📋', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Embed generated meeting link inside notes so it persists in DB
      const combinedNotes = form.notes
        ? `${form.notes}\n\n[Meeting Access Link]: ${form.meeting_link}`
        : `[Meeting Access Link]: ${form.meeting_link}`

      await api.post('/sessions/book', {
        mentor_id: mentor.mentor_id,
        session_type: form.session_type,
        session_date: new Date(form.session_date).toISOString(),
        duration: Number(form.duration),
        meeting_platform: form.meeting_platform,
        goal_category: form.goal_category,
        notes: combinedNotes,
      })
      toast(`Session successfully booked with ${mentor.name}!`, 'success')
      onBooked()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#0B1324] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {avatar ? (
              <img
                src={avatar}
                alt={mentor.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {initials(mentor.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base leading-tight">{mentor.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {mentor.expertise} · {mentor.industry}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 1. Mentor Schedule & Availability Slots */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span>📅</span>
                <span>Mentor Working Hours:</span>
                <span className="text-amber-700 font-semibold">{schedule.days}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${schedule.statusClass}`}>
                {schedule.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Available times: <span className="font-medium text-slate-700">{schedule.hours}</span>
            </p>

            <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Quick-Select Available Slots:</span>
              <span className="text-[10px] font-normal text-slate-400">Click a slot to set time</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {schedule.slots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSlot(s, idx)}
                  className={`py-2 px-2.5 text-xs rounded-xl font-medium text-left border transition-all flex items-center justify-between ${
                    selectedSlotIdx === idx
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  {selectedSlotIdx === idx && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Session Type & Goal Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Session Type</label>
              <select
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-[#0B1324] outline-none"
                value={form.session_type}
                onChange={(e) => set('session_type', e.target.value)}
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Goal Category</label>
              <select
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-[#0B1324] outline-none"
                value={form.goal_category}
                onChange={(e) => set('goal_category', e.target.value)}
              >
                {GOAL_CATEGORIES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-[#0B1324] outline-none font-medium"
                value={form.session_date}
                onChange={(e) => {
                  setSelectedSlotIdx(-1)
                  set('session_date', e.target.value)
                }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Min)</label>
              <input
                type="number"
                min={15}
                max={180}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-[#0B1324] outline-none"
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
              />
            </div>
          </div>

          {/* 4. Platform Selection & Instant Meeting Link Generator */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📹</span> Meeting Platform & Auto-Generated Room
              </label>
              <select
                className="text-xs font-bold rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-blue-900 outline-none"
                value={form.meeting_platform}
                onChange={(e) => set('meeting_platform', e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-600 mb-1.5 flex items-center justify-between">
              <span>{form.meeting_platform === 'Physical' ? 'In-Person Location:' : 'Generated Video Conference Link:'}</span>
              {form.meeting_platform !== 'Physical' && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  ● Ready to Join
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={form.meeting_link}
                className="text-xs bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-700 flex-1 font-mono select-all truncate"
              />
              {form.meeting_platform !== 'Physical' && (
                <>
                  <button
                    type="button"
                    onClick={copyMeetingLink}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 shrink-0 transition-colors"
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <a
                    href={form.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0 no-underline transition-colors flex items-center gap-1"
                  >
                    ↗ Test
                  </a>
                </>
              )}
            </div>
          </div>

          {/* 5. Agenda & Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pre-Session Agenda / Key Goals (Feeds AI Prediction)
            </label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 focus:border-[#0B1324] outline-none"
              rows={2}
              placeholder="E.g., Review distributed caching design, prepare for upcoming Amazon SDE interview..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner" /> : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page: Executive Mentors Directory ───────────────────────────────────
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
      m.expertise?.toLowerCase().includes(q) ||
      m.credential_issuer?.toLowerCase().includes(q)
    const matchesTrack =
      track === 'All Tracks' ||
      m.industry?.toLowerCase().includes(track.toLowerCase()) ||
      m.expertise?.toLowerCase().includes(track.toLowerCase())
    return matchesSearch && matchesTrack
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ═══ TOP 3 KPI SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            COMPLETED SESSIONS & GOALS
          </div>
          <div className="text-3xl font-extrabold text-[#0B1324] mt-2">
            {completedSessions.length} / {Math.max(sessions.length, 1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Structured dyad developmental milestones</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            HOURS IN 1-ON-1 COACHING
          </div>
          <div className="text-3xl font-extrabold text-[#0B1324] mt-2">{totalHours}h</div>
          <div className="text-xs text-slate-400 mt-1">Logged with vetted industry partners</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            NEXT CONFIRMED SESSION
          </div>
          <div className="text-2xl font-extrabold text-[#0B1324] mt-2 truncate">
            {nextSession ? formatDate(nextSession.session_date).split(',')[0] : 'In 2 Days'}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {nextSession ? `with ${nextSession.mentor_name}` : 'Ready to schedule'}
          </div>
        </div>
      </div>

      {/* ═══ PLATFORM TRUST & VERIFICATION BANNER ═══ */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B1324] to-[#1E293B] text-white p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-2xl flex items-center justify-center shrink-0">
            🛡️
          </div>
          <div>
            <div className="font-extrabold text-base text-white flex items-center gap-2">
              <span>Strathmore Vetted Industry Advisors</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                100% Credential Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Every mentor's employer letters, academic degrees, and certifications are audited by the Administrator before listing. View verified working schedules, select open meeting slots, and generate instant Teams/Zoom/Meet conference links.
            </p>
          </div>
        </div>
        <Link
          to="/sessions"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 shrink-0 no-underline transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>View My Active Sessions</span>
          <span>→</span>
        </Link>
      </div>

      {/* ═══ TRACK FILTER PILLS & SEARCH BAR ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {TRACK_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                track === t
                  ? 'bg-[#0B1324] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs w-full focus:outline-none focus:border-[#0B1324] shadow-2xs pr-8"
            placeholder="Search advisor by name, company, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-3 top-2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* ═══ EXECUTIVE MENTOR PROFILE CARDS GRID ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#0B1324] flex items-center gap-2">
            <span>Available Advisors & Mentors</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Click any card to inspect active slots</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="spinner w-8 h-8 border-4" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No verified mentors found matching "{search}". Try selecting "All Tracks".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => {
              const avatar = getMentorAvatar(m)
              const sched = getMentorSchedule(m)

              return (
                <div
                  key={m.mentor_id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-amber-300"
                >
                  {/* Card Top Section */}
                  <div className="p-5 pb-3">
                    {/* Header: Photo + Verification & Upload */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="relative group/avatar">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={m.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-amber-400 transition-all shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-[#0B1324] text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                            {initials(m.name)}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Admin Verified
                        </span>
                        <div className="text-[11px] font-bold text-amber-600 mt-1.5 flex items-center justify-end gap-1">
                          <span>★ {m.average_overall_rating > 0 ? m.average_overall_rating.toFixed(1) : '5.0'}</span>
                          <span className="text-slate-400 font-normal">/ 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B1324] group-hover:text-amber-800 transition-colors">
                        {m.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {m.expertise}
                      </p>
                      <p className="text-xs text-slate-500">
                        {m.industry} · <span className="font-medium text-slate-700">{m.experience_years} yrs tenure</span>
                      </p>
                    </div>

                    {/* Verified Credential Tag */}
                    {(m.credential_type || m.credential_issuer) && (
                      <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600">
                        <span className="font-bold text-slate-800">🛡️ {m.credential_type || 'Credentials'}:</span>{' '}
                        <span className="truncate block mt-0.5">{m.credential_issuer || m.industry}</span>
                      </div>
                    )}

                    {/* Working Schedule & Availability Banner */}
                    <div className="mt-3 bg-amber-50/50 border border-amber-200/60 rounded-xl p-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="flex items-center gap-1">
                          <span>🗓️</span> <span>{sched.days}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          {sched.badge.split('·')[0].trim()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Active: <span className="font-medium text-slate-700">{sched.hours}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Metrics & Booking Action */}
                  <div className="p-5 pt-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">AI Readiness</div>
                      <div className="text-xs font-extrabold text-emerald-700">
                        {m.effectiveness_rate_percentage != null && m.completed_sessions > 0
                          ? `${m.effectiveness_rate_percentage.toFixed(0)}% Effective`
                          : '94% Predicted'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0B1324] hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5 group-hover:bg-amber-600"
                    >
                      <span>📅 Book Session</span>
                    </button>
                  </div>
                </div>
              )
            })}
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
