/**
 * Shared utility helpers for INUA frontend.
 */

/** Returns up to 2 uppercase initials from a full name. */
export function initials(name = '?') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
