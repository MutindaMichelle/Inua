/**
 * INUA Admin Mentors Page — Mentor Credential Verification Queue & Quality Audit Rankings (FR-07, FR-08).
 */
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { avatarColor, initials, apiError } from '../../utils/helpers'

function StatusBadge({ status, isVerified }) {
  const resolved = status || (isVerified ? 'Verified' : 'Pending')
  if (resolved === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
        ✓ Verified
      </span>
    )
  }
  if (resolved === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
        ✕ Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
      ⏳ Pending Review
    </span>
  )
}

function MentorDetailModal({ mentor, onClose, onVerifyUpdate }) {
  const toast = useToast()
  const [notes, setNotes] = useState(mentor.verification_notes || '')
  const [submitting, setSubmitting] = useState(false)

  const ratings = [
    ['Communication', mentor.average_communication_score],
    ['Goal Progress', mentor.average_goal_progress],
    ['Confidence Growth', mentor.average_confidence_growth],
    ['Overall Rating', mentor.average_overall_rating],
  ]
  const eff = mentor.effectiveness_rate_percentage ?? 0
  const effColor = eff >= 70 ? 'text-green-700' : eff >= 40 ? 'text-amber-700' : 'text-red-700'

  async function handleVerify(newStatus) {
    setSubmitting(true)
    try {
      const { data } = await api.post(`/mentors/${mentor.mentor_id}/verify`, {
        status: newStatus,
        verification_notes: notes,
      })
      toast(
        newStatus === 'Verified'
          ? `Approved ${mentor.name} as a Verified Mentor!`
          : `Updated ${mentor.name}'s status to ${newStatus}.`,
        newStatus === 'Verified' ? 'success' : 'info'
      )
      onVerifyUpdate(mentor.mentor_id, data)
    } catch (err) {
      toast(apiError(err), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate2-100 z-10">
          <h2 className="font-bold text-slate2-900">Mentor Credential Dossier & Quality Audit</h2>
          <button onClick={onClose} className="btn-ghost py-1 px-2 text-slate2-400">✕</button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="avatar w-14 h-14 text-xl" style={{ background: avatarColor(mentor.name) }}>
              {initials(mentor.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate2-900 text-base">{mentor.name}</div>
              <div className="text-sm text-slate2-500">{mentor.email}</div>
              <div className="text-xs text-slate2-400">
                {mentor.expertise} · {mentor.industry} · {mentor.experience_years} yrs exp
              </div>
            </div>
            <StatusBadge status={mentor.verification_status} isVerified={mentor.is_verified} />
          </div>

          {/* Credential Proof & Admin Verification Section */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              🛡️ Submitted Proof of Qualification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">Credential Type</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {mentor.credential_type || 'Professional Certification'}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">Reference / License #</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {mentor.credential_reference || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Issuing Institution / Employer / Registered Firm
              </div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {mentor.credential_issuer || mentor.industry}
              </div>
            </div>

            {mentor.credential_document_url && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2">
                <div className="truncate">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Verification Document / URL</div>
                  <a
                    href={mentor.credential_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 font-bold hover:underline break-all"
                  >
                    {mentor.credential_document_url}
                  </a>
                </div>
                <a
                  href={mentor.credential_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold whitespace-nowrap hover:bg-amber-200"
                >
                  Open Proof ↗
                </a>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Administrator Verification Notes
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                placeholder="Record verification findings (e.g. Verified BRS certificate & employer confirmation letter)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify('Verified')}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                ✓ Approve & Verify Mentor
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify('Rejected')}
                className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                ✕ Reject Credentials
              </button>
            </div>
          </div>

          {/* Effectiveness */}
          <div className="card p-4 text-center bg-slate2-50">
            <div className={`text-3xl font-extrabold ${effColor}`}>{eff.toFixed(1)}%</div>
            <div className="text-xs text-slate2-500 font-semibold mt-0.5">Session Effectiveness Rate</div>
            <div className="mt-2 h-2.5 rounded-full bg-slate2-200 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${eff}%`,
                  background: eff >= 70 ? '#40855d' : eff >= 40 ? '#d97706' : '#dc2626',
                }}
              />
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
                    <div
                      className="h-full rounded-full bg-sage-500"
                      style={{ width: `${((val ?? 0) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminMentorsPage() {
  const toast = useToast()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sort, setSort] = useState('effectiveness')

  useEffect(() => {
    api.get('/analytics/admin/mentors')
      .then(({ data }) => setMentors(Array.isArray(data) ? data : data.mentors ?? []))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [toast])

  function handleVerifyUpdate(mentorId, updatedSummary) {
    setMentors((prev) =>
      prev.map((m) =>
        m.mentor_id === mentorId
          ? {
              ...m,
              is_verified: updatedSummary.is_verified,
              verification_status: updatedSummary.verification_status,
              verification_notes: updatedSummary.verification_notes,
            }
          : m
      )
    )
    setSelected((prev) =>
      prev && prev.mentor_id === mentorId
        ? {
            ...prev,
            is_verified: updatedSummary.is_verified,
            verification_status: updatedSummary.verification_status,
            verification_notes: updatedSummary.verification_notes,
          }
        : prev
    )
  }

  async function quickApprove(mentor) {
    try {
      const { data } = await api.post(`/mentors/${mentor.mentor_id}/verify`, {
        status: 'Verified',
        verification_notes: `Verified ${mentor.credential_type || 'credentials'} (${mentor.credential_reference || 'on file'}).`,
      })
      handleVerifyUpdate(mentor.mentor_id, data)
      toast(`Approved ${mentor.name}! They are now live in the mentee directory.`, 'success')
    } catch (err) {
      toast(apiError(err), 'error')
    }
  }

  const pendingCount = mentors.filter(
    (m) => (m.verification_status || (m.is_verified ? 'Verified' : 'Pending')) === 'Pending'
  ).length

  const filtered = mentors
    .filter((m) => {
      const resolvedStatus = m.verification_status || (m.is_verified ? 'Verified' : 'Pending')
      if (statusFilter !== 'ALL' && resolvedStatus !== statusFilter) return false
      const q = search.toLowerCase()
      return (
        m.name?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q) ||
        m.expertise?.toLowerCase().includes(q) ||
        m.credential_issuer?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sort === 'effectiveness') return (b.effectiveness_rate_percentage ?? 0) - (a.effectiveness_rate_percentage ?? 0)
      if (sort === 'rating') return (b.average_overall_rating ?? 0) - (a.average_overall_rating ?? 0)
      if (sort === 'sessions') return (b.completed_sessions ?? 0) - (a.completed_sessions ?? 0)
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">Mentor Credential Verification & Quality Audit</h1>
          <p className="section-sub">
            Review mentor proof of qualification (degrees, certifications, employer letters, firm registrations) and longitudinal effectiveness rankings.
          </p>
        </div>
      </div>

      {/* Pending Verification Alert Banner */}
      {pendingCount > 0 && (
        <div className="card p-4 mb-6 border-l-4 border-l-amber-500 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-amber-900">
              🛡️ {pendingCount} Mentor Application{pendingCount > 1 ? 's' : ''} Awaiting Credential Verification
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Unverified mentors cannot be booked by mentees until you inspect their submitted proof and approve them.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Review Pending Queue ({pendingCount})
          </button>
        </div>
      )}

      {/* Status Filter Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'ALL', label: `All Mentors (${mentors.length})` },
            { key: 'Pending', label: `⏳ Pending Approval (${pendingCount})` },
            { key: 'Verified', label: '✓ Verified' },
            { key: 'Rejected', label: '✕ Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-[#0B1324] text-white'
                  : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className="field-input max-w-xs"
            placeholder="Search mentor, firm, expertise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-1.5">
            {[
              { key: 'effectiveness', label: 'Effectiveness' },
              { key: 'rating', label: 'Rating' },
              { key: 'sessions', label: 'Sessions' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === s.key ? 'bg-sage-600 text-white' : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate2-400">No mentors match the current filter.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate2-50 text-xs text-slate2-500 font-bold uppercase tracking-wider">
                  <th className="text-left p-4">Mentor</th>
                  <th className="text-left p-4">Submitted Credential Proof</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-right p-4">Sessions</th>
                  <th className="text-right p-4">Effectiveness</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const eff = m.effectiveness_rate_percentage ?? 0
                  const effColor = eff >= 70 ? 'text-green-700' : eff >= 40 ? 'text-amber-700' : 'text-red-700'
                  const resolvedStatus = m.verification_status || (m.is_verified ? 'Verified' : 'Pending')
                  return (
                    <tr key={m.mentor_id ?? i} className="border-t border-slate2-100 hover:bg-sage-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-9 h-9 text-sm" style={{ background: avatarColor(m.name) }}>
                            {initials(m.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate2-900">{m.name}</div>
                            <div className="text-xs text-slate2-400">
                              {m.expertise} · {m.industry} ({m.experience_years}y)
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate2-800">
                          {m.credential_type || 'Professional Certification'}
                        </div>
                        <div className="text-xs text-slate2-500 truncate max-w-xs">
                          {m.credential_issuer || m.industry}
                          {m.credential_reference ? ` · Ref: ${m.credential_reference}` : ''}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={m.verification_status} isVerified={m.is_verified} />
                      </td>
                      <td className="p-4 text-right text-slate2-600">
                        <div>{m.total_sessions}</div>
                        <div className="text-xs text-slate2-400">{m.completed_sessions} completed</div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-extrabold text-base ${effColor}`}>
                          {eff.toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {resolvedStatus === 'Pending' && (
                            <button
                              onClick={() => quickApprove(m)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                          )}
                          <button
                            onClick={() => setSelected(m)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate2-100 text-slate2-700 hover:bg-slate2-200 cursor-pointer"
                          >
                            Inspect Proof
                          </button>
                        </div>
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
        <MentorDetailModal
          mentor={selected}
          onClose={() => setSelected(null)}
          onVerifyUpdate={handleVerifyUpdate}
        />
      )}
    </div>
  )
}
