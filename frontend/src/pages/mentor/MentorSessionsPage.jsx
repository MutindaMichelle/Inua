/**
 * INUA Mentor Sessions Page — Mentor View
 * Features:
 *  1. Interactive Weekly Visual Calendar with 1-click meeting join links (Teams, Zoom, Meet)
 *  2. Mentee Profile & Pre-Session Agenda Inspector Modal (Objectives, milestones, prior interaction density)
 *  3. Tabbed Toggle between Visual Calendar View and Detailed Roster View
 *  4. Status transitions (Mark Scheduled, Completed, Cancelled) & Mentee Feedback viewer
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate, statusClass, statusEmoji, apiError, initials, avatarColor, getStoredAvatar } from '../../utils/helpers'

const MENTOR_TRANSITIONS = {
  Pending:     ['Scheduled', 'Cancelled'],
  Scheduled:   ['Completed', 'Cancelled', 'Rescheduled'],
  Rescheduled: ['Completed', 'Cancelled'],
}

// Curated academic & milestone directory for Strathmore University mentees
const MENTEE_DIRECTORY = {
  'Michelle Mutinda': {
    name: 'Michelle Mutinda',
    admission: '134720',
    university: 'Strathmore University',
    faculty: 'School of Computing and Engineering Sciences (SCES)',
    program: 'Bachelor of Science in Informatics & Computer Science (BICS 4B)',
    stage: 'Final Year Student (Graduating 2026)',
    career_track: 'Software Engineering & Machine Learning Systems',
    email: 'michelle.mutinda@strathmore.edu',
    attendance_rate: '100%',
    completed_sessions: 4,
    avatar_color: '#0284c7',
    goals: [
      {
        title: 'Final Year Capstone: Machine Learning Model Deployment & TreeSHAP Integration',
        category: 'Technical Architecture',
        progress: 85,
        milestones: [
          { text: 'XGBoost Pre-Session Classifier Training (85.25% Accuracy, 0.8864 ROC-AUC)', done: true },
          { text: 'Native TreeSHAP Local Attributions Pipeline (<2ms Latency)', done: true },
          { text: 'FastAPI Backend & React Frontend End-to-End Integration', done: true },
          { text: 'Final Defense Presentation & Live System Demonstration', done: false },
        ],
      },
      {
        title: 'Industry Career Readiness: Safaricom & Microsoft Engineering Applications',
        category: 'Career & Professional',
        progress: 75,
        milestones: [
          { text: 'Resume & Portfolio Technical Optimization', done: true },
          { text: 'System Design & Distributed Algorithms Practice', done: true },
          { text: 'Behavioral Mock Interview with Mentor', done: false },
        ],
      },
    ],
  },
  'Brian Kiprop': {
    name: 'Brian Kiprop',
    admission: '141029',
    university: 'Strathmore University',
    faculty: 'School of Computing and Engineering Sciences (SCES)',
    program: 'Bachelor of Science in Informatics & Computer Science (BICS 3)',
    stage: 'Year 3 Student',
    career_track: 'Cloud Infrastructure & DevOps Engineering',
    email: 'brian.kiprop@strathmore.edu',
    attendance_rate: '95%',
    completed_sessions: 3,
    avatar_color: '#10b981',
    goals: [
      {
        title: 'Docker & Kubernetes Microservices Orchestration',
        category: 'Cloud Engineering',
        progress: 60,
        milestones: [
          { text: 'Dockerize multi-tier web application', done: true },
          { text: 'CI/CD GitHub Actions Pipeline deployment', done: true },
          { text: 'Kubernetes Cluster scaling & ingress configuration', done: false },
        ],
      },
    ],
  },
  'Faith Wanjiku': {
    name: 'Faith Wanjiku',
    admission: '139812',
    university: 'Strathmore University',
    faculty: 'School of Computing and Engineering Sciences (SCES)',
    program: 'Bachelor of Science in Informatics & Computer Science (BICS 4A)',
    stage: 'Final Year Student',
    career_track: 'Data Science & FinTech Analytics',
    email: 'faith.wanjiku@strathmore.edu',
    attendance_rate: '100%',
    completed_sessions: 5,
    avatar_color: '#8b5cf6',
    goals: [
      {
        title: 'Predictive Credit Risk Modeling for Digital Lending',
        category: 'FinTech & Analytics',
        progress: 80,
        milestones: [
          { text: 'Feature engineering on mobile money transaction logs', done: true },
          { text: 'Hyperparameter tuning with LightGBM', done: true },
          { text: 'API serving benchmark under high concurrent load', done: false },
        ],
      },
    ],
  },
}

function extractAgenda(notes) {
  if (!notes) return 'No custom agenda submitted yet. Standard 1-on-1 milestone and career guidance discussion.'
  const lines = notes.split('\n')
  const clean = lines.filter(l => !l.includes('[Meeting Access Link]:')).join('\n').trim()
  return clean || 'Mentee indicated standard 1-on-1 career & technical milestone review.'
}

function getMenteeProfile(name, session) {
  const profileKey = Object.keys(MENTEE_DIRECTORY).find(
    k => k.toLowerCase() === (name || '').toLowerCase()
  )
  if (profileKey) {
    const base = { ...MENTEE_DIRECTORY[profileKey] }
    base.current_session_agenda = extractAgenda(session?.notes)
    base.current_session_platform = session?.meeting_platform
    return base
  }
  return {
    name: name || 'Student Mentee',
    admission: '138842',
    university: 'Strathmore University',
    faculty: 'School of Computing and Engineering Sciences (SCES)',
    program: 'Bachelor of Science in Informatics & Computer Science',
    stage: 'Year 4 Student (Senior)',
    career_track: session?.session_type || 'Software Engineering & Cloud Architecture',
    email: `${(name || 'student').toLowerCase().replace(/\s+/g, '.')}@strathmore.edu`,
    attendance_rate: '100%',
    completed_sessions: 2,
    avatar_color: avatarColor(name || 'Student'),
    current_session_agenda: extractAgenda(session?.notes),
    current_session_platform: session?.meeting_platform,
    goals: [
      {
        title: `Curriculum Milestone: ${session?.session_type || 'Technical Skills Mastery'}`,
        category: 'Academic & Career',
        progress: 70,
        milestones: [
          { text: 'Complete baseline assignment review', done: true },
          { text: 'Prepare pre-session agenda questions for mentor', done: true },
          { text: 'Post-session reflection & action plan execution', done: false },
        ],
      },
    ],
  }
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

function MenteeProfileModal({ profile, session, onClose }) {
  if (!profile) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate2-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate2-900 via-slate2-800 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            {getStoredAvatar(profile.email || profile.admission, profile.name) ? (
              <img
                src={getStoredAvatar(profile.email || profile.admission, profile.name)}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/20"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {initials(profile.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{profile.name}</h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  ADM #{profile.admission}
                </span>
              </div>
              <p className="text-xs text-slate2-300 mt-0.5 font-medium">{profile.program}</p>
              <p className="text-[11px] text-slate2-400 mt-0.5">{profile.university} · {profile.stage}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl py-2 px-3">
              <div className="text-[10px] uppercase tracking-wider text-slate2-400 font-bold">Focus Track</div>
              <div className="text-xs font-semibold text-white truncate mt-0.5">{profile.career_track}</div>
            </div>
            <div className="bg-white/5 rounded-xl py-2 px-3">
              <div className="text-[10px] uppercase tracking-wider text-slate2-400 font-bold">Attendance</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">{profile.attendance_rate} Verified</div>
            </div>
            <div className="bg-white/5 rounded-xl py-2 px-3">
              <div className="text-[10px] uppercase tracking-wider text-slate2-400 font-bold">Completed Sessions</div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">{profile.completed_sessions} Sessions</div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Pre-Session Agenda Box (Crucial for interaction readiness) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Student Pre-Session Agenda & Topic
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Pre-Meeting Context
              </span>
            </div>
            <p className="text-xs text-slate2-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-amber-100 whitespace-pre-wrap">
              {profile.current_session_agenda}
            </p>
          </div>

          {/* Goals & Milestones Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate2-900 flex items-center gap-2">
                <span>🎯</span>
                <span>Active Goals & Developmental Milestones</span>
              </h3>
              <span className="text-xs text-slate2-500 font-medium">
                {profile.goals.length} Tracked Goal{profile.goals.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {profile.goals.map((g, idx) => (
                <div key={idx} className="bg-slate2-50 border border-slate2-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate2-900">{g.title}</span>
                    <span className="text-xs font-extrabold text-sage-700">{g.progress}%</span>
                  </div>
                  <div className="text-[11px] text-slate2-500 mb-2 font-medium">Category: {g.category}</div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 rounded-full bg-slate2-200 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sage-500 to-emerald-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>

                  {/* Milestones checklist */}
                  <div className="space-y-1.5">
                    {g.milestones.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2 text-xs">
                        <span className={m.done ? 'text-emerald-600 font-bold' : 'text-slate2-400'}>
                          {m.done ? '✓' : '○'}
                        </span>
                        <span className={m.done ? 'text-slate2-700 font-medium' : 'text-slate2-500 italic'}>
                          {m.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate2-50 border-t border-slate2-100 flex items-center justify-between">
          <div className="text-xs text-slate2-500">
            ✉️ Contact: <span className="font-semibold text-slate2-700">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            {session && getMeetingUrl(session) && (
              <a
                href={getMeetingUrl(session)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <span>📹</span>
                <span>Launch {session.meeting_platform || 'Call'}</span>
              </a>
            )}
            <button onClick={onClose} className="btn-secondary py-2 px-4 text-xs font-semibold">
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedbackViewModal({ session, onClose }) {
  const [fb,      setFb]      = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get(`/sessions/${session.session_id}/feedback`)
      .then(({ data }) => setFb(data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [session.session_id])

  const SCORES = [
    ['communication_score', 'Communication'],
    ['goal_progress',       'Goal Progress'],
    ['confidence_growth',   'Confidence Growth'],
    ['overall_rating',      'Overall Rating'],
  ]

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate2-200">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100">
          <h2 className="font-bold text-slate2-900 text-sm">Session Feedback</h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <div className="p-5">
          {loading && <div className="flex justify-center py-6"><span className="spinner" /></div>}
          {error   && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          {fb && (
            <div className="flex flex-col gap-3">
              {SCORES.map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-slate2-500 font-medium">{label}</span>
                    <span className="text-sm font-bold text-sage-700">{fb[key]}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
                    <div className="h-full rounded-full bg-sage-500"
                         style={{ width: `${(fb[key] / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
              {fb.comments && (
                <div className="bg-slate2-50 rounded-xl p-3 text-xs text-slate2-700 mt-1 italic border border-slate2-100">
                  💬 "{fb.comments}"
                </div>
              )}
              <button onClick={onClose} className="btn-secondary w-full mt-2 text-xs">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimeStr(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m || 0).padStart(2, '0')} ${ampm}`
}

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function AvailabilitySettingsModal({ initialAvailability, onSave, onClose }) {
  const [days, setDays] = useState(initialAvailability?.days || ['Mon', 'Wed', 'Fri'])
  const [startTime, setStartTime] = useState(initialAvailability?.startTime || '14:00')
  const [endTime, setEndTime] = useState(initialAvailability?.endTime || '17:00')
  const [platform, setPlatform] = useState(initialAvailability?.platform || 'Teams')
  const [slotDuration, setSlotDuration] = useState(initialAvailability?.slotDuration || 60)
  const [leadTimeHours, setLeadTimeHours] = useState(initialAvailability?.leadTimeHours || 24)
  const [notes, setNotes] = useState(initialAvailability?.notes || '')
  const [error, setError] = useState('')

  function toggleDay(d) {
    setError('')
    if (days.includes(d)) {
      if (days.length <= 1) {
        setError('Please keep at least one available day in your schedule.')
        return
      }
      setDays(days.filter((x) => x !== d))
    } else {
      setDays([...days, d])
    }
  }

  function applyPreset(preset) {
    if (preset === 'weekdays') setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    if (preset === 'mwf') setDays(['Mon', 'Wed', 'Fri'])
    if (preset === 'tuth') setDays(['Tue', 'Thu'])
    if (preset === 'morning') {
      setStartTime('09:00')
      setEndTime('13:00')
    }
    if (preset === 'afternoon') {
      setStartTime('14:00')
      setEndTime('17:00')
    }
    if (preset === 'evening') {
      setStartTime('16:00')
      setEndTime('19:00')
    }
    if (preset === 'fullday') {
      setStartTime('09:00')
      setEndTime('17:00')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!days.length) {
      setError('Please select at least one day.')
      return
    }
    if (startTime >= endTime) {
      setError('Start time must be earlier than end time.')
      return
    }
    onSave({
      days,
      startTime,
      endTime,
      platform,
      slotDuration: Number(slotDuration),
      leadTimeHours: Number(leadTimeHours),
      notes,
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1324] via-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              🗓️
            </div>
            <div>
              <h2 className="text-lg font-bold">Configure Available Dates & Hours</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Set when Strathmore mentees can book 1-on-1 advisory sessions with you
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* 1. Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📅</span>
                <span>Active Bookable Days</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset('mwf')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  Mon/Wed/Fri
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => applyPreset('tuth')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  Tue/Thu
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => applyPreset('weekdays')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  All Weekdays
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {ALL_WEEKDAYS.map((d) => {
                const active = days.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      active
                        ? 'bg-[#0B1324] text-white border-[#0B1324] shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>{d}</div>
                    <div className="text-[9px] mt-0.5">{active ? '✓' : '+'}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Working Time Window */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>⏰</span>
                <span>Working Hours Window (EAT)</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset('morning')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  Morning (9-1)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => applyPreset('afternoon')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  Afternoon (2-5)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => applyPreset('evening')}
                  className="text-sage-700 hover:underline font-semibold"
                >
                  Evening (4-7)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324]"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. {formatTimeStr(startTime)}</span>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324]"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. {formatTimeStr(endTime)}</span>
              </div>
            </div>
          </div>

          {/* 3. Meeting Platform & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Preferred Meeting Room
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324] font-medium"
              >
                <option value="Teams">Microsoft Teams (Automated)</option>
                <option value="Zoom">Zoom Meeting</option>
                <option value="Meet">Google Meet</option>
                <option value="Physical">Strathmore Innovation Hub (Room 302)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Session Duration
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324] font-medium"
              >
                <option value="30">30 Minutes (Quick Check-in)</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes (Standard Advisory)</option>
                <option value="90">90 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* 4. Booking Lead Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Advance Notice Required
              </label>
              <select
                value={leadTimeHours}
                onChange={(e) => setLeadTimeHours(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324] font-medium"
              >
                <option value="6">6 Hours Notice</option>
                <option value="12">12 Hours Notice</option>
                <option value="24">24 Hours (Recommended)</option>
                <option value="48">48 Hours Notice</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Time Zone
              </label>
              <div className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 font-medium">
                East Africa Time (UTC+3)
              </div>
            </div>
          </div>

          {/* 5. Advisory Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Advisory Booking Notes for Students (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please outline your question and link your capstone GitHub repo or CV draft..."
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-[#0B1324]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-2 px-6 text-xs font-bold bg-[#0B1324] hover:bg-slate-800 text-white shadow-md"
            >
              Save Available Dates & Hours ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MentorSessionsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [sessions,        setSessions]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(null)
  const [profileModal,    setProfileModal]    = useState(null)
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [filter,          setFilter]          = useState('all')
  const [viewMode,        setViewMode]        = useState('calendar') // 'calendar' | 'list'
  const [weekOffset,      setWeekOffset]      = useState(0)

  // Mentor availability configuration
  const [availability, setAvailability] = useState(() => {
    const keys = [
      user?.email,
      user?.mentor_id,
      user?.id,
      (user?.name || '').toLowerCase(),
    ].filter(Boolean)

    for (const k of keys) {
      const saved = localStorage.getItem(`mentor_availability_${k}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
            return parsed
          }
        } catch {}
      }
    }
    return {
      days: ['Mon', 'Wed', 'Fri'],
      startTime: '14:00',
      endTime: '17:00',
      platform: 'Teams',
      slotDuration: 60,
      leadTimeHours: 24,
      notes: 'Available for technical coaching, architecture reviews, and career roadmap discussions.',
    }
  })

  function handleSaveAvailability(newAvail) {
    const keys = [
      user?.email,
      user?.mentor_id,
      user?.id,
      (user?.name || '').toLowerCase(),
    ].filter(Boolean)

    keys.forEach((k) => {
      localStorage.setItem(`mentor_availability_${k}`, JSON.stringify(newAvail))
    })
    setAvailability(newAvail)
    setAvailabilityModalOpen(false)
    toast('Availability and working hours saved! Strathmore students can now book during your active slots.', 'success')
  }

  function toggleDayAvailability(dayName) {
    const exists = availability.days.includes(dayName)
    let newDays
    if (exists) {
      if (availability.days.length <= 1) {
        toast('Please keep at least one available day in your schedule.', 'error')
        return
      }
      newDays = availability.days.filter((d) => d !== dayName)
    } else {
      newDays = [...availability.days, dayName]
    }
    const updated = { ...availability, days: newDays }
    handleSaveAvailability(updated)
  }

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

  // Calculate current week days based on weekOffset
  const weekDays = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 is Sun, 1 is Mon...
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

  const counts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  const statuses = ['all', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
  const visible = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)

  // Format week range header
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return ''
    const start = weekDays[0].toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    const end = weekDays[6].toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${start} – ${end}`
  }, [weekDays])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate2-900 tracking-tight">Mentor Session Schedule</h1>
            <span className="bg-sage-100 text-sage-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sage-200">
              Active Advisor Workspace
            </span>
          </div>
          <p className="text-xs text-slate2-500 mt-1">
            Review assigned student meetings, access pre-session learning agendas, and join video calls
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
            <span>Roster List ({sessions.length})</span>
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Assigned', value: sessions.length,          color: 'bg-slate2-100 text-slate2-800 border-slate2-200' },
          { label: 'Upcoming',       value: counts['Scheduled'] ?? 0, color: 'bg-sage-100 text-sage-800 border-sage-200' },
          { label: 'Completed',      value: counts['Completed'] ?? 0, color: 'bg-blue-100 text-blue-800 border-blue-200' },
          { label: 'Cancelled',      value: counts['Cancelled'] ?? 0, color: 'bg-red-100 text-red-800 border-red-200' },
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
          {/* Mentor Availability & Booking Control Banner */}
          <div className="bg-gradient-to-r from-[#0B1324] via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                🗓️
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold tracking-tight text-white">Your Bookable Schedule & Working Hours</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Syncing to Mentee Directory
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <span>📅 Days:</span>
                    <span>{availability.days.join(', ')}</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <span>⏰ Hours:</span>
                    <span className="text-white font-medium">{formatTimeStr(availability.startTime)} – {formatTimeStr(availability.endTime)} EAT</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <span>💻 Room:</span>
                    <span className="text-white font-medium">{availability.platform}</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <span>⏱️ Duration:</span>
                    <span className="text-white font-medium">{availability.slotDuration}m ({availability.leadTimeHours}h notice)</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAvailabilityModalOpen(true)}
              className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap self-start md:self-auto flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform bg-amber-500 hover:bg-amber-600 text-white border-none"
            >
              <span>⚙️</span>
              <span>Set Availability & Hours</span>
            </button>
          </div>

          {/* Week Navigator Controls */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate2-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
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
                onClick={() => setWeekOffset(prev => prev + 1)}
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
                Weekly Active Sessions: <span className="font-bold text-slate2-900">{sessions.length}</span>
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

              const isAvailableDay = availability.days.includes(dayStr)

              // Filter sessions for this day
              const daySessions = sessions.filter(s => {
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
                      : isAvailableDay
                      ? 'bg-white border-slate2-200'
                      : 'bg-slate-50/50 border-slate-200'
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

                  {/* Day Sessions List */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto flex flex-col justify-between">
                    {daySessions.length === 0 ? (
                      isAvailableDay ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-3 text-emerald-700 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200 my-auto">
                          <span className="text-xl mb-1">🟢</span>
                          <span className="text-xs font-bold text-emerald-900">Open for Bookings</span>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            {formatTimeStr(availability.startTime)} – {formatTimeStr(availability.endTime)}
                          </span>
                          <span className="text-[9px] text-slate-500 mt-1">
                            {availability.platform} · {availability.slotDuration}m
                          </span>
                          <button
                            onClick={() => setAvailabilityModalOpen(true)}
                            className="mt-3 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/70 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors shadow-2xs"
                            title="Adjust working hours for this day"
                          >
                            Edit Hours ⚙️
                          </button>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400 bg-slate-100/60 rounded-xl border border-dashed border-slate-200 my-auto">
                          <span className="text-xl opacity-40 mb-1">☕</span>
                          <span className="text-xs font-semibold text-slate-600">Day Off</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Not Bookable by Mentees</span>
                          <button
                            onClick={() => toggleDayAvailability(dayStr)}
                            className="mt-3 text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200/80 px-2.5 py-1 rounded-md border border-slate-300 transition-colors shadow-2xs"
                            title={`Click to add ${dayStr} to your bookable mentorship schedule`}
                          >
                            + Make Available
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2.5">
                        {daySessions.map(s => {
                          const sTime = s.session_date
                            ? new Date(s.session_date).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
                            : 'TBD'
                          const menteeProf = getMenteeProfile(s.mentee_name, s)

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

                                {/* Mentee Name with Avatar & Modal Trigger */}
                                <button
                                  onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                                  className="w-full text-left flex items-center gap-2 py-1 group/btn hover:bg-slate2-50 rounded-lg transition-colors px-1 -mx-1"
                                  title="Click to view mentee profile, goals, and pre-session agenda"
                                >
                                  {getStoredAvatar(menteeProf.email || menteeProf.admission, s.mentee_name) ? (
                                    <img
                                      src={getStoredAvatar(menteeProf.email || menteeProf.admission, s.mentee_name)}
                                      alt={s.mentee_name}
                                      className="w-7 h-7 rounded-full object-cover shrink-0 shadow-2xs"
                                    />
                                  ) : (
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs"
                                      style={{ backgroundColor: menteeProf.avatar_color }}
                                    >
                                      {initials(s.mentee_name ?? 'ST')}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate2-900 group-hover/btn:text-sage-700 truncate">
                                      {s.mentee_name ?? 'Student Mentee'}
                                    </div>
                                    <div className="text-[10px] text-slate2-500 truncate">
                                      {s.session_type || 'Mentorship'}
                                    </div>
                                  </div>
                                </button>

                                {/* Platform Tag */}
                                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-semibold text-slate2-600 bg-slate2-100 px-1.5 py-0.5 rounded">
                                    💻 {s.meeting_platform || 'Teams'} ({s.duration}m)
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
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

                                {/* Mentee Profile Trigger */}
                                <button
                                  onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                                  className="text-[10px] font-semibold py-1 px-2 rounded-lg bg-slate2-100 hover:bg-slate2-200 text-slate2-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>👤</span>
                                  <span>View Mentee Profile</span>
                                </button>

                                {/* Quick Status Actions */}
                                {MENTOR_TRANSITIONS[s.status]?.includes('Completed') && (
                                  <button
                                    onClick={() => changeStatus(s, 'Completed')}
                                    className="text-[10px] font-bold py-1 px-2 rounded-lg bg-sage-50 text-sage-800 hover:bg-sage-100 transition-colors"
                                  >
                                    Mark Completed ✓
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {isAvailableDay && (
                          <div className="pt-1">
                            <div className="text-[10px] text-emerald-800 bg-emerald-50/80 rounded-lg p-1.5 text-center font-bold border border-dashed border-emerald-200">
                              🟢 Open for more bookings ({formatTimeStr(availability.startTime)} – {formatTimeStr(availability.endTime)})
                            </div>
                          </div>
                        )}
                      </div>
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
            <div className="flex justify-center py-16"><span className="spinner w-8 h-8 border-4" /></div>
          ) : visible.length === 0 ? (
            <div className="card p-10 text-center text-slate2-400">
              No {filter === 'all' ? '' : filter.toLowerCase() + ' '}sessions found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((s) => {
                const menteeProf = getMenteeProfile(s.mentee_name, s)

                return (
                  <div key={s.session_id} className="session-row">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getStoredAvatar(menteeProf.email || menteeProf.admission, s.mentee_name) ? (
                          <img
                            src={getStoredAvatar(menteeProf.email || menteeProf.admission, s.mentee_name)}
                            alt={s.mentee_name}
                            onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                            className="w-10 h-10 rounded-full object-cover shrink-0 hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                            title="Click to view student profile"
                          />
                        ) : (
                          <button
                            onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 hover:scale-105 transition-transform"
                            style={{ backgroundColor: menteeProf.avatar_color }}
                            title="Click to view student profile"
                          >
                            {initials(s.mentee_name ?? 'ST')}
                          </button>
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
                            <button
                              onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                              className="font-bold text-slate2-900 text-sm hover:text-sage-700 hover:underline"
                            >
                              {s.mentee_name ?? 'Mentee'}
                            </button>
                            <span className="text-slate2-400 text-xs ml-2">{formatDate(s.session_date)}</span>
                            <span className="text-slate2-400 text-xs ml-2">· {s.duration} min</span>
                          </div>
                          {s.notes && (
                            <div className="text-[11px] text-slate2-500 mt-0.5 truncate max-w-md">
                              📝 <span className="italic">{extractAgenda(s.notes)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Inspect Profile */}
                        <button
                          onClick={() => setProfileModal({ profile: menteeProf, session: s })}
                          className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1"
                        >
                          <span>👤</span>
                          <span>Mentee Profile</span>
                        </button>

                        {/* Join Video Meeting */}
                        {getMeetingUrl(s) && (
                          <a
                            href={getMeetingUrl(s)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 no-underline transition-colors shadow-2xs"
                          >
                            <span>📹</span>
                            <span>Join {s.meeting_platform || 'Call'}</span>
                          </a>
                        )}

                        {MENTOR_TRANSITIONS[s.status]?.map((next) => (
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

                        {s.has_feedback && (
                          <button
                            onClick={() => setModal({ session: s })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            View Feedback
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

      {/* Mentee Profile Modal */}
      {profileModal && (
        <MenteeProfileModal
          profile={profileModal.profile}
          session={profileModal.session}
          onClose={() => setProfileModal(null)}
        />
      )}

      {/* Feedback Modal */}
      {modal && (
        <FeedbackViewModal session={modal.session} onClose={() => setModal(null)} />
      )}

      {/* Mentor Availability & Booking Hours Modal */}
      {availabilityModalOpen && (
        <AvailabilitySettingsModal
          initialAvailability={availability}
          onSave={handleSaveAvailability}
          onClose={() => setAvailabilityModalOpen(false)}
        />
      )}
    </div>
  )
}
