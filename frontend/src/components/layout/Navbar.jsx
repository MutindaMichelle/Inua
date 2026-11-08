/**
 * INUA Navbar — responsive top navigation bar.
 * Shows different nav items based on auth state and user role.
 */
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials, avatarColor } from '../../utils/helpers'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast('Signed out successfully.', 'info')
    navigate('/')
  }

  const role = user?.role

  return (
    <nav className="bg-white border-b border-slate2-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#40855d,#2f6847)' }}
          >
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <div>
            <div className="font-bold text-slate2-900 text-base leading-tight">INUA</div>
            <div className="text-xs text-sage-600 font-medium leading-tight">Mentorship Platform</div>
          </div>
        </NavLink>

        {/* Right side */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            {/* Mentee nav */}
            {role === 'mentee' && (
              <>
                <NavLink to="/mentors"  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Find Mentors</NavLink>
                <NavLink to="/sessions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>My Sessions</NavLink>
                <NavLink to="/predict"  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>AI Score</NavLink>
              </>
            )}
            {/* Mentor nav */}
            {role === 'mentor' && (
              <>
                <NavLink to="/mentor/sessions" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>My Sessions</NavLink>
                <NavLink to="/mentor/quality"  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Quality Profile</NavLink>
              </>
            )}
            {/* Admin nav */}
            {(role === 'administrator' || role === 'admin') && (
              <>
                <NavLink to="/admin/overview" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Overview</NavLink>
                <NavLink to="/admin/mentors"  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Mentors</NavLink>
              </>
            )}

            <div className="w-px h-6 bg-slate2-200 mx-2" />

            {/* User avatar & name */}
            {user && (
              <div className="flex items-center gap-2">
                <div
                  className="avatar text-sm"
                  style={{ background: avatarColor(user.name) }}
                >
                  {initials(user.name)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-slate2-800 leading-tight">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-xs text-sage-600 font-medium capitalize leading-tight">
                    {user.role}
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleLogout} className="nav-link ml-1 text-red-500 hover:bg-red-50">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate2-500 mr-2 hidden sm:block">
              Your smart mentorship companion
            </span>
            <NavLink to="/login"    className="btn-secondary py-2 px-4 text-sm">Sign In</NavLink>
            <NavLink to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
