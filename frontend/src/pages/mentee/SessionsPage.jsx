/**
 * INUA Sessions Page — mentee view: view sessions, update status, give feedback.
 */
import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { formatDate, statusClass, statusEmoji, apiError } from '../../utils/helpers'

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
    setLoading(true); setError('')
    try {
      await api.post(`/sessions/${session.session_id}/feedback`, {
        communication_score: Number(form.communication_score),
        goal_progress:       Number(form.goal_progress),
        confidence_growth:   Number(form.confidence_growth),
        overall_rating:      Number(form.overall_rating),
        comments:            form.comments || undefined,
      })
      toast('Feedback submitted! AI prediction generated. 🧠', 'success')
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100">
          <h2 className="font-bold text-slate2-900">
            {readOnly ? 'Session Feedback' : 'Give Feedback'}
          </h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <form onSubmit={readOnly ? (e) => { e.preventDefault(); onClose() } : submit}
              className="p-5 flex flex-col gap-4">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

          {SCORES.map(([key, label]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="field-label mb-0">{label}</label>
                <span className="text-sm font-bold text-sage-700">{form[key]}/5</span>
              </div>
              <input type="range" min={1} max={5} step={0.5} className="w-full accent-sage-600"
                value={form[key]} disabled={readOnly}
                onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}

          <div>
            <label className="field-label">Comments</label>
            <textarea className="field-input" rows={2} disabled={readOnly}
              placeholder="Your thoughts on the session…"
              value={form.comments || ''}
              onChange={(e) => set('comments', e.target.value)} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Submit'}
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate2-100">
          <h2 className="font-bold text-slate2-900">🧠 AI Session Diagnosis</h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <div className="p-5">
          {loading && <div className="flex justify-center py-8"><span className="spinner w-8 h-8 border-4" /></div>}
          {error   && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          {pred && (
            <div className="flex flex-col gap-4">
              {/* Verdict */}
              <div className={`rounded-xl p-4 text-center ${isEffective ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="text-3xl mb-1">{isEffective ? '✅' : '⚠️'}</div>
                <div className={`font-bold text-lg ${isEffective ? 'text-green-800' : 'text-red-800'}`}>
                  {pred.status}
                </div>
                <div className="text-sm text-slate2-500 mt-1">
                  Confidence: <strong>{(pred.effectiveness_probability * 100).toFixed(1)}%</strong>
                  {' '}· Model: {pred.model_used}
                </div>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-slate2-500 mb-1">
                  <span>Effectiveness probability</span>
                  <span>{(pred.effectiveness_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate2-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pred.effectiveness_probability * 100}%`,
                      background: isEffective ? '#40855d' : '#dc2626',
                    }}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                💡 {pred.recommendation}
              </div>

              {/* Top SHAP features */}
              {pred.feature_contributions?.length > 0 && (
                <div>
                  <p className="field-label">Top Feature Drivers (TreeSHAP)</p>
                  <div className="flex flex-col gap-2 mt-1">
                    {pred.feature_contributions.slice(0, 5).map((f, i) => {
                      const val = typeof f === 'object' ? f.shap_value ?? f.contribution ?? 0 : f
                      const name = typeof f === 'object' ? f.feature ?? f.name ?? `Feature ${i + 1}` : `Feature ${i + 1}`
                      const positive = val >= 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-slate2-500 w-40 truncate">{name}</span>
                          <div className="flex-1 h-2 bg-slate2-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(Math.abs(val) * 30, 100)}%`,
                                background: positive ? '#40855d' : '#dc2626',
                                marginLeft: positive ? 0 : 'auto',
                              }}
                            />
                          </div>
                          <span className={`font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>
                            {val > 0 ? '+' : ''}{Number(val).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Risk factors */}
              {pred.risk_factors?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-800 mb-1">Risk Factors</p>
                  <ul className="text-xs text-amber-700 space-y-0.5">
                    {pred.risk_factors.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              )}

              <button onClick={onClose} className="btn-secondary w-full">Close</button>
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

// ── Main page ────────────────────────────────────────────────────────────────
const TRANSITIONS = {
  Pending:     ['Scheduled', 'Cancelled'],
  Scheduled:   ['Completed', 'Cancelled', 'Rescheduled'],
  Rescheduled: ['Completed', 'Cancelled'],
}

export default function SessionsPage() {
  const toast = useToast()
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // { type: 'feedback'|'prediction', session, existing? }

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
    // Try to load existing feedback first
    try {
      const { data } = await api.get(`/sessions/${session.session_id}/feedback`)
      setModal({ type: 'feedback', session, existing: data })
    } catch {
      setModal({ type: 'feedback', session, existing: null })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title">My Sessions</h1>
        <p className="section-sub">Track and manage your mentorship sessions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><span className="spinner w-8 h-8 border-4" /></div>
      ) : sessions.length === 0 ? (
        <div className="card p-10 text-center text-slate2-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-semibold">No sessions yet.</p>
          <p className="text-sm mt-1">Go to <strong>Find Mentors</strong> to book your first session.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.session_id} className="session-row">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${statusClass(s.status)}`}>
                      {statusEmoji(s.status)} {s.status}
                    </span>
                    <span className="text-xs bg-slate2-100 text-slate2-600 px-2 py-0.5 rounded-full font-medium">
                      {s.session_type}
                    </span>
                    <span className="text-xs bg-slate2-100 text-slate2-600 px-2 py-0.5 rounded-full font-medium">
                      {s.meeting_platform}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span className="font-semibold text-slate2-900 text-sm">
                      with {s.mentor_name ?? 'Mentor'}
                    </span>
                    <span className="text-slate2-400 text-xs ml-2">{formatDate(s.session_date)}</span>
                    <span className="text-slate2-400 text-xs ml-2">· {s.duration} min</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
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

                  {/* Status transitions */}
                  {TRANSITIONS[s.status]?.map((next) => (
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
          ))}
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
