/**
 * INUA Admin Overview Page — platform-wide analytics dashboard (FR-08).
 */
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { apiError } from '../../utils/helpers'

function StatCard({ icon, label, value, sub, color = 'bg-white' }) {
  return (
    <div className={`card p-5 ${color}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold text-slate2-900">{value ?? '—'}</div>
      <div className="text-xs font-bold text-slate2-500 mt-0.5 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-slate2-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function BreakdownBar({ title, data, total, colorFn }) {
  if (!data || Object.keys(data).length === 0) return null
  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate2-900 mb-4">{title}</h3>
      <div className="flex flex-col gap-3">
        {Object.entries(data).map(([key, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={key}>
              <div className="flex justify-between mb-1 text-xs">
                <span className="font-semibold text-slate2-700 capitalize">{key}</span>
                <span className="text-slate2-500">{count} ({pct.toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${pct}%`,
                  background: colorFn ? colorFn(key) : '#40855d',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SESSION_STATUS_COLOR = {
  Scheduled:   '#40855d',
  Completed:   '#3b82f6',
  Cancelled:   '#dc2626',
  Rescheduled: '#d97706',
}

const PREDICTION_COLOR = {
  effective:   '#40855d',
  ineffective: '#dc2626',
  Effective:   '#40855d',
  Ineffective: '#dc2626',
}

export default function AdminOverviewPage() {
  const toast = useToast()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/analytics/admin/overview')
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) return (
    <div className="flex justify-center py-24"><span className="spinner w-8 h-8 border-4" /></div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="alert alert-error"><span>⚠️</span> {error}</div>
    </div>
  )

  if (!data) return null

  const totalUsers    = data.total_users ?? 0
  const totalSessions = data.total_sessions ?? 0
  const totalPred     = data.total_predictions ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title">Platform Overview</h1>
        <p className="section-sub">System-wide analytics and health statistics</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon="👥" label="Total Users"    value={totalUsers}
          sub={`${data.active_mentees_count} mentees · ${data.active_mentors_count} mentors`} />
        <StatCard icon="📅" label="Sessions"       value={totalSessions} color="bg-blue-50" />
        <StatCard icon="🧠" label="AI Predictions" value={totalPred}      color="bg-purple-50" />
        <StatCard icon="⭐" label="Avg Satisfaction"
          value={data.average_platform_satisfaction?.toFixed(1)}
          sub="/ 5.0 overall rating" color="bg-amber-50" />
      </div>

      {/* Average scores row */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-slate2-900 mb-4">Platform Average Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            ['Communication', data.average_communication_score],
            ['Goal Progress',  data.average_goal_progress],
            ['Confidence Growth', data.average_confidence_growth],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="flex justify-between mb-1.5 text-xs">
                <span className="font-semibold text-slate2-700">{label}</span>
                <span className="font-bold text-sage-700">{val?.toFixed(2)}/5</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate2-100 overflow-hidden">
                <div className="h-full rounded-full bg-sage-500"
                     style={{ width: `${((val ?? 0) / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <BreakdownBar
          title="Users by Role"
          data={data.users_by_role}
          total={totalUsers}
          colorFn={() => '#40855d'}
        />
        <BreakdownBar
          title="Sessions by Status"
          data={data.sessions_by_status}
          total={totalSessions}
          colorFn={(k) => SESSION_STATUS_COLOR[k] ?? '#8aa6be'}
        />
        <BreakdownBar
          title="AI Prediction Outcomes"
          data={data.predictions_breakdown}
          total={totalPred}
          colorFn={(k) => PREDICTION_COLOR[k] ?? '#8aa6be'}
        />
      </div>

      {/* Top mentors */}
      {data.top_performing_mentors?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate2-900 mb-4">🏆 Top Performing Mentors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate2-500 font-bold uppercase tracking-wider border-b border-slate2-100">
                  <th className="text-left pb-2">Mentor</th>
                  <th className="text-right pb-2">Sessions</th>
                  <th className="text-right pb-2">Completed</th>
                  <th className="text-right pb-2">Avg Rating</th>
                  <th className="text-right pb-2">Effectiveness</th>
                </tr>
              </thead>
              <tbody>
                {data.top_performing_mentors.map((m, i) => (
                  <tr key={i} className="border-b border-slate2-50 last:border-0">
                    <td className="py-2.5">
                      <div className="font-semibold text-slate2-900">{m.name}</div>
                      <div className="text-xs text-slate2-400">{m.industry ?? m.expertise}</div>
                    </td>
                    <td className="py-2.5 text-right text-slate2-600">{m.total_sessions ?? '—'}</td>
                    <td className="py-2.5 text-right text-slate2-600">{m.completed_sessions ?? '—'}</td>
                    <td className="py-2.5 text-right font-semibold text-amber-700">
                      {m.average_overall_rating?.toFixed(1) ?? '—'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-sage-700">
                      {m.effectiveness_rate_percentage != null
                        ? `${m.effectiveness_rate_percentage.toFixed(0)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
