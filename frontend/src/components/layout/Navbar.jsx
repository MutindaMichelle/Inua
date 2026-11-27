/**
 * INUA Navigation Layout:
 * - Public visitors see the modern horizontal navigation bar with the custom Inua logo.
 * - Authenticated users see the bespoke, non-generic left sidebar + contextual top navbar.
 */
import React from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials } from '../../utils/helpers'
import InuaLogo from '../common/InuaLogo'

const PAGE_DETAILS = {
  '/mentors': {
    title: 'Mentee Dashboard',
    subtitle: 'Browse vetted industry advisors and book focused 1-on-1 mentorship sessions',
    category: 'Directory',
  },
  '/sessions': {
    title: 'Sessions & Structured Feedback',
    subtitle: 'Review scheduled meetings, shared discussion agendas, and mutual feedback',
    category: 'Collaboration',
  },
  '/goals': {
    title: 'Career Goals & Milestones',
    subtitle: 'Track your professional targets, milestone velocity, and capability growth',
    category: 'Progress',
  },
  '/predict': {
    title: 'Session Readiness & Forecast',
    subtitle: 'Pre-session effectiveness diagnostic and explainable preparation tips',
    category: 'Advisory',
  },
  '/advisory': {
    title: 'Mentorship Advisory Channel',
    subtitle: 'Direct, informal guidance channel between student and mentor without email friction',
    category: 'Communication',
  },
  '/mentor/goals': {
    title: 'Mentee Goals & Development Tracker',
    subtitle: 'Track milestone completion, goal velocity, and feedback across assigned students',
    category: 'Development',
  },
  '/profile': {
    title: 'Profile & Account Settings',
    subtitle: 'Manage your academic details, career objectives, and mentorship preferences',
    category: 'Account',
  },
  '/mentor/sessions': {
    title: 'Mentorship Sessions',
    subtitle: 'Review mentee booking requests, confirm dates, and log session reflections',
    category: 'Engagement',
  },
  '/mentor/quality': {
    title: 'Mentor Performance & Quality',
    subtitle: 'Review your guidance reliability score, student ratings, and cohort impact',
    category: 'Quality Hub',
  },
  '/admin/overview': {
    title: 'Strathmore Mentorship Command',
    subtitle: 'University cohort engagement, matching telemetry, and platform operations',
    category: 'Administration',
  },
  '/admin/mentors': {
    title: 'Mentor Accreditation & Audits',
    subtitle: 'Verify professional credentials, industry experience, and mentor applications',
    category: 'Accreditation',
  },
}

