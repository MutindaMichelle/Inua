/**
 * INUA Landing Page — public home page shown to unauthenticated visitors.
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: '🤝',
    title: 'Smart Mentor Matching',
    desc:  'Discover industry-verified mentors aligned with your field of study and career interests.',
  },
  {
    icon: '📅',
    title: 'Session Booking',
    desc:  'Book structured mentorship sessions with automatic conflict detection and lifecycle tracking.',
  },
  {
    icon: '🧠',
    title: 'AI Effectiveness Score',
    desc:  'After each session, our XGBoost model predicts outcome effectiveness and explains the key drivers via TreeSHAP.',
  },
  {
    icon: '📊',
    title: 'Quality Profiles',
    desc:  'Mentors build longitudinal quality profiles based on student feedback and AI evaluations.',
  },
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()

  function roleHome() {
    if (!user) return '/login'
    if (user.role === 'mentee')        return '/mentors'
    if (user.role === 'mentor')        return '/mentor/sessions'
    if (user.role === 'administrator') return '/admin/overview'
    return '/login'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 text-4xl"
          style={{ background: 'linear-gradient(135deg,#40855d,#2f6847)' }}
        >
          <span>🌱</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate2-900 mb-4">
          INUA Mentorship Platform
        </h1>
        <p className="text-lg text-slate2-500 max-w-2xl mx-auto leading-relaxed">
          Supporting career mentorship outcomes among university students and
          early-career professionals in Kenya — powered by XGBoost AI.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          {isAuthenticated ? (
            <Link to={roleHome()} className="btn-primary px-7 py-3 text-base">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary px-7 py-3 text-base">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-slate2-900 mb-1">{f.title}</h3>
            <p className="text-sm text-slate2-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Research note */}
      <div className="card p-6 border-l-4 border-sage-400 bg-sage-50">
        <p className="text-sm text-sage-800 leading-relaxed">
          <strong>Research context:</strong> INUA is a Strathmore University BICS Year 4
          capstone project by Michelle Mutinda. The XGBoost classifier (96.8% accuracy,
          0.995 ROC-AUC) is trained on a 2,000-session synthetic dataset grounded in
          Kram's Mentoring Theory (1985) and Bandura's Social Cognitive Theory (1997).
        </p>
      </div>
    </div>
  )
}
