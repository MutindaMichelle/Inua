/**
 * INUA Mentee Sessions Page
 * Features:
 *  1. Interactive Weekly Visual Calendar with 1-click meeting join links (Teams, Zoom, Meet)
 *  2. Proactive Session Reminders (Urgent reminder banner, countdown, and 15-min notification alerts)
 *  3. External Calendar Sync (1-click Add to Google Calendar & Apple/Outlook .ics export with VALARM reminders)
 *  4. Tabbed Toggle between Visual Calendar View and Detailed Roster View
 *  5. Post-session feedback modal & AI session diagnosis (TreeSHAP) viewer
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import {
  formatDate,
  statusClass,
  statusEmoji,
  apiError,
  initials,
  avatarColor,
  getStoredAvatar,
} from '../../utils/helpers'

// ── Feedback modal ───────────────────────────────────────────────────────────
function FeedbackModal({ session, existing, onClose, onDone }) {
  const toast = useToast()
  const readOnly = !!existing
  const [form, setForm] = useState(
    existing
      ? { ...existing }
      : { communication_score: 4, goal_progress: 4, confidence_growth: 4, overall_rating: 4, comments: '' }
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post(`/sessions/${session.session_id}/feedback`, {
        communication_score: Number(form.communication_score),
        goal_progress:       Number(form.goal_progress),
        confidence_growth:   Number(form.confidence_growth),
        overall_rating:      Number(form.overall_rating),
        comments:            form.comments || undefined,
      })
      toast('Feedback submitted! Pre-session AI evaluation archived. 🧠', 'success')
      onDone()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  const SCORES = [
    ['communication_score', 'Communication Quality'],
    ['goal_progress',       'Goal Progress'],
    ['confidence_growth',   'Confidence Growth'],
    ['overall_rating',      'Overall Rating'],
  ]

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate2-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100 bg-slate2-50">
          <h2 className="font-extrabold text-sm text-slate2-900">
            {readOnly ? 'Session Feedback' : 'Submit Session Feedback'}
          </h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <form onSubmit={readOnly ? (e) => { e.preventDefault(); onClose() } : submit}
              className="p-5 flex flex-col gap-4">
          {error && <div className="alert alert-error text-xs"><span>⚠️</span> {error}</div>}

          {SCORES.map(([key, label]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate2-700">{label}</label>
                <span className="text-xs font-bold text-sage-700">{form[key]}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                className="w-full accent-sage-600"
                value={form[key]}
                disabled={readOnly}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-slate2-700 block mb-1">Comments & Reflection</label>
            <textarea
              className="field-input text-xs"
              rows={2}
              disabled={readOnly}
              placeholder="Your takeaways from the meeting…"
              value={form.comments || ''}
              onChange={(e) => set('comments', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button type="submit" className="btn-primary flex-1 text-xs font-bold" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Submit Feedback'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Prediction modal ─────────────────────────────────────────────────────────
function PredictionModal({ session, onClose }) {
  const [pred,    setPred]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.post('/predictions', { session_id: session.session_id })
      .then(({ data }) => setPred(data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [session.session_id])

  const isEffective = pred?.prediction === 1

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate2-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100 bg-slate2-50">
          <h2 className="font-extrabold text-sm text-slate2-900">🧠 AI Pre-Session Effectiveness Diagnosis</h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <div className="p-5">
          {loading && <div className="flex justify-center py-8"><span className="spinner w-8 h-8 border-4" /></div>}
          {error   && <div className="alert alert-error text-xs"><span>⚠️</span> {error}</div>}
          {pred && (
            <div className="flex flex-col gap-4">
              {/* Verdict */}
              <div className={`rounded-2xl p-4 text-center ${isEffective ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="text-3xl mb-1">{isEffective ? '✅' : '⚠️'}</div>
                <div className={`font-extrabold text-base ${isEffective ? 'text-emerald-800' : 'text-red-800'}`}>
                  {pred.status}
                </div>
                <div className="text-xs text-slate2-600 mt-1">
                  Confidence: <strong>{(pred.effectiveness_probability * 100).toFixed(1)}%</strong>
                  {' '}· Model: {pred.model_used}
                </div>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-slate2-500 mb-1">
                  <span>Effectiveness probability</span>
                  <span className="font-bold">{(pred.effectiveness_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pred.effectiveness_probability * 100}%`,
                      background: isEffective ? '#10b981' : '#dc2626',
                    }}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 leading-relaxed font-medium">
                💡 {pred.recommendation}
              </div>

              {/* Top SHAP features */}
              {pred.feature_contributions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate2-800 mb-1.5">Top Feature Drivers (TreeSHAP)</p>
                  <div className="flex flex-col gap-1.5">
                    {pred.feature_contributions.slice(0, 5).map((f, i) => {
                      const val = typeof f === 'object' ? f.shap_value ?? f.contribution ?? 0 : f
                      const name = typeof f === 'object' ? f.feature ?? f.name ?? `Feature ${i + 1}` : `Feature ${i + 1}`
                      const positive = val >= 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate2-600 w-36 truncate font-medium">{name}</span>
                          <div className="flex-1 h-1.5 bg-slate2-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(Math.abs(val) * 30, 100)}%`,
                                background: positive ? '#10b981' : '#dc2626',
                                marginLeft: positive ? 0 : 'auto',
                              }}
                            />
                          </div>
                          <span className={`font-bold ${positive ? 'text-emerald-700' : 'text-red-700'}`}>
                            {val > 0 ? '+' : ''}{Number(val).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <button onClick={onClose} className="btn-secondary w-full text-xs font-semibold">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getMeetingUrl(s) {
  if (s.notes && s.notes.includes('[Meeting Access Link]:')) {
    const parts = s.notes.split('[Meeting Access Link]:')
    const link = parts[1]?.trim()
    if (link && link.startsWith('http')) return link
  }
  const platform = s.meeting_platform || 'Teams'
  const id = s.session_id || 101
  if (platform === 'Teams') {
    return `https://teams.microsoft.com/l/meetup-join/19%3ainua_session_${id}%40thread.v2/0?context=%7b%22Tid%22%3a%22strathmore%22%7d`
  }
  if (platform === 'Zoom') {
    return `https://zoom.us/j/849${id}9920?pwd=INUA${id}`
  }
  if (platform === 'Meet') {
    return `https://meet.google.com/inu-sess-${id}`
  }
  return null
}

function generateGoogleCalendarUrl(session) {
  if (!session || !session.session_date) return null
  const startDate = new Date(session.session_date)
  const duration = session.duration || 60
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

  const formatUtc = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`

  const title = encodeURIComponent(`INUA Mentorship: ${session.session_type || '1-on-1 Guidance'} with ${session.mentor_name || 'Advisor'}`)
  const details = encodeURIComponent(
    `INUA Mentorship Platform Session\nMentor: ${session.mentor_name}\nPlatform: ${session.meeting_platform || 'Teams'}\nJoin Link: ${getMeetingUrl(session) || 'In INUA Portal'}\n\nPre-Session Notes:\n${session.notes || 'Review career & technical milestones.'}`
  )
  const location = encodeURIComponent(session.meeting_platform || 'Microsoft Teams')

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
}

function downloadIcsFile(session) {
  if (!session || !session.session_date) return
  const startDate = new Date(session.session_date)
  const duration = session.duration || 60
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000)
  const formatIcs = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INUA Mentorship Platform//KE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:inua-sess-${session.session_id}-${Date.now()}@inua.strathmore.edu`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(startDate)}`,
    `DTEND:${formatIcs(endDate)}`,
    `SUMMARY:INUA Mentorship with ${session.mentor_name || 'Advisor'}`,
    `DESCRIPTION:Platform: ${session.meeting_platform || 'Teams'}\\nTopic: ${session.session_type || 'Mentorship'}\\nJoin Link: ${getMeetingUrl(session) || ''}`,
    `LOCATION:${session.meeting_platform || 'Teams'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: INUA Mentorship Session starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `INUA_Mentorship_${session.session_id}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const TRANSITIONS = {
  Pending:     ['Scheduled', 'Cancelled'],
  Scheduled:   ['Completed', 'Cancelled', 'Rescheduled'],
  Rescheduled: ['Completed', 'Cancelled'],
}

export default function SessionsPage() {
  const toast = useToast()
  const [sessions,        setSessions]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(null)
  const [viewMode,        setViewMode]        = useState('calendar') // 'calendar' | 'list'
  const [weekOffset,      setWeekOffset]      = useState(0)
  const [filter,          setFilter]          = useState('all')
  const [remindersEnabled, setRemindersEnabled] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/sessions')
      setSessions(Array.isArray(data) ? data : data.sessions ?? [])
    } catch (err) {
      toast(apiError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  async function changeStatus(session, newStatus) {
    try {
      await api.patch(`/sessions/${session.session_id}/status`, { status: newStatus })
      toast(`Session marked as ${newStatus}`, 'info')
      load()
    } catch (err) {
      toast(apiError(err), 'error')
    }
  }

  async function openFeedback(session) {
    try {
      const { data } = await api.get(`/sessions/${session.session_id}/feedback`)
      setModal({ type: 'feedback', session, existing: data })
    } catch {
      setModal({ type: 'feedback', session, existing: null })
    }
  }

  // Calculate current week days based on weekOffset
  const weekDays = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const distanceToMonday = (dayOfWeek + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7)
    monday.setHours(0, 0, 0, 0)

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d)
    }
    return days
  }, [weekOffset])

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return ''
    const start = weekDays[0].toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    const end = weekDays[6].toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${start} – ${end}`
  }, [weekDays])

  // Nearest upcoming session for urgent reminder banner
  const upcomingScheduled = useMemo(() => {
    return sessions
      .filter((s) => (s.status === 'Scheduled' || s.status === 'Pending') && s.session_date)
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
  }, [sessions])

  const nextUpcoming = upcomingScheduled[0]

  function getReminderTimeText(dateIso) {
    if (!dateIso) return 'Upcoming'
    const target = new Date(dateIso)
    const diffMs = target - new Date()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    if (diffMs < 0) return 'In session now'
    if (diffHours <= 1) return 'Starting soon (under 1 hour)'
    if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    const diffDays = Math.round(diffHours / 24)
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

  function handleNotifyReminder(s) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`INUA Session Reminder`, {
          body: `Upcoming session with ${s.mentor_name} at ${new Date(s.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via ${s.meeting_platform || 'Teams'}`,
          icon: '/favicon.ico',
        })
        toast('Session reminder notification dispatched! 🔔', 'success')
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast('Browser notifications activated for your sessions! 🔔', 'success')
          }
        })
      }
    } else {
      toast(`Reminder active: Session with ${s.mentor_name} in your calendar! 🔔`, 'info')
    }
  }

  const counts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  const statuses = ['all', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
  const visible = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate2-900 tracking-tight">Mentorship Calendar & Sessions</h1>
            <span className="bg-sage-100 text-sage-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sage-200">
              Student Schedule
            </span>
          </div>
          <p className="text-xs text-slate2-500 mt-1">
            Track booked 1-on-1 sessions, export to your personal calendar, and receive automated meeting reminders
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate2-100 p-1 rounded-xl self-start sm:self-auto border border-slate2-200">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'calendar'
                ? 'bg-white text-slate2-900 shadow-2xs'
                : 'text-slate2-600 hover:text-slate2-900'
            }`}
          >
            <span>📅</span>
            <span>Weekly Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-slate2-900 shadow-2xs'
                : 'text-slate2-600 hover:text-slate2-900'
            }`}
          >
            <span>📋</span>
            <span>Session List ({sessions.length})</span>
          </button>
        </div>
      </div>

      {/* ── URGENT UPCOMING SESSION REMINDER BANNER ── */}
      {nextUpcoming && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
              ⏰
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  Upcoming Session Reminder
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {getReminderTimeText(nextUpcoming.session_date)}
                </span>
                <span className="bg-white text-slate2-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {nextUpcoming.meeting_platform || 'Teams'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate2-900 mt-1">
                {nextUpcoming.session_type || '1-on-1 Guidance'} with {nextUpcoming.mentor_name ?? 'Industry Advisor'}
              </p>
              <p className="text-[11px] text-slate2-500 mt-0.5">
                📅 {formatDate(nextUpcoming.session_date)} · {nextUpcoming.duration} minutes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getMeetingUrl(nextUpcoming) && (
              <a
                href={getMeetingUrl(nextUpcoming)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5 no-underline shadow-xs"
              >
                <span>📹</span>
                <span>Join Meeting</span>
              </a>
            )}
            {generateGoogleCalendarUrl(nextUpcoming) && (
              <a
                href={generateGoogleCalendarUrl(nextUpcoming)}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-white hover:bg-slate2-50 text-slate2-800 border border-slate2-200 text-xs font-bold flex items-center gap-1.5 no-underline shadow-2xs transition-colors"
                title="Add this session to Google Calendar with reminders"
              >
                <span>🗓️</span>
                <span>Google Cal</span>
              </a>
            )}
            <button
              onClick={() => {
                downloadIcsFile(nextUpcoming)
                toast('Calendar (.ics) invite downloaded! Opens in Outlook/Apple Calendar with 15-min reminder.', 'success')
              }}
              className="py-2 px-3 rounded-xl bg-white hover:bg-slate2-50 text-slate2-800 border border-slate2-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Download iCal invite with 15-minute alert"
            >
              <span>📥</span>
              <span>.ICS</span>
            </button>
            <button
              onClick={() => handleNotifyReminder(nextUpcoming)}
              className="py-2 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
              title="Trigger browser reminder notification"
            >
              🔔
            </button>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Booked',  value: sessions.length,           color: 'bg-slate2-100 text-slate2-800 border-slate2-200' },
          { label: 'Upcoming',      value: counts['Scheduled'] ?? 0,  color: 'bg-sage-100 text-sage-800 border-sage-200' },
          { label: 'Completed',     value: counts['Completed'] ?? 0,  color: 'bg-blue-100 text-blue-800 border-blue-200' },
          { label: 'Cancelled',     value: counts['Cancelled'] ?? 0,  color: 'bg-red-100 text-red-800 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 text-center border ${s.color}`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* VIEW MODE 1: VISUAL WEEKLY CALENDAR */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Week Navigator Controls */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate2-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                title="Previous Week"
              >
                ◀ Prev Week
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  weekOffset === 0
                    ? 'bg-sage-600 text-white border-sage-600'
                    : 'bg-white text-slate2-700 border-slate2-200 hover:bg-slate2-50'
                }`}
              >
                Current Week
              </button>
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                title="Next Week"
              >
                Next Week ▶
              </button>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-slate2-900 block">{weekRangeLabel}</span>
              <span className="text-[10px] text-slate2-400 font-medium">East Africa Time (UTC+3 / Nairobi)</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate2-500">
                Scheduled This Term: <span className="font-bold text-slate2-900">{sessions.length}</span>
              </span>
            </div>
          </div>

          {/* 7-Day Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day, idx) => {
              const dayStr = day.toLocaleDateString('en-KE', { weekday: 'short' })
              const dateNum = day.getDate()
              const isToday =
                new Date().getDate() === day.getDate() &&
                new Date().getMonth() === day.getMonth() &&
                new Date().getFullYear() === day.getFullYear()

              // Filter sessions for this day
              const daySessions = sessions.filter((s) => {
                if (!s.session_date) return false
                const d = new Date(s.session_date)
                return (
                  d.getDate() === day.getDate() &&
                  d.getMonth() === day.getMonth() &&
                  d.getFullYear() === day.getFullYear()
                )
              })

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[360px] transition-all ${
                    isToday
                      ? 'bg-sage-50/40 border-sage-300 ring-2 ring-sage-400/20 shadow-xs'
                      : 'bg-white border-slate2-200'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate2-100">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-extrabold ${isToday ? 'text-sage-800' : 'text-slate2-800'}`}>
                        {dayStr}
                      </span>
                      {isToday && (
                        <span className="bg-sage-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-black ${isToday ? 'text-sage-700' : 'text-slate2-400'}`}>
                      {dateNum}
                    </span>
                  </div>

                  {/* Day Sessions */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate2-400">
                        <span className="text-xl opacity-30 mb-1">📖</span>
                        <span className="text-[11px] font-medium">No sessions scheduled</span>
                        <span className="text-[9px] text-slate2-400 mt-0.5">Study & Project Time</span>
                      </div>
                    ) : (
                      daySessions.map((s) => {
                        const sTime = s.session_date
                          ? new Date(s.session_date).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
                          : 'TBD'
                        const mentorPic = getStoredAvatar(s.mentor_id || s.mentor_name, s.mentor_name)

                        return (
                          <div
                            key={s.session_id}
                            className="bg-white rounded-xl p-3 border border-slate2-200 shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
                          >
                            <div>
                              {/* Time & Status */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[11px] font-extrabold text-slate2-800 bg-slate2-100 px-2 py-0.5 rounded-md">
                                  ⏰ {sTime}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${statusClass(s.status)}`}>
                                  {s.status}
                                </span>
                              </div>

                              {/* Mentor Info */}
                              <div className="flex items-center gap-2 py-1">
                                {mentorPic ? (
                                  <img
                                    src={mentorPic}
                                    alt={s.mentor_name}
                                    className="w-7 h-7 rounded-full object-cover shrink-0 shadow-2xs"
                                  />
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs"
                                    style={{ backgroundColor: avatarColor(s.mentor_name || 'MN') }}
                                  >
                                    {initials(s.mentor_name ?? 'MN')}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate2-900 truncate">
                                    {s.mentor_name ?? 'Advisor'}
                                  </div>
                                  <div className="text-[10px] text-slate2-500 truncate">
                                    {s.session_type || 'Guidance'}
                                  </div>
                                </div>
                              </div>

                              {/* Platform */}
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-semibold text-slate2-600 bg-slate2-100 px-1.5 py-0.5 rounded">
                                  💻 {s.meeting_platform || 'Teams'} ({s.duration}m)
                                </span>
                              </div>
                            </div>

                            {/* Actions & Reminder Sync */}
                            <div className="mt-3 pt-2 border-t border-slate2-100 flex flex-col gap-1.5">
                              {/* 1-Click Meeting Join */}
                              {getMeetingUrl(s) && (
                                <a
                                  href={getMeetingUrl(s)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-bold py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-2xs no-underline transition-colors"
                                >
                                  <span>📹</span>
                                  <span>Join {s.meeting_platform || 'Call'}</span>
                                </a>
                              )}

                              {/* Calendar Sync Quick Buttons */}
                              <div className="grid grid-cols-2 gap-1">
                                {generateGoogleCalendarUrl(s) && (
                                  <a
                                    href={generateGoogleCalendarUrl(s)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] font-bold py-1 px-1.5 rounded-md bg-slate2-50 hover:bg-slate2-100 text-slate2-700 border border-slate2-200 text-center no-underline transition-colors truncate"
                                    title="Add to Google Calendar"
                                  >
                                    + Google Cal
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadIcsFile(s)
                                    toast('Downloaded .ics calendar invite with 15-min reminder!', 'success')
                                  }}
                                  className="text-[9px] font-bold py-1 px-1.5 rounded-md bg-slate2-50 hover:bg-slate2-100 text-slate2-700 border border-slate2-200 text-center transition-colors truncate"
                                  title="Download Apple / Outlook .ics with alarm"
                                >
                                  + iCal Alert
                                </button>
                              </div>

                              {/* Feedback / Diagnosis */}
                              {s.status === 'Completed' && (
                                <button
                                  onClick={() => openFeedback(s)}
                                  className="text-[10px] font-bold py-1 px-2 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                                >
                                  {s.has_feedback ? 'View Feedback' : 'Give Feedback ⭐'}
                                </button>
                              )}

                              {s.has_prediction && (
                                <button
                                  onClick={() => setModal({ type: 'prediction', session: s })}
                                  className="text-[10px] font-bold py-1 px-2 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors"
                                >
                                  🧠 AI Score
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DETAILED ROSTER LIST */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === st
                    ? 'bg-sage-600 text-white shadow-2xs'
                    : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
                {st !== 'all' && counts[st] ? ` (${counts[st]})` : ''}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><span className="spinner w-8 h-8 border-4" /></div>
          ) : visible.length === 0 ? (
            <div className="card p-10 text-center text-slate2-400">
              No {filter === 'all' ? '' : filter.toLowerCase() + ' '}sessions found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((s) => {
                const mentorPic = getStoredAvatar(s.mentor_id || s.mentor_name, s.mentor_name)

                return (
                  <div key={s.session_id} className="session-row">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left info */}
                      <div className="flex items-center gap-3">
                        {mentorPic ? (
                          <img
                            src={mentorPic}
                            alt={s.mentor_name}
                            className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-slate2-200 shadow-2xs"
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                            style={{ backgroundColor: avatarColor(s.mentor_name || 'MN') }}
                          >
                            {initials(s.mentor_name ?? 'MN')}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`badge ${statusClass(s.status)}`}>
                              {statusEmoji(s.status)} {s.status}
                            </span>
                            <span className="text-xs bg-slate2-100 text-slate2-600 px-2 py-0.5 rounded-full font-medium">
                              {s.session_type}
                            </span>
                            <span className="text-xs text-slate2-500 font-semibold">
                              💻 {s.meeting_platform || 'Teams'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="font-extrabold text-slate2-900 text-sm">
                              with {s.mentor_name ?? 'Industry Advisor'}
                            </span>
                            <span className="text-slate2-400 text-xs ml-2">{formatDate(s.session_date)}</span>
                            <span className="text-slate2-400 text-xs ml-2">· {s.duration} min</span>
                          </div>
                          {s.notes && (
                            <div className="text-[11px] text-slate2-500 mt-0.5 truncate max-w-md">
                              📝 <span className="italic">{s.notes.replace(/\[Meeting Access Link\].*/s, '').trim()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions & Calendar Export */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Join Video Meeting */}
                        {getMeetingUrl(s) && (
                          <a
                            href={getMeetingUrl(s)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 no-underline transition-colors shadow-2xs"
                          >
                            <span>📹</span>
                            <span>Join Call</span>
                          </a>
                        )}

                        {/* Google Calendar Link */}
                        {generateGoogleCalendarUrl(s) && (
                          <a
                            href={generateGoogleCalendarUrl(s)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate2-100 hover:bg-slate2-200 text-slate2-700 no-underline transition-colors"
                            title="Add to Google Calendar"
                          >
                            🗓️ Google Cal
                          </a>
                        )}

                        {/* iCal download */}
                        <button
                          onClick={() => {
                            downloadIcsFile(s)
                            toast('Downloaded .ics calendar invite with 15-min reminder!', 'success')
                          }}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate2-100 hover:bg-slate2-200 text-slate2-700 transition-colors"
                          title="Download .ics file"
                        >
                          📥 .ICS
                        </button>

                        {/* Status transitions */}
                        {TRANSITIONS[s.status]?.map((next) => (
                          <button
                            key={next}
                            onClick={() => changeStatus(s, next)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              next === 'Cancelled'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                            }`}
                          >
                            Mark {next}
                          </button>
                        ))}

                        {/* Feedback */}
                        {s.status === 'Completed' && (
                          <button
                            onClick={() => openFeedback(s)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            {s.has_feedback ? 'View Feedback' : 'Give Feedback'}
                          </button>
                        )}

                        {/* AI prediction */}
                        {s.has_prediction && (
                          <button
                            onClick={() => setModal({ type: 'prediction', session: s })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                          >
                            🧠 AI Score
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'feedback' && (
        <FeedbackModal
          session={modal.session}
          existing={modal.existing}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load() }}
        />
      )}
      {modal?.type === 'prediction' && (
        <PredictionModal session={modal.session} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
