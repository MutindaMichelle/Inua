/**
 * INUA Mentorship Advisory Channel
 * Direct, in-app professional communication channel between Mentee and Mentor.
 * Eliminates formal email friction while keeping discussions focused on career goals and milestones.
 */
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials } from '../../utils/helpers'

const STORAGE_KEY = 'inua_advisory_messages_v1'

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: 'mentee',
    senderName: 'Michelle Mutinda',
    senderRole: 'Student Mentee',
    category: '💬 Quick Advice Request',
    text: "Hi David, thank you for the feedback during our session yesterday. I've finished revising the project section of my CV for the Safaricom Graduate Software Engineer application. Should I emphasize the query performance numbers or the system architecture more?",
    time: 'Yesterday, 3:45 PM',
  },
  {
    id: 2,
    sender: 'mentor',
    senderName: 'David Mwangi',
    senderRole: 'Senior SWE · Safaricom',
    category: '💡 Mentor Guidance',
    text: "Great initiative, Michelle! Definitely lead with the measurable impact: mention the 35% latency improvement first, then explain that you achieved it using composite B-Tree indexes on PostgreSQL. Engineering managers scan for concrete business outcomes.",
    time: 'Yesterday, 4:12 PM',
  },
  {
    id: 3,
    sender: 'mentee',
    senderName: 'Michelle Mutinda',
    senderRole: 'Student Mentee',
    category: '🎯 Goal Milestone Update',
    text: "That makes complete sense! I've updated the draft and moved the 'Refine CV for Safaricom' milestone to 75% on my Goals page. I also booked our next check-in on Tuesday at 3 PM for our mock technical interview.",
    time: 'Yesterday, 5:30 PM',
  },
  {
    id: 4,
    sender: 'mentor',
    senderName: 'David Mwangi',
    senderRole: 'Senior SWE · Safaricom',
    category: '💡 Mentor Guidance',
    text: "Perfect, I've confirmed the Tuesday slot. For the mock interview, be ready to walk through your TreeSHAP explanation pipeline and trade-offs in relational vs document databases. You're making tremendous progress!",
    time: 'Today, 9:15 AM',
  },
]

const QUICK_TAGS = [
  '💬 Quick Advice',
  '🎯 Goal Update',
  '💡 Mentor Guidance',
  '📄 Review Request',
]

export default function AdvisoryChannelPage() {
  const { user } = useAuth()
  const toast = useToast()
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES
    } catch {
      return DEFAULT_MESSAGES
    }
  })

  const [input, setInput] = useState('')
  const [selectedTag, setSelectedTag] = useState(QUICK_TAGS[0])

  const isMentor = user?.role === 'mentor'
  const isMentee = user?.role === 'mentee'

  // Counterpart profile
  const partnerName = isMentor ? 'Michelle Mutinda' : 'David Mwangi'
  const partnerRole = isMentor
    ? 'Student Mentee · BICS Year 4'
    : 'Senior Software Engineer · Safaricom'
  const partnerAvatar = isMentor ? 'MM' : 'DM'

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.error(e)
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return

    const now = new Date()
    const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const newMsg = {
      id: Date.now(),
      sender: isMentor ? 'mentor' : 'mentee',
      senderName: user?.name || (isMentor ? 'David Mwangi' : 'Michelle Mutinda'),
      senderRole: isMentor ? 'Senior SWE · Safaricom' : 'Student Mentee',
      category: selectedTag,
      text: input.trim(),
      time: timeStr,
    }

    setMessages((prev) => [...prev, newMsg])
    setInput('')
    toast('Message sent to advisory channel', 'info')
  }

  function handleResetThread() {
    setMessages(DEFAULT_MESSAGES)
    localStorage.removeItem(STORAGE_KEY)
    toast('Conversation history reset to default demonstration thread.', 'info')
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* ── Channel Header & Dyad Context ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              {partnerAvatar}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {partnerName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Dyad
              </span>
            </div>
            <p className="text-xs text-slate-500">{partnerRole}</p>
          </div>
        </div>

        {/* Current Goal Anchor */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200/60 text-xs">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
              🎯 Active Goal Anchor:
            </div>
            <div className="text-slate-800 font-semibold truncate max-w-xs">
              Refine CV for Safaricom Graduate Program
            </div>
          </div>

          {isMentor ? (
            <Link
              to="/mentor/goals"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors no-underline shrink-0"
            >
              View Goals →
            </Link>
          ) : (
            <Link
              to="/goals"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors no-underline shrink-0"
            >
              My Goals →
            </Link>
          )}
        </div>
      </div>

      {/* ── Messages Feed Area ── */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 overflow-y-auto space-y-4">
        <div className="text-center py-2">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Inua Professional Channel · Secure Academic & Career Advisory
          </span>
        </div>

        {messages.map((m) => {
          const isCurrentUser =
            (isMentor && m.sender === 'mentor') || (isMentee && m.sender === 'mentee')

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${
                isCurrentUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'mentor'
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-[#D97706] text-white'
                }`}
              >
                {initials(m.senderName)}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 space-y-1.5 shadow-xs ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-slate-900 to-[#131F36] text-white'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCurrentUser
                        ? 'bg-white/15 text-amber-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.category}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isCurrentUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>

                <div
                  className={`text-[10px] pt-1 ${
                    isCurrentUser ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {m.senderName} · {m.senderRole}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Compose & Send Area ── */}
      <form
        onSubmit={handleSend}
        className="mt-3 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-xs shrink-0 space-y-2.5"
      >
        {/* Quick Tag Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Tag:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
          <button
            type="button"
            onClick={handleResetThread}
            className="ml-auto text-[10px] text-slate-400 hover:text-slate-600 shrink-0"
            title="Reset thread to default demo"
          >
            ↻ Reset Thread
          </button>
        </div>

        {/* Input & Send Button */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-400"
            placeholder={
              isMentor
                ? "Send guidance, review feedback, or encouragement to Michelle..."
                : "Ask David for advice, share a draft, or update on your milestone..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  )
}
