/**
 * INUA Predict Page — Mentee view: U-CS 5 Pre-Session Effectiveness Predictor.
 * Uses strictly pre-session features (leadTimeHours, hasAgenda, isFirstSession,
 * mentor_experience_years, prior_sessions, and dyad context) with TreeSHAP explanations.
 */
import React, { useState } from 'react'
import api from '../../api/client'
import { apiError } from '../../utils/helpers'

const DEFAULTS = {
  leadTimeHours:           48,
  hasAgenda:               true,
  isFirstSession:          false,
  prior_sessions:          3,
  mentor_experience_years: 8,
  career_stage:            'Year4',
  field_of_study:          'Computer Science',
  career_interest:         'Software Engineering',
  mentor_industry:         'Technology',
  mentor_specialization:   'Backend Engineering',
  mentor_availability:     'High',
  session_type:            'Interview Preparation',
  meeting_platform:        'Teams',
  goal_category:           'Internship',
  model_name:              'XGBoost',
}

function ScoreBar({ value, max = 100 }) {
  const pct = (value / max) * 100
  const color = pct >= 70 ? '#40855d' : pct >= 40 ? '#d67d3a' : '#dc2626'
  return (
    <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function PredictPage() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    setResult(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload = {
        ...form,
        leadTimeHours: Number(form.leadTimeHours),
        hasAgenda: Boolean(form.hasAgenda),
        isFirstSession: Boolean(form.isFirstSession),
        prior_sessions: Number(form.prior_sessions),
        mentor_experience_years: Number(form.mentor_experience_years),
        model_name: form.model_name,
      }

      const { data } = await api.post('/predict', payload)
      setResult(data)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  const isEffective = result?.prediction === 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          U-CS 5 · Pre-Session Predictor (Zero Target Leakage · Synthetic Dataset)
        </div>
        <h1 className="section-title">🧠 Pre-Session Effectiveness Predictor</h1>
        <p className="section-sub">
          Predict whether an upcoming session will be effective <strong>before it takes place</strong> using pre-session readiness and TreeSHAP attributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Core U-CS 5 Pre-Session Features */}
          <div>
            <p className="field-label mb-2">U-CS 5 Pre-Session Readiness Inputs (X)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-[10px]">Lead Time (Hours Before Start)</label>
                <input
                  type="number"
                  className="field-input text-xs"
                  min={0}
                  max={336}
                  value={form.leadTimeHours}
                  onChange={(e) => set('leadTimeHours', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label text-[10px]">Agenda Submitted?</label>
                <select
                  className="field-input text-xs"
                  value={form.hasAgenda ? 'true' : 'false'}
                  onChange={(e) => set('hasAgenda', e.target.value === 'true')}
                >
                  <option value="true">Yes — Structured Agenda</option>
                  <option value="false">No — Missing Agenda</option>
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">First Session Together?</label>
                <select
                  className="field-input text-xs"
                  value={form.isFirstSession ? 'true' : 'false'}
                  onChange={(e) => {
                    const isFirst = e.target.value === 'true'
                    set('isFirstSession', isFirst)
                    if (isFirst) set('prior_sessions', 0)
                  }}
                >
                  <option value="false">No — Returning Dyad</option>
                  <option value="true">Yes — Initial Meeting</option>
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Prior Sessions Completed</label>
                <input
                  type="number"
                  className="field-input text-xs"
                  min={0}
                  max={20}
                  value={form.prior_sessions}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    set('prior_sessions', val)
                    set('isFirstSession', val === 0)
                  }}
                />
              </div>
              <div>
                <label className="field-label text-[10px]">Mentor Experience (Years)</label>
                <input
                  type="number"
                  className="field-input text-xs"
                  min={1}
                  max={40}
                  value={form.mentor_experience_years}
                  onChange={(e) => set('mentor_experience_years', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label text-[10px]">Mentor Availability</label>
                <select
                  className="field-input text-xs"
                  value={form.mentor_availability}
                  onChange={(e) => set('mentor_availability', e.target.value)}
                >
                  {['High', 'Medium', 'Low'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Pre-Session Profile & Dyad Context */}
          <div>
            <p className="field-label mb-2">Dyad & Booking Context</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-[10px]">Career Stage</label>
                <select
                  className="field-input text-xs"
                  value={form.career_stage}
                  onChange={(e) => set('career_stage', e.target.value)}
                >
                  {['Year1', 'Year2', 'Year3', 'Year4', 'Graduate', 'EarlyCareer'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Session Type</label>
                <select
                  className="field-input text-xs"
                  value={form.session_type}
                  onChange={(e) => set('session_type', e.target.value)}
                >
                  {['Career Guidance', 'CV Review', 'Interview Preparation', 'Technical Coaching', 'Networking'].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Platform</label>
                <select
                  className="field-input text-xs"
                  value={form.meeting_platform}
                  onChange={(e) => set('meeting_platform', e.target.value)}
                >
                  {['Teams', 'Zoom', 'Meet', 'Physical'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Goal Category</label>
                <select
                  className="field-input text-xs"
                  value={form.goal_category}
                  onChange={(e) => set('goal_category', e.target.value)}
                >
                  {[
                    'Internship',
                    'Portfolio Development',
                    'Technical Skills',
                    'Career Transition',
                    'Leadership',
                    'Research',
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Model selector */}
          <div>
            <label className="field-label">Model / Baseline Selector</label>
            <select
              className="field-input"
              value={form.model_name}
              onChange={(e) => set('model_name', e.target.value)}
            >
              {['XGBoost', 'Decision Tree', 'AdaBoost', 'Random Forest', 'Heuristic Baseline'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner mr-2" />
                Running Pre-Session Inference…
              </>
            ) : (
              'Predict Session Value Beforehand'
            )}
          </button>
        </form>

        {/* ── Result panel ── */}
        <div className="flex flex-col gap-4">
          {!result && !loading && (
            <div className="card p-10 text-center text-slate2-400 flex flex-col items-center gap-3 h-full justify-center">
              <div className="text-5xl">🤖</div>
              <p className="font-semibold text-slate2-600">Configure pre-session inputs and click Predict</p>
              <p className="text-xs">
                Evaluates strictly pre-session features (`leadTimeHours`, `hasAgenda`, `isFirstSession`, `mentor_experience`, `prior_sessions`) without post-session leakage.
              </p>
            </div>
          )}

          {loading && (
            <div className="card p-10 text-center flex flex-col items-center gap-4 h-full justify-center">
              <span className="spinner w-10 h-10 border-4" />
              <p className="text-sm text-slate2-500">Running pre-session inference…</p>
            </div>
          )}

          {result && (
            <div className="card p-6 flex flex-col gap-5">
              {/* Verdict */}
              <div
                className={`rounded-xl p-5 text-center ${
                  isEffective ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="text-4xl mb-2">{isEffective ? '✅' : '⚠️'}</div>
                <div className={`font-extrabold text-xl ${isEffective ? 'text-green-800' : 'text-red-800'}`}>
                  {result.status}
                </div>
                <p className="text-sm text-slate2-500 mt-1">
                  {(result.effectiveness_probability * 100).toFixed(1)}% probability · {result.model_used} · Synthetic Data
                </p>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-slate2-500 mb-1.5">
                  <span>Predicted effectiveness probability</span>
                  <span className="font-bold">{(result.effectiveness_probability * 100).toFixed(1)}%</span>
                </div>
                <ScoreBar value={result.effectiveness_probability * 100} max={100} />
              </div>

              {/* Suggested Intervention */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                💡 <strong>Suggested Intervention:</strong> {result.recommendation}
              </div>

              {/* SHAP contributions */}
              {result.feature_contributions?.length > 0 && (
                <div>
                  <p className="field-label">TreeSHAP Pre-Session Feature Drivers</p>
                  <div className="flex flex-col gap-2.5 mt-1.5">
                    {result.feature_contributions.slice(0, 6).map((f, i) => {
                      const val = typeof f === 'object' ? f.shap_value ?? f.contribution ?? 0 : f
                      const name = typeof f === 'object' ? f.feature ?? f.name ?? `Feature ${i + 1}` : `Feature ${i + 1}`
                      const pos = val >= 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-slate2-500 w-44 truncate shrink-0">{name}</span>
                          <div className="flex-1 h-2 bg-slate2-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(Math.abs(val) * 30, 100)}%`,
                                background: pos ? '#40855d' : '#dc2626',
                              }}
                            />
                          </div>
                          <span className={`font-bold w-12 text-right ${pos ? 'text-green-700' : 'text-red-700'}`}>
                            {val > 0 ? '+' : ''}
                            {Number(val).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Risk factors */}
              {result.risk_factors?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-800 mb-1.5">Pre-Session Risk Factors</p>
                  <ul className="text-xs text-amber-700 space-y-0.5">
                    {result.risk_factors.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
