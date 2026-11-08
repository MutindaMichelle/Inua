/**
 * INUA Mentor Sessions Page — mentor view: view assigned sessions & update status.
 */
import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { formatDate, statusClass, statusEmoji, apiError } from '../../utils/helpers'

const MENTOR_TRANSITIONS = {
  Pending:     ['Scheduled', 'Cancelled'],
  Scheduled:   ['Completed', 'Cancelled', 'Rescheduled'],
  Rescheduled: ['Completed', 'Cancelled'],
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100">
          <h2 className="font-bold text-slate2-900">Session Feedback</h2>
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
                <div className="bg-slate2-50 rounded-xl p-3 text-sm text-slate2-700 mt-1">
                  💬 "{fb.comments}"
                </div>
              )}
              <button onClick={onClose} className="btn-secondary w-full mt-2">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MentorSessionsPage() {
  const toast = useToast()
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [filter,   setFilter]   = useState('all')

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

  const statuses = ['all', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
  const visible  = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)

  const counts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="section-title">My Sessions</h1>
        <p className="section-sub">Mentorship sessions assigned to you</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: sessions.length,                 color: 'bg-slate2-100 text-slate2-700' },
          { label: 'Upcoming',  value: counts['Scheduled'] ?? 0,        color: 'bg-sage-100 text-sage-800' },
          { label: 'Completed', value: counts['Completed'] ?? 0,        color: 'bg-blue-100 text-blue-800' },
          { label: 'Cancelled', value: counts['Cancelled'] ?? 0,        color: 'bg-red-100 text-red-800' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 text-center ${s.color}`}>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {statuses.map((st) => (
          <button key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === st
                ? 'bg-sage-600 text-white'
                : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
            }`}>
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
          {visible.map((s) => (
            <div key={s.session_id} className="session-row">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${statusClass(s.status)}`}>
                      {statusEmoji(s.status)} {s.status}
                    </span>
                    <span className="text-xs bg-slate2-100 text-slate2-600 px-2 py-0.5 rounded-full font-medium">
                      {s.session_type}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span className="font-semibold text-slate2-900 text-sm">
                      {s.mentee_name ?? 'Mentee'}
                    </span>
                    <span className="text-slate2-400 text-xs ml-2">{formatDate(s.session_date)}</span>
                    <span className="text-slate2-400 text-xs ml-2">· {s.duration} min · {s.meeting_platform}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {MENTOR_TRANSITIONS[s.status]?.map((next) => (
                    <button key={next}
                      onClick={() => changeStatus(s, next)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        next === 'Cancelled'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                      }`}>
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
          ))}
        </div>
      )}

      {modal && (
        <FeedbackViewModal session={modal.session} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
