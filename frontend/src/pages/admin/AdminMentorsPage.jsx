/**
 * INUA Admin Mentors Page — full mentor quality audit rankings for administrators (FR-07, FR-08).
 */
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { avatarColor, initials, apiError } from '../../utils/helpers'

function MentorDetailModal({ mentor, onClose }) {
  const ratings = [
    ['Communication',  mentor.average_communication_score],
    ['Goal Progress',  mentor.average_goal_progress],
    ['Confidence Growth', mentor.average_confidence_growth],
    ['Overall Rating', mentor.average_overall_rating],
  ]
  const eff = mentor.effectiveness_rate_percentage ?? 0
  const effColor = eff >= 70 ? 'text-green-700' : eff >= 40 ? 'text-amber-700' : 'text-red-700'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate2-100">
          <h2 className="font-bold text-slate2-900">Mentor Profile</h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="avatar w-14 h-14 text-xl" style={{ background: avatarColor(mentor.name) }}>
              {initials(mentor.name)}
            </div>
            <div>
              <div className="font-bold text-slate2-900 text-base">{mentor.name}</div>
              <div className="text-sm text-slate2-500">{mentor.email}</div>
              <div className="text-xs text-slate2-400">{mentor.expertise} · {mentor.industry}</div>
            </div>
            {mentor.is_verified && (
              <span className="ml-auto bg-sage-100 text-sage-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Effectiveness */}
          <div className="card p-4 text-center bg-slate2-50">
            <div className={`text-3xl font-extrabold ${effColor}`}>{eff.toFixed(1)}%</div>
            <div className="text-xs text-slate2-500 font-semibold mt-0.5">Session Effectiveness Rate</div>
            <div className="mt-2 h-2.5 rounded-full bg-slate2-200 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${eff}%`,
                background: eff >= 70 ? '#40855d' : eff >= 40 ? '#d97706' : '#dc2626',
              }} />
            </div>
          </div>

          {/* Volume stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['📅', 'Total', mentor.total_sessions],
              ['✅', 'Completed', mentor.completed_sessions],
              ['🎓', 'Mentees', mentor.unique_mentees_count],
            ].map(([icon, label, val]) => (
              <div key={label} className="card p-3">
                <div className="text-lg">{icon}</div>
                <div className="text-xl font-extrabold text-slate2-900">{val}</div>
                <div className="text-xs text-slate2-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Rating bars */}
          <div>
            <p className="field-label mb-3">Feedback Scores</p>
            <div className="flex flex-col gap-3">
              {ratings.map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-slate2-600 font-medium">{label}</span>
                    <span className="text-sm font-bold text-sage-700">{val?.toFixed(1)}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
                    <div className="h-full rounded-full bg-sage-500"
                         style={{ width: `${((val ?? 0) / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate2-400 mt-2">
              {mentor.total_feedback_count} feedback submission{mentor.total_feedback_count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Recent comments */}
          {mentor.recent_comments?.length > 0 && (
            <div>
              <p className="field-label mb-2">Recent Student Comments</p>
              <div className="flex flex-col gap-2">
                {mentor.recent_comments.map((c, i) => (
                  <div key={i} className="bg-slate2-50 rounded-xl p-2.5 text-xs text-slate2-600">
                    💬 "{c}"
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminMentorsPage() {
  const toast = useToast()
  const [mentors,  setMentors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('effectiveness')

  useEffect(() => {
    api.get('/analytics/admin/mentors')
      .then(({ data }) => setMentors(Array.isArray(data) ? data : data.mentors ?? []))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [toast])

  const filtered = mentors
    .filter((m) => {
      const q = search.toLowerCase()
      return m.name?.toLowerCase().includes(q) || m.industry?.toLowerCase().includes(q) || m.expertise?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'effectiveness') return (b.effectiveness_rate_percentage ?? 0) - (a.effectiveness_rate_percentage ?? 0)
      if (sort === 'rating')        return (b.average_overall_rating ?? 0) - (a.average_overall_rating ?? 0)
      if (sort === 'sessions')      return (b.completed_sessions ?? 0) - (a.completed_sessions ?? 0)
      return 0
    })

  if (loading) return (
    <div className="flex justify-center py-24"><span className="spinner w-8 h-8 border-4" /></div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="alert alert-error"><span>⚠️</span> {error}</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="section-title">Mentor Audit Rankings</h1>
        <p className="section-sub">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} on the platform</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input className="field-input max-w-xs" placeholder="Search by name, industry…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-1.5">
          {[
            { key: 'effectiveness', label: 'Effectiveness' },
            { key: 'rating',        label: 'Rating' },
            { key: 'sessions',      label: 'Sessions' },
          ].map((s) => (
            <button key={s.key}
              onClick={() => setSort(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sort === s.key ? 'bg-sage-600 text-white' : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate2-400">No mentors found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate2-50 text-xs text-slate2-500 font-bold uppercase tracking-wider">
                  <th className="text-left p-4">Mentor</th>
                  <th className="text-right p-4">Sessions</th>
                  <th className="text-right p-4">Rating</th>
                  <th className="text-right p-4">Effectiveness</th>
                  <th className="text-right p-4">Feedback</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const eff = m.effectiveness_rate_percentage ?? 0
                  const effColor = eff >= 70 ? 'text-green-700' : eff >= 40 ? 'text-amber-700' : 'text-red-700'
                  return (
                    <tr key={m.mentor_id ?? i} className="border-t border-slate2-100 hover:bg-sage-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-9 h-9 text-sm" style={{ background: avatarColor(m.name) }}>
                            {initials(m.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate2-900">{m.name}</div>
                            <div className="text-xs text-slate2-400">{m.industry} · {m.experience_years}y</div>
                          </div>
                          {m.is_verified && (
                            <span className="text-sage-500 text-sm" title="Verified">✓</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate2-600">
                        <div>{m.total_sessions}</div>
                        <div className="text-xs text-slate2-400">{m.completed_sessions} completed</div>
                      </td>
                      <td className="p-4 text-right font-bold text-amber-700">
                        ⭐ {m.average_overall_rating?.toFixed(1) ?? '—'}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-extrabold text-base ${effColor}`}>
                          {eff.toFixed(0)}%
                        </span>
                        <div className="mt-1 h-1.5 rounded-full bg-slate2-100 overflow-hidden w-16 ml-auto">
                          <div className="h-full rounded-full" style={{
                            width: `${eff}%`,
                            background: eff >= 70 ? '#40855d' : eff >= 40 ? '#d97706' : '#dc2626',
                          }} />
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate2-500">
                        {m.total_feedback_count ?? 0}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelected(m)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate2-100 text-slate2-700 hover:bg-slate2-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <MentorDetailModal mentor={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
