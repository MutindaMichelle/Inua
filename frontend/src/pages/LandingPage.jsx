/**
 * INUA Landing Page — faithfully implements design/wireframes/inua-public-homepage.png
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PREMISE_STEPS = [
  {
    num: '01',
    title: 'Set Your Direction',
    desc: 'Construct detailed technical paths, outline core competencies, and assign metric goals for clear-sighted career benchmarks.',
  },
  {
    num: '02',
    title: 'Find Guidance',
    desc: 'Discover and sync with validated Kenyan and global senior engineers, product leaders, and industry executives.',
  },
  {
    num: '03',
    title: 'Measure Your Growth',
    desc: 'Convert actual conversational insights and structured advisor score reviews into tangible XGBoost & TreeSHAP progression graphs.',
  },
]

const PLATFORM_FEATURES = [
  {
    title: 'Find a Mentor',
    desc: 'Discover experienced career leads vetted against system architecture, software engineering, and product management.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Book Sessions',
    desc: 'Easily coordinate sessions, check overlap conflicts automatically, and manage live bookings directly inside the scheduler.',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'Set Career Goals',
    desc: 'Document detailed, structured paths based on real industry demands — ensuring every interaction focuses on tangible output.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Track Progress',
    desc: 'Review live milestones, record session outputs, and trace real-time self-efficacy score improvements over active cycles.',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
  {
    title: 'Measure Effectiveness',
    desc: 'Deploy precise, XGBoost-backed feedback indicators with TreeSHAP explanations to confirm knowledge transition.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'View Insights',
    desc: 'Access your dashboard’s aggregated ratings, longitudinal mentor quality profiles, and platform-wide trend signals.',
    icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
  },
]

const JOURNEY_STEPS = [
  { step: '1', title: 'Set Your Goals', sub: 'Identify critical milestones and skills needs.' },
  { step: '2', title: 'Find Guidance', sub: 'Browse pre-vetted specialists in Nairobi.' },
  { step: '3', title: 'Have a Session', sub: 'Connect live and map real-world action paths.' },
  { step: '4', title: 'Reflect & Track', sub: 'Submit structured evaluation inputs.' },
  { step: '5', title: 'Measure & Advance', sub: 'Optimize metrics and claim success signals.' },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()

  function roleHome() {
    if (!user) return '/login'
    if (user.role === 'mentee') return '/mentors'
    if (user.role === 'mentor') return '/mentor/quality'
    if (user.role === 'administrator' || user.role === 'admin') return '/admin/overview'
    return '/login'
  }

  return (
    <div className="bg-white text-slate-900">
      {/* ═══ HERO SECTION ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-5">
              Kenyan Tech & Career Hub
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#0B1324]">
              Grow with Purpose.
              <span className="block text-[#0F766E] mt-1">Build Your Future.</span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mt-5 max-w-lg">
              Connecting Kenyan talent with guidance that moves careers forward. INUA delivers
              structured, metrics-backed mentorship for engineers, builders, and modern leaders.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              {isAuthenticated ? (
                <Link
                  to={roleHome()}
                  className="px-6 py-3 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
                >
                  Go to Your Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
                  >
                    Find a Mentor
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-lg text-xs font-bold bg-[#0B1324] hover:bg-slate-800 text-white transition-all"
                  >
                    Become a Mentor
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 mt-7 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                Vetted Industry Advisors
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                Live Matching & Progress Sync
              </span>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#0B1324] via-[#16233B] to-[#0F766E] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    LIVE SESSION DIAGNOSTICS
                  </div>
                  <div className="text-lg font-extrabold mt-0.5">Strathmore Mentorship Cohort</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  96.8% XGBoost Accuracy
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="text-[11px] text-slate-300">Goal Milestones</div>
                  <div className="text-2xl font-extrabold mt-1">4 / 6</div>
                  <div className="text-[11px] text-emerald-300 mt-1">On Track · +18% self-efficacy</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="text-[11px] text-slate-300">Predicted Outcome</div>
                  <div className="text-2xl font-extrabold text-emerald-300 mt-1">0.94</div>
                  <div className="text-[11px] text-slate-300 mt-1">Highly Effective Session</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 text-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">TreeSHAP Top Outcome Drivers</span>
                  <span className="text-[11px] font-bold text-[#0F766E]">0.995 ROC-AUC</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Communication Fidelity</span>
                      <span className="text-[#0F766E]">94% (+1.58)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#0F766E] rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Goal Progress Speed</span>
                      <span className="text-[#D97706]">88% (+1.34)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#D97706] rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE INUA PREMISE ═══ */}
      <section id="premise" className="bg-[#F8FAFC] py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
            <div className="lg:col-span-6">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-3">
                The Inua Premise
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1324] leading-snug">
                Intelligent mentorship designed to lift Kenyan careers forward.
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Traditional mentorship is unstructured and hard to track. INUA resolves this by
                introducing metrics, objective milestones, and automated XGBoost feedback loop
                systems — providing complete transparency into how guidance affects growth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PREMISE_STEPS.map((s) => (
              <div key={s.num} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div className="text-2xl font-extrabold text-[#0F766E] mb-3">{s.num}</div>
                <h3 className="text-sm font-bold text-[#0B1324] mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM FEATURES ═══ */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-2">
            Platform Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1324]">
            Everything You Need to Move Forward
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            A metrics-driven platform built directly for talent mapping and modern skill transfers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200/80 p-6 hover:border-[#0F766E]/40 hover:shadow-md transition-all bg-white"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E0F2F1] text-[#0F766E] flex items-center justify-center mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#0B1324] mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ YOUR JOURNEY WITH INUA ═══ */}
      <section id="journey" className="bg-[#F8FAFC] py-14 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-2">
            Your Route
          </span>
          <h2 className="text-2xl font-extrabold text-[#0B1324] mb-10">Your Journey with Inua</h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {JOURNEY_STEPS.map((j) => (
              <div key={j.step} className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-[#0B1324] text-white font-bold text-xs flex items-center justify-center mb-3 shadow">
                  {j.step}
                </div>
                <div className="text-xs font-bold text-[#0B1324]">{j.title}</div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[160px]">{j.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTORS WE SERVE (3 PERSONAS) ═══ */}
      <section id="community" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-2">
            Sectors We Serve
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1324]">
            Built for the Mentorship Community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mentees */}
          <div className="rounded-2xl border border-slate-200 p-6 flex flex-col justify-between bg-white shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Grow Talent
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#0B1324] mb-2">Mentees</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Take command of your career growth. Benchmark your skills, connect with vetted
                guides, and prove capability through clear results.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Build structured career goals</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Book verified technical sessions</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Track AI effectiveness milestones</li>
              </ul>
            </div>
            <Link to="/login" className="inline-block text-center py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-bold text-[#0B1324] hover:bg-slate-50">
              Find a Mentor
            </Link>
          </div>

          {/* Mentors */}
          <div className="rounded-2xl border border-slate-200 p-6 flex flex-col justify-between bg-white shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Share Impact
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#0B1324] mb-2">Mentors</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Scale your guidance and verify your capability. Mentor upcoming engineers with
                transparent dashboard outputs.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Vetted profile credentials</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Flexible schedule conflict guards</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Longitudinal quality report feedback</li>
              </ul>
            </div>
            <Link to="/login" className="inline-block text-center py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-bold text-[#0B1324] hover:bg-slate-50">
              Open Mentor Hub
            </Link>
          </div>

          {/* Administrators */}
          <div className="rounded-2xl border border-slate-200 p-6 flex flex-col justify-between bg-white shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center font-bold text-xs">
                  03
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Manage Groups
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#0B1324] mb-2">Administrators</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Oversee university and institutional mentorship cycles. Administer, evaluate
                performance signals, and audit mentor quality rankings.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Platform analytics dashboards</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Active flagged session checks</li>
                <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Comprehensive mentor rankings</li>
              </ul>
            </div>
            <Link to="/login" className="inline-block text-center py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-bold text-[#0B1324] hover:bg-slate-50">
              Open Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ LIVE DASHBOARD SYNC PREVIEW ═══ */}
      <section id="insights" className="bg-[#F8FAFC] py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2F1] text-[#0F766E] mb-3">
              Live Dashboard Sync
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1324] leading-snug mb-3">
              From Mentorship to Meaningful Growth
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              INUA connects session results, structured mentor evaluations, and career target
              indicators to construct concrete performance profiles.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-[#0F766E]">✓</span> 96.8% XGBoost Classification Accuracy
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#0F766E]">✓</span> Real-time TreeSHAP Goal Progress Calibration
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ACTIVE MENTEE PROFILE
                  </div>
                  <div className="text-base font-extrabold text-[#0B1324]">Michelle Mutinda</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2F1] text-[#0F766E]">
                  0.94 Overall Match
                </span>
              </div>
              <div className="text-xs font-bold text-slate-500 mb-3">Current Target Progress</div>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#0B1324]">Technical Systems Architecture</span>
                    <span className="text-[#0F766E]">0.90 Rating</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#0F766E] rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#0B1324]">ML & Full-Stack Capstone Readiness</span>
                    <span className="text-[#D97706]">0.85 Rating</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#D97706] rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DARK NAVY TRUST & SECURITY BAND ═══ */}
      <section className="bg-[#0B1324] text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#0F766E]/30 text-emerald-300 mb-3">
              Trust & Security
            </span>
            <h3 className="text-2xl font-extrabold leading-snug mb-3">
              We Prioritize Reassurance, Quality, and Safe Growth.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Designed in compliance with the Kenya Data Protection Act (2019). We ensure certified
              identity validation, role-based access isolation, and verified advisor backgrounds.
            </p>
          </div>
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-white/10 text-emerald-300 flex items-center justify-center font-bold shrink-0">✓</span>
              <div>
                <div className="font-bold text-white">100% Vetted Identity</div>
                <div className="text-slate-400 mt-0.5">Every advisor on INUA is verified with official credentials and proven industry backgrounds.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-white/10 text-emerald-300 flex items-center justify-center font-bold shrink-0">✓</span>
              <div>
                <div className="font-bold text-white">JWT & Bcrypt Encrypted Action Protocols</div>
                <div className="text-slate-400 mt-0.5">Structured logs, ratings, and program summaries are strictly isolated by role.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COLLECTIVE IMPACT STATS ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          <div>
            <div className="text-3xl font-extrabold text-[#D97706]">2,000+</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Modeled Mentorship Sessions</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#D97706]">96.8%</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">XGBoost Classifier Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#D97706]">0.995</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">ROC-AUC Discrimination</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#D97706]">18</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Psychometric & Dyad Features</div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <footer className="bg-[#0B1324] text-white py-14 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#0F766E]/30 text-emerald-300 mb-3">
            Start Today
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to lift your career forward?
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-7">
            Connect with trusted advisors, benchmark your technical capability, and accelerate your
            career milestone results starting today.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all"
            >
              Find a Mentor
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-lg text-xs font-bold border border-slate-700 hover:bg-slate-800 text-white transition-all"
            >
              Become an Advisor
            </Link>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            © 2026 INUA Platform · Mutinda Michelle Mutio (154727) · Strathmore University
          </div>
        </div>
      </footer>
    </div>
  )
}
