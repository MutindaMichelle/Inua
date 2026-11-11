/**
 * INUA Goal Progression Page — Mentee view tracking developmental milestones,
 * interactive checklists, and completion velocity.
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 */
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { apiError, fmtDate } from '../../utils/helpers'

const DEFAULT_MILESTONES = [
  { id: 'm1', label: 'Define SMART objective with mentor', threshold: 25 },
  { id: 'm2', label: 'Submit pre-session agenda & deliverable draft', threshold: 50 },
  { id: 'm3', label: 'Incorporate mentor technical feedback', threshold: 75 },
  { id: 'm4', label: 'Final review & milestone sign-off', threshold: 100 },
]

export default function GoalsPage() {
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newProgress, setNewProgress] = useState(25)
  const [creating, setCreating] = useState(false)

  async function loadGoals() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/goals')
      setGoals(data || [])
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/goals', {
        goal_title: newTitle.trim(),
        progress_percentage: Number(newProgress),
      })
      setGoals((prev) => [data, ...prev])
      setNewTitle('')
      setNewProgress(25)
      toast('Developmental goal created!', 'success')
    } catch (err) {
      toast(apiError(err), 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleProgressChange(goal, nextProgress) {
    const clamped = Math.max(0, Math.min(100, Number(nextProgress)))
    try {
      const { data } = await api.patch(`/goals/${goal.goal_id}`, {
        progress_percentage: clamped,
      })
      setGoals((prev) => prev.map((g) => (g.goal_id === goal.goal_id ? data : g)))
      toast(`Goal updated to ${clamped}%`, 'info')
    } catch (err) {
      toast(apiError(err), 'error')
    }
  }

  async function handleDelete(goalId) {
    try {
      await api.delete(`/goals/${goalId}`)
      setGoals((prev) => prev.filter((g) => g.goal_id !== goalId))
      toast('Goal removed.', 'info')
    } catch (err) {
      toast(apiError(err), 'error')
    }
  }

  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.progress_percentage >= 100).length
  const avgVelocity =
    totalGoals > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress_percentage || 0), 0) / totalGoals)
      : 0
  const activeCheckpoints = goals.reduce(
    (acc, g) => acc + DEFAULT_MILESTONES.filter((m) => (g.progress_percentage || 0) >= m.threshold).length,
    0
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">🎯 Goal Progression & Milestone Velocity</h1>
        <p className="section-sub">
          Track career mentorship objectives, milestone checklists, and longitudinal completion velocity.
        </p>
      </div>

      {/* Velocity KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Goals</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalGoals}</div>
          <div className="text-xs text-slate-500 mt-1">Tracked developmental targets</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed (100%)</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedGoals}</div>
          <div className="text-xs text-slate-500 mt-1">Signed-off outcomes</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Velocity</div>
          <div className="text-2xl font-extrabold text-[#D97706] mt-1">{avgVelocity}%</div>
          <div className="text-xs text-slate-500 mt-1">Mean milestone progression</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Checklists Cleared</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {activeCheckpoints} / {totalGoals * 4}
          </div>
          <div className="text-xs text-slate-500 mt-1">Verified preparation steps</div>
        </div>
      </div>

      {/* Add New Goal Form */}
      <form onSubmit={handleCreate} className="card p-6 mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Add New Developmental Milestone</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="field-label text-xs">Goal Title & Deliverable</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Deploy full-stack FastAPI + XGBoost microservice with Docker"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="field-label text-xs">Initial Progress (%)</label>
            <select
              className="field-input"
              value={newProgress}
              onChange={(e) => setNewProgress(Number(e.target.value))}
            >
              {[0, 25, 50, 75, 100].map((pct) => (
                <option key={pct} value={pct}>
                  {pct}%
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={creating}>
            {creating ? 'Saving…' : '+ Add Goal'}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Goals List */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">Loading developmental goals…</div>
      ) : goals.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No goals recorded yet. Add your first mentorship goal above to track milestone velocity.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((g) => {
            const pct = g.progress_percentage || 0
            return (
              <div key={g.goal_id} className="card p-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : pct >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pct >= 100 ? 'Completed' : pct >= 50 ? 'On Track' : 'In Progress'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{g.goal_title}</h3>
                    </div>
                    {g.created_at && (
                      <p className="text-xs text-slate-400 mt-1">Created {fmtDate(g.created_at)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-slate-900">{pct}%</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.goal_id)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100 ? '#10B981' : pct >= 50 ? '#D97706' : '#3B82F6',
                    }}
                  />
                </div>

                {/* Milestone Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {DEFAULT_MILESTONES.map((m) => {
                    const checked = pct >= m.threshold
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleProgressChange(g, checked ? m.threshold - 25 : m.threshold)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="rounded accent-emerald-600"
                        />
                        <span className={checked ? 'line-through opacity-85' : ''}>{m.label}</span>
                        <span className="ml-auto text-[10px] font-bold opacity-60">{m.threshold}%</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
