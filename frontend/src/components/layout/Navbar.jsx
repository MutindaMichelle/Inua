/**
 * INUA Navigation Layout:
 * - Public visitors see the top horizontal navigation bar.
 * - Authenticated users see the Dark Navy Left Sidebar + Top Header with Goal Progression
 *   and Profile Management screens exposed in the navigation hierarchy.
 */
import React from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials } from '../../utils/helpers'

const PAGE_TITLES = {
  '/mentors': 'MENTEE DASHBOARD & MENTOR DIRECTORY',
  '/sessions': 'MY SESSIONS & STRUCTURED FEEDBACK',
  '/goals': 'GOAL PROGRESSION & MILESTONE VELOCITY',
  '/predict': 'PRE-SESSION EFFECTIVENESS PREDICTOR (U-CS 5)',
  '/profile': 'PROFILE MANAGEMENT',
  '/mentor/sessions': 'MENTOR SESSIONS',
  '/mentor/quality': 'MENTOR DASHBOARD & QUALITY PROFILE',
  '/admin/overview': 'ADMIN DASHBOARD',
  '/admin/mentors': 'MENTOR ANALYTICS & AUDIT',
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
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-8 h-8 rounded-lg bg-[#D97706] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                I
              </div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">INUA</span>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <a href="#premise" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#features" className="hover:text-slate-900 transition-colors">Platform Features</a>
              <a href="#journey" className="hover:text-slate-900 transition-colors">Pathways</a>
              <a href="#community" className="hover:text-slate-900 transition-colors">Sectors</a>
              <a href="#insights" className="hover:text-slate-900 transition-colors">Insights</a>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={roleHome}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
                  >
                    Open Dashboard →
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm"
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

  const hubLabel =
    role === 'mentee'
      ? { title: 'INUA', sub: 'MENTEE HUB' }
      : role === 'mentor'
      ? { title: 'INUA', sub: 'SESSION HUB' }
      : { title: 'AdminPortal', sub: 'MANAGEMENT' }

  const roleLabel =
    role === 'mentee'
      ? 'Student Mentee'
      : role === 'mentor'
      ? 'Lead Mentor'
      : 'Platform Admin'

  const pageTitle = PAGE_TITLES[location.pathname] || 'INUA WORKSPACE'

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#1E293B] text-white shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/60'
    }`

  return (
    <div className="min-h-screen flex bg-[#F4F6F9]">
      {/* Dark Navy Left Sidebar */}
      <aside className="w-60 bg-[#0B1324] text-white flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-5">
          <Link to="/" className="flex items-center gap-3 mb-8 no-underline">
            <div className="w-9 h-9 rounded-xl bg-[#D97706] flex items-center justify-center text-white font-extrabold text-base shadow">
              I
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">{hubLabel.title}</div>
              <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
                {hubLabel.sub}
              </div>
            </div>
          </Link>

          <nav className="flex flex-col gap-1.5">
            {role === 'mentee' && (
              <>
                <NavLink to="/mentors" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Mentee Dashboard
                </NavLink>
                <NavLink to="/sessions" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Sessions & Feedback
                </NavLink>
                <NavLink to="/goals" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Goal Progression
                </NavLink>
                <NavLink to="/predict" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Pre-Session Predictor
                </NavLink>
                <NavLink to="/profile" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </NavLink>
              </>
            )}

            {role === 'mentor' && (
              <>
                <NavLink to="/mentor/quality" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Mentor Dashboard
                </NavLink>
                <NavLink to="/mentor/sessions" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Sessions
                </NavLink>
                <NavLink to="/profile" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </NavLink>
              </>
            )}

            {(role === 'administrator' || role === 'admin') && (
              <>
                <NavLink to="/admin/overview" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Admin Dashboard
                </NavLink>
                <NavLink to="/admin/mentors" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Mentor Analytics
                </NavLink>
                <NavLink to="/profile" className={navItemClass}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80">
          {user && (
            <Link to="/profile" className="flex items-center gap-3 mb-3 px-1 no-underline hover:opacity-90">
              <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{roleLabel}</div>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 bg-[#1E293B]/70 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 h-16 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wide uppercase">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              Live Sync
            </span>
            <button
              type="button"
              onClick={() => toast('All mentorship telemetry and XGBoost models are synced.', 'info')}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="System Status"
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