export default function Navbar({ children }) {
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    toast('Signed out successfully.', 'info')
    navigate('/')
  }

  const role = user?.role
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isPublicLanding = location.pathname === '/'

  if (isAuthPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC NAVBAR (Landing page or unauthenticated state)
  // ─────────────────────────────────────────────────────────────
  if (isPublicLanding || !isAuthenticated) {
    const roleHome =
      role === 'mentee'
        ? '/mentors'
        : role === 'mentor'
        ? '/mentor/sessions'
        : role === 'administrator' || role === 'admin'
        ? '/admin/overview'
        : '/login'

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="no-underline">
              <InuaLogo size={36} showText={true} subtitle="Strathmore Mentorship" />
            </Link>

            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <a href="#premise" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#features" className="hover:text-slate-900 transition-colors">Platform Features</a>
              <a href="#journey" className="hover:text-slate-900 transition-colors">Pathways</a>
              <a href="#community" className="hover:text-slate-900 transition-colors">Sectors</a>
              <a href="#insights" className="hover:text-slate-900 transition-colors">Diagnostics</a>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={roleHome}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
                  >
                    Open Workspace →
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
                  >
                    Find a Mentor
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATED APP WORKSPACE (Distinctive Sidebar + Topbar)
  // ─────────────────────────────────────────────────────────────
  const hubSubtitle =
    role === 'mentee'
      ? 'Student Mentee'
      : role === 'mentor'
      ? 'Industry Guide'
      : 'Strathmore Admin'

  const activePage = PAGE_DETAILS[location.pathname] || {
    title: 'Workspace',
    subtitle: 'Strathmore Career Mentorship Ecosystem',
    category: 'Portal',
  }

  const navItemClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-amber-500/15 via-slate-800/60 to-transparent text-amber-300 font-semibold border-l-2 border-amber-500 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }`

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* ── Left Sidebar (Bespoke Dark Navy & Slate) ── */}
      <aside className="w-64 bg-[#090E1A] text-white flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen border-r border-slate-800/60 z-30">
        <div className="p-5 flex-1 flex flex-col overflow-y-auto">
          {/* Logo Header */}
          <Link to="/" className="mb-6 block no-underline">
            <InuaLogo
              size={36}
              showText={true}
              subtitle={hubSubtitle}
              light={true}
            />
          </Link>

          {/* Navigation Links by Logical Groups */}
          <div className="space-y-6">
            {/* Group 1: Core Navigation */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3.5 mb-2">
                Workspace
              </div>
              <nav className="space-y-1">
                {role === 'mentee' && (
                  <>
                    <NavLink to="/mentors" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Find Mentors</span>
                    </NavLink>
                    <NavLink to="/sessions" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>My Sessions</span>
                    </NavLink>
                    <NavLink to="/goals" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Goal Progression</span>
                    </NavLink>
                    <NavLink to="/advisory" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="flex-1 flex items-center justify-between">
                        <span>Advisory Channel</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    </NavLink>
                  </>
                )}

                {role === 'mentor' && (
                  <>
                    <NavLink to="/mentor/goals" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Mentee Goals</span>
                    </NavLink>
                    <NavLink to="/advisory" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="flex-1 flex items-center justify-between">
                        <span>Advisory Channel</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    </NavLink>
                    <NavLink to="/mentor/sessions" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Session Bookings</span>
                    </NavLink>
                    <NavLink to="/mentor/quality" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Mentor Quality Hub</span>
                    </NavLink>
                  </>
                )}

                {(role === 'administrator' || role === 'admin') && (
                  <>
                    <NavLink to="/admin/overview" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Cohort Overview</span>
                    </NavLink>
                    <NavLink to="/admin/mentors" className={navItemClass}>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Mentor Verification</span>
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            {/* Group 2: Intelligence & Guidance */}
            {role === 'mentee' && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3.5 mb-2">
                  Guidance & Outcomes
                </div>
                <nav className="space-y-1">
                  <NavLink to="/predict" className={navItemClass}>
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="flex-1 flex items-center justify-between">
                      <span>Session Readiness</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AI Guide
                      </span>
                    </div>
                  </NavLink>
                </nav>
              </div>
            )}

            {/* Group 3: Account Settings */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3.5 mb-2">
                Preferences
              </div>
              <nav className="space-y-1">
                <NavLink to="/profile" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile</span>
                </NavLink>
              </nav>
            </div>
          </div>

          {/* Contextual Mentorship Card (Replaces the empty void) */}
          <div className="mt-auto pt-6">
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/50 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Strathmore Cohort
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-snug mb-2">
                {role === 'mentee'
                  ? 'BICS Year 4 · Career Development Services'
                  : role === 'mentor'
                  ? 'Industry Guide · Safaricom Partnership'
                  : 'Faculty Administration Portal'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Active 2026 Term</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── User Profile Footer & Sign Out ── */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070B14]">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {hubSubtitle}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/50 hover:bg-red-500/15 hover:text-red-300 border border-slate-700/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Body with Modern Top Header ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 min-h-[4.25rem] px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              <span>{activePage.category}</span>
              <span>/</span>
              <span className="text-amber-600 font-bold">{activePage.title}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              {activePage.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              {activePage.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            {role === 'mentee' && (
              <Link
                to="/mentors"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors no-underline"
              >
                <span>📅</span> Book Session
              </Link>
            )}

            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Strathmore CDS Live</span>
            </div>

            <button
              type="button"
              onClick={() => toast('All mentorship session telemetry and data synchronization are healthy.', 'info')}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="System Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
