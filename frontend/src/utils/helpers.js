/**
 * Shared utility helpers for INUA frontend.
 */

/** Returns up to 2 uppercase initials from a full name. */
export function initials(name = '?') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

/** Deterministic avatar colour based on name hash. */
const AVATAR_COLORS = [
  '#40855d', '#2f6847', '#c0642a', '#4a6a85', '#8B5CF6', '#d67d3a',
]
export function avatarColor(name = '') {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + h * 31
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

/** Returns a human-friendly date string for a session date. */
export function formatDate(iso) {
  if (!iso) return 'TBD'
  return new Date(iso).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Alias of formatDate (used by Goals page). */
export const fmtDate = formatDate

/** Status badge CSS class. */
export function statusClass(status = '') {
  const map = {
    Scheduled:   'badge-scheduled',
    Completed:   'badge-completed',
    Cancelled:   'badge-cancelled',
    Rescheduled: 'badge-rescheduled',
    Pending:     'badge-pending',
  }
  return map[status] || 'badge-pending'
}

/** Status emoji. */
export function statusEmoji(status = '') {
  const map = {
    Scheduled:   '📅',
    Completed:   '✅',
    Cancelled:   '❌',
    Rescheduled: '🔄',
    Pending:     '⏳',
  }
  return map[status] || '❓'
}

/** Extract error message from axios error. */
export function apiError(err) {
  return err?.response?.data?.detail || err?.message || 'An unexpected error occurred.'
}

// ==========================================
// CENTRALIZED PROFILE PHOTO & AVATAR SYSTEM
// ==========================================

export const DEFAULT_AVATARS = {
  // Mentors (Industry Leaders & Advisors)
  mwangi:  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80',
  david:   'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80',
  ochieng: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  grace:   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  ndungu:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  samuel:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  wambui:  'https://images.unsplash.com/photo-1580894732483-34e40243e36e?w=400&auto=format&fit=crop&q=80',
  sarah:   'https://images.unsplash.com/photo-1580894732483-34e40243e36e?w=400&auto=format&fit=crop&q=80',
  amina:   'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
  hassan:  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
  mutua:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',

  // Mentees (Strathmore Scholars & Students)
  michelle: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  mutinda:  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  brian:    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  kiprop:   'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  faith:    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  wanjiku:  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
}

export const PRESET_AVATARS = [
  { label: 'Executive Male 1',   url: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80' },
  { label: 'Executive Female 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { label: 'Executive Male 2',   url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Executive Female 2', url: 'https://images.unsplash.com/photo-1580894732483-34e40243e36e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Scholar Female 1',   url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { label: 'Scholar Male 1',     url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { label: 'Scholar Female 2',   url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { label: 'Scholar Male 2',     url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
]

/**
 * Retrieves the stored avatar for a user or mentor by checking:
 * 1. Explicit localStorage by identifier/email
 * 2. Explicit localStorage by mentor ID
 * 3. Default curated portfolio mapping by name/email
 */
export function getStoredAvatar(identifier, name = '') {
  if (typeof window === 'undefined') return null

  // 1. Check direct localStorage key
  if (identifier) {
    const rawId = String(identifier).trim().toLowerCase()
    const byEmail = localStorage.getItem(`inua_avatar_${rawId}`)
    if (byEmail) return byEmail
    const byMentorId = localStorage.getItem(`mentor_avatar_${rawId}`)
    if (byMentorId) return byMentorId
  }

  // 2. Check by name key in localStorage
  if (name) {
    const cleanName = name.trim().toLowerCase()
    const byName = localStorage.getItem(`inua_avatar_${cleanName}`)
    if (byName) return byName
  }

  // 3. Fallback to default curated portraits by keyword in identifier or name
  const combined = `${identifier || ''} ${name || ''}`.toLowerCase()
  for (const [key, url] of Object.entries(DEFAULT_AVATARS)) {
    if (combined.includes(key)) return url
  }

  return null
}

/**
 * Persists user avatar to localStorage and dispatches a cross-component update event.
 */
export function saveStoredAvatar(identifier, dataUrl, name = '') {
  if (typeof window === 'undefined') return
  if (identifier) {
    const rawId = String(identifier).trim().toLowerCase()
    localStorage.setItem(`inua_avatar_${rawId}`, dataUrl)
  }
  if (name) {
    const cleanName = name.trim().toLowerCase()
    localStorage.setItem(`inua_avatar_${cleanName}`, dataUrl)
  }
  window.dispatchEvent(new CustomEvent('inua_avatar_updated', { detail: { identifier, dataUrl } }))
}

/**
 * Clears stored avatar from localStorage.
 */
export function removeStoredAvatar(identifier, name = '') {
  if (typeof window === 'undefined') return
  if (identifier) {
    const rawId = String(identifier).trim().toLowerCase()
    localStorage.removeItem(`inua_avatar_${rawId}`)
    localStorage.removeItem(`mentor_avatar_${rawId}`)
  }
  if (name) {
    const cleanName = name.trim().toLowerCase()
    localStorage.removeItem(`inua_avatar_${cleanName}`)
  }
  window.dispatchEvent(new CustomEvent('inua_avatar_updated', { detail: { identifier, dataUrl: null } }))
}
