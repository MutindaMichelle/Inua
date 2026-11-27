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
// Authentic high-resolution portraits of Black African tech leaders, faculty, and scholars
// ==========================================

export const DEFAULT_AVATARS = {
  // Mentors (Kenyan & African Industry Leaders & Faculty Advisors)
  mutua:   'https://images.pexels.com/photos/12179672/pexels-photo-12179672.jpeg?auto=compress&cs=tinysrgb&w=400',
  joseph:  'https://images.pexels.com/photos/12179672/pexels-photo-12179672.jpeg?auto=compress&cs=tinysrgb&w=400',

  ndungu:  'https://images.pexels.com/photos/7109089/pexels-photo-7109089.jpeg?auto=compress&cs=tinysrgb&w=400',
  samuel:  'https://images.pexels.com/photos/7109089/pexels-photo-7109089.jpeg?auto=compress&cs=tinysrgb&w=400',

  mwangi:  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80',
  david:   'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80',

  ochieng: 'https://images.pexels.com/photos/30938726/pexels-photo-30938726.jpeg?auto=compress&cs=tinysrgb&w=400',
  grace:   'https://images.pexels.com/photos/30938726/pexels-photo-30938726.jpeg?auto=compress&cs=tinysrgb&w=400',

  waweru:  'https://images.pexels.com/photos/11396279/pexels-photo-11396279.jpeg?auto=compress&cs=tinysrgb&w=400',
  angela:  'https://images.pexels.com/photos/11396279/pexels-photo-11396279.jpeg?auto=compress&cs=tinysrgb&w=400',

  wambui:  'https://images.pexels.com/photos/8872443/pexels-photo-8872443.jpeg?auto=compress&cs=tinysrgb&w=400',
  sarah:   'https://images.pexels.com/photos/8872443/pexels-photo-8872443.jpeg?auto=compress&cs=tinysrgb&w=400',

  amina:   'https://images.pexels.com/photos/8052215/pexels-photo-8052215.jpeg?auto=compress&cs=tinysrgb&w=400',
  hassan:  'https://images.pexels.com/photos/8052215/pexels-photo-8052215.jpeg?auto=compress&cs=tinysrgb&w=400',

  // Mentees (Strathmore Scholars & Students)
  michelle: 'https://images.pexels.com/photos/8052215/pexels-photo-8052215.jpeg?auto=compress&cs=tinysrgb&w=400',
  mutinda:  'https://images.pexels.com/photos/8052215/pexels-photo-8052215.jpeg?auto=compress&cs=tinysrgb&w=400',

  brian:    'https://images.pexels.com/photos/31528817/pexels-photo-31528817.jpeg?auto=compress&cs=tinysrgb&w=400',
  kiprop:   'https://images.pexels.com/photos/31528817/pexels-photo-31528817.jpeg?auto=compress&cs=tinysrgb&w=400',
  kevin:    'https://images.pexels.com/photos/31528817/pexels-photo-31528817.jpeg?auto=compress&cs=tinysrgb&w=400',

  faith:    'https://images.pexels.com/photos/8872443/pexels-photo-8872443.jpeg?auto=compress&cs=tinysrgb&w=400',
  wanjiku:  'https://images.pexels.com/photos/8872443/pexels-photo-8872443.jpeg?auto=compress&cs=tinysrgb&w=400',
}

export const PRESET_AVATARS = [
  { label: 'Executive Male 1 (Dr. Mutua)',    url: 'https://images.pexels.com/photos/12179672/pexels-photo-12179672.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Executive Male 2 (Eng. Ndungu)',  url: 'https://images.pexels.com/photos/7109089/pexels-photo-7109089.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Executive Male 3 (David Mwangi)', url: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80' },
  { label: 'Executive Female 1 (Dr. Grace)',  url: 'https://images.pexels.com/photos/30938726/pexels-photo-30938726.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Executive Female 2 (Dr. Angela)', url: 'https://images.pexels.com/photos/11396279/pexels-photo-11396279.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Executive Female 3 (Sarah Wambui)', url: 'https://images.pexels.com/photos/8872443/pexels-photo-8872443.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Scholar Female (Michelle)',       url: 'https://images.pexels.com/photos/8052215/pexels-photo-8052215.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Scholar Male (Brian Kiprop)',     url: 'https://images.pexels.com/photos/31528817/pexels-photo-31528817.jpeg?auto=compress&cs=tinysrgb&w=400' },
]

const DEPRECATED_URL_TOKENS = [
  '1500648767791',
  '1573496359142',
  '1580894732483',
  '1507003211169',
  '1534528741775',
  '1539571696357',
  '1517841905240',
  '1531746020798',
]

function isDeprecated(val) {
  if (!val || typeof val !== 'string') return false
  return DEPRECATED_URL_TOKENS.some((tok) => val.includes(tok))
}

/**
 * Retrieves the stored avatar for a user or mentor by checking:
 * 1. Explicit localStorage by identifier/email (purging stale deprecated links)
 * 2. Explicit localStorage by mentor ID
 * 3. Default curated portfolio mapping by name/email
 */
export function getStoredAvatar(identifier, name = '') {
  if (typeof window === 'undefined') return null

  // 1. Check direct localStorage key
  if (identifier) {
    const rawId = String(identifier).trim().toLowerCase()
    const byEmail = localStorage.getItem(`inua_avatar_${rawId}`)
    if (byEmail) {
      if (isDeprecated(byEmail)) {
        localStorage.removeItem(`inua_avatar_${rawId}`)
      } else {
        return byEmail
      }
    }
    const byMentorId = localStorage.getItem(`mentor_avatar_${rawId}`)
    if (byMentorId) {
      if (isDeprecated(byMentorId)) {
        localStorage.removeItem(`mentor_avatar_${rawId}`)
      } else {
        return byMentorId
      }
    }
  }

  // 2. Check by name key in localStorage
  if (name) {
    const cleanName = name.trim().toLowerCase()
    const byName = localStorage.getItem(`inua_avatar_${cleanName}`)
    if (byName) {
      if (isDeprecated(byName)) {
        localStorage.removeItem(`inua_avatar_${cleanName}`)
      } else {
        return byName
      }
    }
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
