/**
 * INUA App — Root component with client-side routing and layout shell.
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 */
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider }        from './context/ToastContext'
import Navbar                   from './components/layout/Navbar'

// Public pages
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import ProfilePage   from './pages/ProfilePage'

// Mentee pages
import MentorsPage   from './pages/mentee/MentorsPage'
import SessionsPage  from './pages/mentee/SessionsPage'
import PredictPage   from './pages/mentee/PredictPage'
import GoalsPage     from './pages/mentee/GoalsPage'

// Mentor pages
import MentorSessionsPage    from './pages/mentor/MentorSessionsPage'
import MentorQualityPage     from './pages/mentor/MentorQualityPage'
import MentorMenteeGoalsPage from './pages/mentor/MentorMenteeGoalsPage'

// Advisory Communication Channel (Mentee & Mentor)
import AdvisoryChannelPage   from './pages/common/AdvisoryChannelPage'

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminMentorsPage  from './pages/admin/AdminMentorsPage'

/** Guard: redirect to /login if not authenticated. */
function Private({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Guard: redirect to role-appropriate home if wrong role tries to access a route. */
function RoleGuard({ roles, children }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar>
            <Routes>
              {/* ── Public ── */}
              <Route path="/"         element={<LandingPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ── Shared Authenticated Profile & Advisory Channel ── */}
              <Route path="/profile"  element={<Private><ProfilePage /></Private>} />
              <Route path="/advisory" element={<Private><RoleGuard roles={['mentee', 'mentor']}><AdvisoryChannelPage /></RoleGuard></Private>} />

              {/* ── Mentee ── */}
              <Route path="/mentors"  element={<Private><RoleGuard roles={['mentee']}><MentorsPage /></RoleGuard></Private>} />
              <Route path="/sessions" element={<Private><RoleGuard roles={['mentee']}><SessionsPage /></RoleGuard></Private>} />
              <Route path="/goals"    element={<Private><RoleGuard roles={['mentee']}><GoalsPage /></RoleGuard></Private>} />
              <Route path="/predict"  element={<Private><RoleGuard roles={['mentee']}><PredictPage /></RoleGuard></Private>} />

              {/* ── Mentor ── */}
              <Route path="/mentor/sessions" element={<Private><RoleGuard roles={['mentor']}><MentorSessionsPage /></RoleGuard></Private>} />
              <Route path="/mentor/goals"    element={<Private><RoleGuard roles={['mentor']}><MentorMenteeGoalsPage /></RoleGuard></Private>} />
              <Route path="/mentor/quality"  element={<Private><RoleGuard roles={['mentor']}><MentorQualityPage /></RoleGuard></Private>} />

              {/* ── Admin ── */}
              <Route path="/admin/overview" element={<Private><RoleGuard roles={['administrator', 'admin']}><AdminOverviewPage /></RoleGuard></Private>} />
              <Route path="/admin/mentors"  element={<Private><RoleGuard roles={['administrator', 'admin']}><AdminMentorsPage /></RoleGuard></Private>} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Navbar>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
