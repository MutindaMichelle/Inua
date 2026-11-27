/**
 * INUA Mentor Quality Profile Page — mentor view: longitudinal performance & credential verification dashboard.
 */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { apiError } from '../../utils/helpers'

function StatCard({ label, value, unit = '', icon, color = 'bg-slate2-50' }) {
  return (
    <div className={`card p-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-slate2-900">
        {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
        {unit && <span className="text-sm font-semibold text-slate2-500 ml-1">{unit}</span>}
      </div>
      <div className="text-xs font-semibold text-slate2-500 mt-0.5">{label}</div>
    </div>
  )
}

function RatingBar({ label, value }) {
  const pct = (value / 5) * 100
  const color = pct >= 70 ? '#40855d' : pct >= 40 ? '#d67d3a' : '#dc2626'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate2-600 font-medium">{label}</span>
        <span className="text-sm font-bold text-sage-700">{value?.toFixed(1)}/5</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate2-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function MentorQualityPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMyQuality() {
      setLoading(true)
      try {
        const mentorId = user?.profile?.mentor_id
        if (mentorId) {
          const { data } = await api.get(`/mentors/${mentorId}/quality`)
          setProfile(data)
        } else {
          const { data: meData } = await api.get('/auth/me')
          if (meData?.profile?.mentor_id) {
            const { data } = await api.get(`/mentors/${meData.profile.mentor_id}/quality`)
            setProfile(data)
          } else {
            const { data } = await api.get('/mentors/quality-profiles')
            const profiles = Array.isArray(data) ? data : data.profiles ?? []
            const mine = profiles.find((p) => p.email === user?.email || p.name === user?.name) || null
            setProfile(mine)
          }
        }
      } catch (err) {
        setError(apiError(err))
      } finally {
        setLoading(false)
      }
    }
    loadMyQuality()
  }, [user])

  if (loading) return (
    <div className="flex justify-center py-24">
      <span className="spinner w-8 h-8 border-4" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="alert alert-error"><span>⚠️</span> {error}</div>
    </div>
  )

  if (!profile) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card p-10 text-center text-slate2-400">
        <div className="text-4xl mb-3">📊</div>
        <p className="font-semibold">No quality profile yet.</p>
        <p className="text-sm mt-1">Complete sessions and collect feedback to build your profile.</p>
      </div>
    </div>
  )

  const effectivenessColor =
    profile.effectiveness_rate_percentage >= 70 ? 'text-green-700' :
    profile.effectiveness_rate_percentage >= 40 ? 'text-amber-700' : 'text-red-700'
  const vStatus = profile.verification_status || (profile.is_verified ? 'Verified' : 'Pending')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Credential Verification Status Banner for Unverified Mentors */}
      {vStatus !== 'Verified' && (
        <div className="card p-5 mb-6 border-l-4 border-l-amber-500 bg-amber-50/70 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-amber-900">
              {vStatus === 'Pending'
                ? '⏳ Your Mentor Credentials Are Pending Administrator Verification'
                : '⚠️ Credential Verification Requires Attention'}
            </div>
            <p className="text-xs text-amber-800 mt-1">
              {profile.verification_notes ||
                'Once an Administrator verifies your submitted degree, certification, or employer letter, your profile will become bookable by mentees.'}
            </p>
          </div>
          <Link to="/profile" className="btn-secondary text-xs py-2 px-3">
            Update Credential Proof →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="card p-5 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl"
              style={{ background: 'linear-gradient(135deg,#40855d,#2f6847)' }}
            >
              {profile.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-extrabold text-slate2-900">{profile.name}</div>
              <div className="text-sm text-slate2-500">{profile.expertise} · {profile.industry}</div>
              <div className="text-xs text-slate2-400 mt-0.5">
                {profile.experience_years} yrs experience
                {profile.credential_type ? ` · ${profile.credential_type}` : ''}
                {profile.credential_issuer ? ` (${profile.credential_issuer})` : ''}
              </div>
            </div>
            <div className="ml-auto">
              {vStatus === 'Verified' ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified Credential
                </span>
              ) : vStatus === 'Rejected' ? (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✕ Verification Rejected
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                  ⏳ Pending Admin Review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="📅" label="Total Sessions" value={profile.total_sessions} color="bg-slate2-50" />
        <StatCard icon="✅" label="Completed" value={profile.completed_sessions} color="bg-blue-50" />
        <StatCard icon="🎓" label="Unique Mentees" value={profile.unique_mentees_count} color="bg-purple-50" />
        <StatCard icon="⭐" label="Overall Rating" value={profile.average_overall_rating} unit="/5" color="bg-amber-50" />
      </div>

      {/* Effectiveness banner */}
      <div className="card p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-1">
            Session Effectiveness Rate
          </p>
          <div className={`text-4xl font-extrabold ${effectivenessColor}`}>
            {profile.effectiveness_rate_percentage?.toFixed(1)}%
          </div>
          <p className="text-xs text-slate2-400 mt-0.5">
            {profile.effective_sessions_count} of {profile.completed_sessions} sessions effective
          </p>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="h-4 rounded-full bg-slate2-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${profile.effectiveness_rate_percentage}%`,
                background:
                  profile.effectiveness_rate_percentage >= 70
                    ? '#40855d'
                    : profile.effectiveness_rate_percentage >= 40
                    ? '#d67d3a'
                    : '#dc2626',
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed ratings */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-slate2-900 mb-4">Feedback Scores</h2>
        <div className="flex flex-col gap-4">
          <RatingBar label="Communication Quality" value={profile.average_communication_score} />
          <RatingBar label="Goal Progress" value={profile.average_goal_progress} />
          <RatingBar label="Confidence Growth" value={profile.average_confidence_growth} />
          <RatingBar label="Overall Rating" value={profile.average_overall_rating} />
        </div>
        <p className="text-xs text-slate2-400 mt-4">
          Based on {profile.total_feedback_count} feedback submission{profile.total_feedback_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Recent comments */}
      {profile.recent_comments?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate2-900 mb-4">Recent Student Feedback</h2>
          <div className="flex flex-col gap-3">
            {profile.recent_comments.map((c, i) => (
              <div key={i} className="bg-slate2-50 rounded-xl p-3 text-sm text-slate2-700">
                💬 "{c}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
