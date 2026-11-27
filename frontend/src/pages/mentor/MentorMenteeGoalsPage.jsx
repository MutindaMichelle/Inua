/**
 * INUA Mentor Mentee Progress & Goal Tracker
 * Allows industry mentors to monitor their assigned students' developmental goals,
 * inspect milestone completion velocity, and provide direct feedback or guidance.
 */
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { apiError, fmtDate } from '../../utils/helpers'

const DEMO_MENTEES = [
  {
    mentee_id: 1,
    name: 'Michelle Mutinda',
    university: 'Strathmore University',
    career_stage: 'BICS Year 4 (Final Year)',
    career_interest: 'Software Engineering & ML',
    avatar: 'MM',
    last_interaction: 'Yesterday',
    goals: [
      {
        goal_id: 101,
        title: 'Refine CV for Safaricom Software Engineering Graduate Program',
        progress: 75,
        target_date: 'In 3 days',
        milestones: [
          { text: 'Initial CV review with Mentor David', done: true },
          { text: 'Highlight PostgreSQL & TreeSHAP capstone metrics', done: true },
          { text: 'Format for Safaricom Talent Acquisition ATS', done: true },
          { text: 'Final mock submission sign-off', done: false },
        ],
      },
      {
        goal_id: 102,
        title: 'Master PostgreSQL Query Indexing & Distributed Systems Design',
        progress: 50,
        target_date: 'Next week',
        milestones: [
          { text: 'Study B-Tree and Hash Indexing tradeoffs', done: true },
          { text: 'Implement query optimization testbench', done: true },
          { text: 'Review architecture diagram with mentor', done: false },
          { text: 'Complete mock technical question', done: false },
        ],
      },
      {
        goal_id: 103,
        title: 'Behavioral & Technical Mock Interview Readiness',
        progress: 80,
        target_date: '2 weeks',
        milestones: [
          { text: 'STAR method response preparation', done: true },
          { text: 'Technical problem-solving run-through', done: true },
          { text: 'Simulate 45-min live coding session', done: true },
          { text: 'Feedback review & final rehearsal', done: false },
        ],
      },
    ],
  },
  {
    mentee_id: 2,
    name: 'Brian Kiprop',
    university: 'Strathmore University',
    career_stage: 'BICS Year 3',
    career_interest: 'Cloud Engineering & DevOps',
    avatar: 'BK',
    last_interaction: '4 days ago',
    goals: [
      {
        goal_id: 201,
        title: 'Docker & Kubernetes Containerization for Microservices',
        progress: 40,
        target_date: '3 weeks',
        milestones: [
          { text: 'Containerize multi-container web app', done: true },
          { text: 'Configure Docker Compose and environment secrets', done: true },
          { text: 'Deploy local Minikube cluster', done: false },
          { text: 'Mentor architecture review', done: false },
        ],
      },
    ],
  },
]

export default function MentorMenteeGoalsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [mentees, setMentees] = useState(DEMO_MENTEES)
  const [selectedMentee, setSelectedMentee] = useState(DEMO_MENTEES[0])
  const [mentorNote, setMentorNote] = useState('')
  const [activeGoalForNote, setActiveGoalForNote] = useState(null)

  function handleSaveNote(goalId) {
    if (!mentorNote.trim()) return
    toast('Mentor guidance note recorded and shared with student!', 'success')
    setMentorNote('')
    setActiveGoalForNote(null)
  }

  // Calculate high-level stats
  const allGoals = mentees.flatMap((m) => m.goals)
  const avgVelocity = Math.round(
    allGoals.reduce((acc, g) => acc + g.progress, 0) / (allGoals.length || 1)
  )
  const completedCount = allGoals.filter((g) => g.progress === 100).length

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <span>🎯</span>
            <span>Mentee Development & Milestone Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentee Goals & Progress Tracker
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Monitor the career milestones and developmental progress of students assigned to you.
            Provide asynchronous feedback and review milestone deliverables without formality.
          </p>
        </div>

        <Link
          to="/advisory"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto no-underline"
        >
          <span>💬</span>
          <span>Open Advisory Channel</span>
        </Link>
      </div>

      {/* ── Overview Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Mentees Under Guidance
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {mentees.length} Students
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Strathmore BICS 2026 Cohort
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Average Goal Velocity
          </div>
          <div className="text-3xl font-extrabold text-[#D97706] mt-2">
            {avgVelocity}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Across {allGoals.length} tracked career targets
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Milestones Approaching Review
          </div>
          <div className="text-3xl font-extrabold text-[#0F766E] mt-2">
            3 Targets
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Next review: Michelle Mutinda (CV draft)
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Student Selector List ── */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
            Your Assigned Students
          </div>

          <div className="space-y-2">
            {mentees.map((m) => {
              const isSelected = selectedMentee.mentee_id === m.mentee_id
              return (
                <button
                  key={m.mentee_id}
                  onClick={() => setSelectedMentee(m)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center gap-3 ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-[#D97706] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {m.career_stage}
                    </div>
                    <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      {m.goals.length} Active Target{m.goals.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 px-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Mentorship Tip:</strong> Regular check-ins on milestones keep student momentum high and reduce pre-interview anxiety.
            </p>
          </div>
        </div>

        {/* ── Right Column: Selected Mentee's Goals & Progress ── */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Mentee Profile Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                {selectedMentee.avatar}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedMentee.name}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedMentee.university} · {selectedMentee.career_stage}
                </div>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Focus: {selectedMentee.career_interest}
                </div>
              </div>
            </div>

            <Link
              to="/advisory"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors no-underline"
            >
              <span>💬</span> Message Student
            </Link>
          </div>

          {/* Active Goals List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Tracked Goals & Milestones
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Updated in real-time
              </span>
            </div>

            <div className="space-y-5">
              {selectedMentee.goals.map((g) => (
                <div
                  key={g.goal_id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {g.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Target Completion: <span className="font-semibold text-slate-700">{g.target_date}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200/60 self-start sm:self-auto">
                      {g.progress}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Milestone Checklist:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {g.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                            m.done
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={m.done ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                            {m.done ? '✓' : '○'}
                          </span>
                          <span className="truncate">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentor Feedback Trigger */}
                  <div className="pt-2 flex items-center justify-between">
                    {activeGoalForNote === g.goal_id ? (
                      <div className="w-full space-y-2 pt-2">
                        <textarea
                          rows={2}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                          placeholder="Type advice or guidance feedback for Michelle on this milestone..."
                          value={mentorNote}
                          onChange={(e) => setMentorNote(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGoalForNote(null)
                              setMentorNote('')
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(g.goal_id)}
                            className="px-4 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D655E]"
                          >
                            Send Note to Mentee
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveGoalForNote(g.goal_id)}
                        className="text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1.5"
                      >
                        <span>📝</span>
                        <span>Leave Guidance Feedback on this Goal</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
