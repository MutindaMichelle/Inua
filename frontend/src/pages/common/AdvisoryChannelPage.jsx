/**
 * INUA Mentorship Advisory Channel
 * Direct, in-app professional communication channel between Mentee and Mentor.
 * Eliminates formal email friction while keeping discussions focused on career goals and milestones.
 */
import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials, getStoredAvatar } from '../../utils/helpers'

const ASSIGNED_STUDENTS = [
  {
    id: 'michelle',
    name: 'Michelle Mutinda',
    email: 'michelle.mutinda@strathmore.edu',
    role: 'Student Mentee · BICS Year 4',
    stage: 'Final Year Student (SCES)',
    avatar: 'MM',
    avatarColor: '#0284c7',
    goalAnchor: 'Refine CV for Safaricom Graduate Program',
    defaultMessages: [
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
    ],
  },
  {
    id: 'brian',
    name: 'Brian Kiprop',
    email: 'brian.kiprop@strathmore.edu',
    role: 'Student Mentee · BICS Year 3',
    stage: 'Year 3 Student (SCES)',
    avatar: 'BK',
    avatarColor: '#10b981',
    goalAnchor: 'Docker & Kubernetes Microservices Orchestration',
    defaultMessages: [
      {
        id: 101,
        sender: 'mentee',
        senderName: 'Brian Kiprop',
        senderRole: 'Student Mentee',
        category: '💬 Quick Advice Request',
        text: "Hello Mentor David, I've dockerized our microservice but I'm encountering a connection refused error between the FastAPI container and PostgreSQL container on bridge network. Any guidance on network scoping?",
        time: '2 days ago, 11:20 AM',
      },
      {
        id: 102,
        sender: 'mentor',
        senderName: 'David Mwangi',
        senderRole: 'Senior SWE · Safaricom',
        category: '💡 Mentor Guidance',
        text: "Hi Brian, make sure you reference the database service name defined in docker-compose.yml as your host (e.g. `postgres:5432`) rather than `localhost`, since localhost points inside the container itself.",
        time: '2 days ago, 1:45 PM',
      },
      {
        id: 103,
        sender: 'mentee',
        senderName: 'Brian Kiprop',
        senderRole: 'Student Mentee',
        category: '🎯 Goal Milestone Update',
        text: "That solved it immediately! Containers are communicating smoothly now. I've updated milestone #2 on my Goals tracker to 100%. Moving on to Kubernetes Minikube deployment next.",
        time: 'Yesterday, 10:15 AM',
      },
      {
        id: 104,
        sender: 'mentor',
        senderName: 'David Mwangi',
        senderRole: 'Senior SWE · Safaricom',
        category: '💡 Mentor Guidance',
        text: "Awesome work! For the Minikube setup, remember to create a ConfigMap for non-sensitive properties and use Kubernetes Secrets for your DB credentials. Ping me if you run into any Ingress issues.",
        time: 'Today, 8:40 AM',
      },
    ],
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
  const [searchParams, setSearchParams] = useSearchParams()

  const menteeParam = searchParams.get('mentee')

  const [activeMenteeId, setActiveMenteeId] = useState(() => {
    return menteeParam === 'brian' ? 'brian' : 'michelle'
  })

  const isMentor = user?.role === 'mentor'
  const isMentee = user?.role === 'mentee'

  const currentMentee =
    ASSIGNED_STUDENTS.find((s) => s.id === activeMenteeId) || ASSIGNED_STUDENTS[0]

  const currentStorageKey = isMentor
    ? `inua_advisory_messages_${activeMenteeId}`
    : 'inua_advisory_messages_mentee_david'

  // Counterpart profile
  const partnerName = isMentor ? currentMentee.name : 'David Mwangi'
  const partnerRole = isMentor
    ? currentMentee.role
    : 'Senior Software Engineer · Safaricom'
  const partnerEmail = isMentor
    ? currentMentee.email
    : 'david.mwangi@safaricom.co.ke'
  const partnerAvatar = isMentor ? currentMentee.avatar : 'DM'
  const partnerGoalAnchor = isMentor
    ? currentMentee.goalAnchor
    : 'Refine CV for Safaricom Graduate Program'

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(currentStorageKey)
      return saved
        ? JSON.parse(saved)
        : isMentor
        ? currentMentee.defaultMessages
        : currentMentee.defaultMessages
    } catch {
      return currentMentee.defaultMessages
    }
  })

  const [input, setInput] = useState('')
  const [selectedTag, setSelectedTag] = useState(QUICK_TAGS[0])

  // Sync with URL query parameter
  useEffect(() => {
    if (menteeParam && (menteeParam === 'brian' || menteeParam === 'michelle')) {
      setActiveMenteeId(menteeParam)
    }
  }, [menteeParam])

  // Switch thread whenever activeMenteeId changes
  useEffect(() => {
    if (isMentor) {
      try {
        const saved = localStorage.getItem(`inua_advisory_messages_${activeMenteeId}`)
        if (saved) {
          setMessages(JSON.parse(saved))
        } else {
          setMessages(currentMentee.defaultMessages)
        }
      } catch {
        setMessages(currentMentee.defaultMessages)
      }
    }
  }, [activeMenteeId, isMentor, currentMentee])

  useEffect(() => {
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(messages))
    } catch (e) {
      console.error(e)
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentStorageKey])

  function handleSwitchMentee(id) {
    setActiveMenteeId(id)
    setSearchParams({ mentee: id })
  }

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

    const updated = [...messages, newMsg]
    setMessages(updated)
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
    setInput('')
    toast(`Message sent to ${isMentor ? currentMentee.name : 'advisor'}`, 'info')
  }

  function handleResetThread() {
    const initial = isMentor ? currentMentee.defaultMessages : currentMentee.defaultMessages
    setMessages(initial)
    localStorage.removeItem(currentStorageKey)
    toast(`Conversation history reset for ${partnerName}.`, 'info')
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* ── Mentor Assigned Mentees Switcher Bar ── */}
      {isMentor && (
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2 tracking-wider flex items-center gap-1.5">
              <span>👥</span>
              <span>Assigned Mentee Channels:</span>
            </span>
            {ASSIGNED_STUDENTS.map((s) => {
              const isSelected = activeMenteeId === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSwitchMentee(s.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#0B1324] text-white border-[#0B1324] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white font-extrabold"
                    style={{ backgroundColor: s.avatarColor }}
                  >
                    {s.avatar}
                  </span>
                  <span>{s.name}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-amber-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    ({s.stage.split(' ')[0]} {s.stage.split(' ')[1]})
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
              )
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-medium px-2">
            Click student to switch chat thread
          </div>
        </div>
      )}

      {/* ── Channel Header & Dyad Context ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {getStoredAvatar(partnerEmail, partnerName) ? (
              <img
                src={getStoredAvatar(partnerEmail, partnerName)}
                alt={partnerName}
                className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-slate-200"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm"
                style={{ backgroundColor: isMentor ? currentMentee.avatarColor : '#D97706' }}
              >
                {partnerAvatar}
              </div>
            )}
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
              {partnerGoalAnchor}
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
            Inua Professional Channel · Secure Academic & Career Advisory with {partnerName}
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
                ? `Send guidance, review feedback, or encouragement to ${currentMentee.name.split(' ')[0]}...`
                : 'Ask David for advice, share a draft, or update on your milestone...'
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
