/**
 * INUA Predict Page — mentee view: manual AI effectiveness scorer.
 * Allows the mentee to submit raw session features and get a live XGBoost prediction.
 */
import React, { useState } from 'react'
import api from '../../api/client'
import { apiError } from '../../utils/helpers'

const DEFAULTS = {
  career_stage:              'Year4',
  field_of_study:            'Computer Science',
  career_interest:           'Software Engineering',
  prior_sessions:            3,
  mentor_experience_years:   8,
  mentor_industry:           'Technology',
  mentor_specialization:     'Backend Engineering',
  mentor_availability:       'High',
  session_type:              'Career Guidance',
  session_duration_minutes:  60,
  attendance_status:         'Attended',
  meeting_platform:          'Teams',
  goal_category:             'Internship',
  career_support_score:      4,
  psychosocial_support_score: 4,
  communication_quality:     4,
  goal_progress_score:       4,
  confidence_growth_score:   4,
  mentor_responsiveness_score: 5,
  model_name:                'XGBoost',
}

const SLIDER_FIELDS = [
  ['career_support_score',       'Career Support',         1, 5],
  ['psychosocial_support_score', 'Psychosocial Support',   1, 5],
  ['communication_quality',      'Communication Quality',  1, 5],
  ['goal_progress_score',        'Goal Progress',          1, 5],
  ['confidence_growth_score',    'Confidence Growth',      1, 5],
  ['mentor_responsiveness_score','Mentor Responsiveness',  1, 5],
]

function ScoreBar({ value, max = 5 }) {
  const pct = (value / max) * 100
  const color = pct >= 70 ? '#40855d' : pct >= 40 ? '#d67d3a' : '#dc2626'
  return (
    <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function PredictPage() {
  const [form,    setForm]    = useState(DEFAULTS)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); setResult(null); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const payload = { ...form, model_name: form.model_name }
      // Convert numeric strings
      ;['prior_sessions','mentor_experience_years','session_duration_minutes',
        'career_support_score','psychosocial_support_score','communication_quality',
        'goal_progress_score','confidence_growth_score','mentor_responsiveness_score',
      ].forEach((k) => { payload[k] = Number(payload[k]) })

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
        <h1 className="section-title">🧠 AI Session Score</h1>
        <p className="section-sub">
          Adjust the session parameters below and get an XGBoost effectiveness prediction with TreeSHAP explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

          {/* Context fields */}
          <div>
            <p className="field-label mb-2">Session Context</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-[10px]">Career Stage</label>
                <select className="field-input text-xs" value={form.career_stage}
                  onChange={(e) => set('career_stage', e.target.value)}>
                  {['Year1','Year2','Year3','Year4','Graduate','EarlyCareer'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Session Type</label>
                <select className="field-input text-xs" value={form.session_type}
                  onChange={(e) => set('session_type', e.target.value)}>
                  {['Career Guidance','CV Review','Interview Preparation','Technical Coaching','Networking'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Platform</label>
                <select className="field-input text-xs" value={form.meeting_platform}
                  onChange={(e) => set('meeting_platform', e.target.value)}>
                  {['Teams','Zoom','Meet','Physical'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Attendance</label>
                <select className="field-input text-xs" value={form.attendance_status}
                  onChange={(e) => set('attendance_status', e.target.value)}>
                  {['Attended','Rescheduled','Cancelled'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label text-[10px]">Duration (min)</label>
                <input type="number" className="field-input text-xs" min={15} max={180}
                  value={form.session_duration_minutes}
                  onChange={(e) => set('session_duration_minutes', e.target.value)} />
              </div>
              <div>
                <label className="field-label text-[10px]">Prior Sessions</label>
                <input type="number" className="field-input text-xs" min={0} max={20}
                  value={form.prior_sessions}
                  onChange={(e) => set('prior_sessions', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Score sliders */}
          <div>
            <p className="field-label mb-3">Session Quality Scores (1 – 5)</p>
            <div className="flex flex-col gap-4">
              {SLIDER_FIELDS.map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-semibold text-slate2-600">{label}</label>
                    <span className="text-sm font-bold text-sage-700">{form[key]}</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} className="w-full accent-sage-600"
                    value={form[key]} onChange={(e) => set(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Model selector */}
          <div>
            <label className="field-label">Classifier</label>
            <select className="field-input" value={form.model_name}
              onChange={(e) => set('model_name', e.target.value)}>
              {['XGBoost','Random Forest','AdaBoost'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <><span className="spinner mr-2" />Running inference…</> : 'Predict Session Effectiveness'}
          </button>
        </form>

        {/* ── Result panel ── */}
        <div className="flex flex-col gap-4">
          {!result && !loading && (
            <div className="card p-10 text-center text-slate2-400 flex flex-col items-center gap-3 h-full justify-center">
              <div className="text-5xl">🤖</div>
              <p className="font-semibold text-slate2-600">Set parameters and click Predict</p>
              <p className="text-xs">The XGBoost model will score the session and explain the key drivers.</p>
            </div>
          )}

          {loading && (
            <div className="card p-10 text-center flex flex-col items-center gap-4 h-full justify-center">
              <span className="spinner w-10 h-10 border-4" />
              <p className="text-sm text-slate2-500">Running XGBoost inference…</p>
            </div>
          )}

          {result && (
            <div className="card p-6 flex flex-col gap-5">
              {/* Verdict */}
              <div className={`rounded-xl p-5 text-center ${isEffective ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="text-4xl mb-2">{isEffective ? '✅' : '⚠️'}</div>
                <div className={`font-extrabold text-xl ${isEffective ? 'text-green-800' : 'text-red-800'}`}>
                  {result.status}
                </div>
                <p className="text-sm text-slate2-500 mt-1">
                  {(result.effectiveness_probability * 100).toFixed(1)}% confidence · {result.model_used}
                </p>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-slate2-500 mb-1.5">
                  <span>Effectiveness probability</span>
                  <span className="font-bold">{(result.effectiveness_probability * 100).toFixed(1)}%</span>
                </div>
                <ScoreBar value={result.effectiveness_probability * 100} max={100} />
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                💡 {result.recommendation}
              </div>

              {/* SHAP contributions */}
              {result.feature_contributions?.length > 0 && (
                <div>
                  <p className="field-label">TreeSHAP Feature Drivers</p>
                  <div className="flex flex-col gap-2.5 mt-1.5">
                    {result.feature_contributions.slice(0, 6).map((f, i) => {
                      const val  = typeof f === 'object' ? f.shap_value ?? f.contribution ?? 0 : f
                      const name = typeof f === 'object' ? f.feature ?? f.name ?? `Feature ${i + 1}` : `Feature ${i + 1}`
                      const pos  = val >= 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-slate2-500 w-44 truncate shrink-0">{name}</span>
                          <div className="flex-1 h-2 bg-slate2-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(Math.abs(val) * 30, 100)}%`,
                              background: pos ? '#40855d' : '#dc2626',
                            }} />
                          </div>
                          <span className={`font-bold w-10 text-right ${pos ? 'text-green-700' : 'text-red-700'}`}>
                            {val > 0 ? '+' : ''}{Number(val).toFixed(2)}
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
                  <p className="text-xs font-bold text-amber-800 mb-1.5">Risk Factors Detected</p>
                  <ul className="text-xs text-amber-700 space-y-0.5">
                    {result.risk_factors.map((r, i) => <li key={i}>• {r}</li>)}
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
