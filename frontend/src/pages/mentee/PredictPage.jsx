/**
 * INUA Pre-Session Readiness & Success Diagnostic (U-CS 5)
 * Spacious, accessible, human-first guidance for students before meeting their mentor.
 */
import React, { useState } from 'react'
import api from '../../api/client'
import { apiError } from '../../utils/helpers'

const DEFAULTS = {
  leadTimeHours: 48,
  hasAgenda: true,
  isFirstSession: false,
  prior_sessions: 3,
  mentor_experience_years: 8,
  career_stage: 'Year4',
  field_of_study: 'Computer Science',
  career_interest: 'Software Engineering',
  mentor_industry: 'Technology',
  mentor_specialization: 'Backend Engineering',
  mentor_availability: 'High',
  session_type: 'Interview Preparation',
  meeting_platform: 'Teams',
  goal_category: 'Internship',
  model_name: 'XGBoost',
}

function ScoreBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = pct >= 70 ? '#0F766E' : pct >= 40 ? '#D97706' : '#DC2626'
  return (
    <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function PredictPage() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

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
    <div className="max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          AI Session Preparation Assistant · Strathmore Mentorship Model
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Session Readiness & Success Diagnostic
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
          Evaluate how well-prepared your upcoming mentorship meeting is before it starts.
          Get personalized recommendations to avoid unproductive calls and make every minute count.
        </p>
      </div>

      {/* ── Friendly Accessible Guidance Banner ── */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/60 to-emerald-50/40 border border-amber-200/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-xl shrink-0 mt-0.5">
            💡
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Why Check Your Readiness Beforehand?</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
              Industry mentors from partners like <strong>Safaricom, Microsoft, and Equity Group</strong> volunteer their time.
              Mentorship calls with an agenda submitted 48h early are <strong>3x more likely</strong> to result in job referrals and internship breakthroughs.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-white/80 px-3 py-2 rounded-xl border border-amber-200/60">
          <span>⚡ Fast 1-Click Diagnostic</span>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Spacious Accessible Form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          {/* Section 1: Preparation Logistics */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Meeting Preparation & Notice
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Notice Lead Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Notice Given to Mentor (Hours in Advance)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    min={0}
                    max={336}
                    value={form.leadTimeHours}
                    onChange={(e) => set('leadTimeHours', e.target.value)}
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    hours
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  e.g., 48 hours = 2 full days before the session.
                </p>
              </div>

              {/* Discussion Agenda */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Have You Prepared a Discussion Agenda?
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.hasAgenda ? 'true' : 'false'}
                  onChange={(e) => set('hasAgenda', e.target.value === 'true')}
                >
                  <option value="true">✅ Yes — I have 2–3 questions prepared</option>
                  <option value="false">❌ No — I have not drafted questions yet</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Writing down questions in advance dramatically boosts success.
                </p>
              </div>

              {/* First Session */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Is This Your First Meeting with This Mentor?
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.isFirstSession ? 'true' : 'false'}
                  onChange={(e) => {
                    const isFirst = e.target.value === 'true'
                    set('isFirstSession', isFirst)
                    if (isFirst) set('prior_sessions', 0)
                  }}
                >
                  <option value="false">No — Follow-up meeting with returning mentor</option>
                  <option value="true">Yes — First time getting introduced</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Initial meetings typically focus on mutual introductions and goal alignment.
                </p>
              </div>

              {/* Prior Sessions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Previous Sessions Completed with This Mentor
                </label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  min={0}
                  max={20}
                  value={form.prior_sessions}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    set('prior_sessions', val)
                    set('isFirstSession', val === 0)
                  }}
                />
                <p className="text-[11px] text-slate-500">
                  Tracks relationship maturity and cadence.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Mentor & Meeting Focus */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Mentor Context & Meeting Focus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Mentor Experience */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mentor Industry Experience (Years)
                </label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  min={1}
                  max={40}
                  value={form.mentor_experience_years}
                  onChange={(e) => set('mentor_experience_years', e.target.value)}
                />
              </div>

              {/* Mentor Availability */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mentor Schedule Availability
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.mentor_availability}
                  onChange={(e) => set('mentor_availability', e.target.value)}
                >
                  <option value="High">High — Multiple open slots per week</option>
                  <option value="Medium">Medium — Standard weekly availability</option>
                  <option value="Low">Low — Limited slots (High demand)</option>
                </select>
              </div>

              {/* Session Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Session Type / Agenda Topic
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.session_type}
                  onChange={(e) => set('session_type', e.target.value)}
                >
                  {['Interview Preparation', 'CV Review', 'Technical Coaching', 'Career Guidance', 'Networking'].map(
                    (v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Goal Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Linked Career Goal
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
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
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Meeting Channel
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.meeting_platform}
                  onChange={(e) => set('meeting_platform', e.target.value)}
                >
                  <option value="Teams">Microsoft Teams</option>
                  <option value="Meet">Google Meet</option>
                  <option value="Zoom">Zoom Meeting</option>
                  <option value="Physical">In-Person (Strathmore Campus)</option>
                </select>
              </div>

              {/* Career Stage */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Your Current Academic Level
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  value={form.career_stage}
                  onChange={(e) => set('career_stage', e.target.value)}
                >
                  <option value="Year4">Year 4 (Final Year Undergrad)</option>
                  <option value="Year3">Year 3 (Internship Prep)</option>
                  <option value="Year2">Year 2 (Core Foundational)</option>
                  <option value="Year1">Year 1 (Freshman)</option>
                  <option value="Graduate">Recent Graduate</option>
                  <option value="EarlyCareer">Early Career Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Collapsible Defense & Examiner Benchmark Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>🔬</span>
                <span>Examiner & Model Benchmark Settings (Optional)</span>
              </span>
              <span className="text-slate-400 font-bold">{showAdvanced ? '▲ Hide' : '▼ View Model Config'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  During project evaluation, examiners can toggle between the champion <strong>XGBoost classifier</strong> and baseline algorithms to compare TreeSHAP feature attributions and accuracy metrics.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select ML Algorithm
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                    value={form.model_name}
                    onChange={(e) => set('model_name', e.target.value)}
                  >
                    {['XGBoost', 'Decision Tree', 'AdaBoost', 'Random Forest', 'Heuristic Baseline'].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner mr-2" />
                <span>Evaluating Readiness with XGBoost & TreeSHAP…</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Run Session Readiness Diagnostic</span>
              </>
            )}
          </button>
        </form>

        {/* ── Right Column: Diagnostic Outcome & Advice Panel ── */}
        <div className="lg:col-span-5 space-y-5">
          {!result && !loading && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mb-4">
                🎯
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Ready to Check Your Meeting Plan?
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-sm">
                Fill in your meeting notice time and agenda status on the left, then click <strong>"Run Session Readiness Diagnostic"</strong> to see your forecast.
              </p>

              <div className="mt-6 w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  What the system checks:
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Adequate advance preparation notice (24–48h)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Clear, written discussion questions</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Mentor industry & specialty compatibility</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center min-h-[460px]">
              <span className="spinner w-12 h-12 border-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 mt-4">
                Calculating Pre-Session Readiness…
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Extracting TreeSHAP feature attributions and evaluating against Strathmore mentorship historical records.
              </p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 animate-fadeIn">
              {/* Verdict Card */}
              <div
                className={`rounded-2xl p-6 text-center border ${
                  isEffective
                    ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-950'
                    : 'bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-200 text-amber-950'
                }`}
              >
                <div className="text-4xl mb-2">{isEffective ? '🎉' : '⚠️'}</div>
                <div className="font-black text-xl tracking-tight">
                  {isEffective ? 'High Likelihood of Success' : 'Meeting Requires More Preparation'}
                </div>
                <div className="text-xs font-semibold mt-1 opacity-80">
                  {(result.effectiveness_probability * 100).toFixed(1)}% Success Confidence · Powered by {result.model_used}
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Session Value Potential</span>
                  <span>{(result.effectiveness_probability * 100).toFixed(1)}%</span>
                </div>
                <ScoreBar value={result.effectiveness_probability * 100} max={100} />
              </div>

              {/* Actionable Human Advice Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <span>💡</span> Recommended Action for You:
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  {result.recommendation}
                </p>
              </div>

              {/* Key Factors Driving This Outcome */}
              {result.feature_contributions?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Key Preparation Factors
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Explainable Impact
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {result.feature_contributions.slice(0, 5).map((f, i) => {
                      const val = typeof f === 'object' ? f.shap_value ?? f.contribution ?? 0 : f
                      const name = typeof f === 'object' ? f.feature ?? f.name ?? `Factor ${i + 1}` : `Factor ${i + 1}`
                      const pos = val >= 0

                      // Translate technical feature name to human English
                      const friendlyLabels = {
                        hasAgenda: 'Discussion Agenda Prepared',
                        leadTimeHours: 'Advance Notice Given (Lead Time)',
                        mentor_experience_years: 'Mentor Industry Experience',
                        prior_sessions: 'Past Interaction Cadence',
                        isFirstSession: 'Relationship Orientation',
                        career_stage: 'Academic Stage Match',
                      }
                      const displayName = friendlyLabels[name] || name

                      return (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate mr-2">{displayName}</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[11px] shrink-0 ${
                              pos
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {pos ? '+ Positive Influence' : '− Needs Attention'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Potential Risk Checklist */}
              {result.risk_factors?.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <span>⚠️</span> Things to Double-Check Before the Call:
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4 font-medium">
                    {result.risk_factors.map((r, i) => (
                      <li key={i}>{r}</li>
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
