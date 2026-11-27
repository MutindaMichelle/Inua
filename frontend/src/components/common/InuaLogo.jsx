import React from 'react'

/**
 * InuaLogo: Custom signature brand mark for the INUA Mentorship Platform.
 * Visual concept: "Inua" (Swahili for "lift up") — two ascending geometric wings /
 * intertwined uplifting paths (Mentee & Mentor) rising toward an apex beacon of guidance.
 */
export default function InuaLogo({ size = 36, showText = true, subtitle = null, light = false, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Bespoke uplifting SVG mark */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-md"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #0B1324 0%, #16233B 60%, #0F766E 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          <defs>
            <linearGradient id="inuaAmberGrad" x1="6" y1="42" x2="28" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="inuaTealGrad" x1="20" y1="42" x2="42" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2DD4BF" />
              <stop offset="1" stopColor="#0F766E" />
            </linearGradient>
            <filter id="inuaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Wing (Mentee Path) - Ascending Amber Chevron */}
          <path
            d="M10 38 L19 23 L24 28 L15 42 Z"
            fill="url(#inuaAmberGrad)"
            opacity="0.95"
          />
          <path
            d="M19 23 L24 13 L29 23 L24 28 Z"
            fill="#FBBF24"
            filter="url(#inuaGlow)"
          />

          {/* Right Wing (Mentor Path) - Ascending Teal Chevron */}
          <path
            d="M38 38 L29 23 L24 28 L33 42 Z"
            fill="url(#inuaTealGrad)"
            opacity="0.95"
          />

          {/* The Elevation Beacon (Growth & Insight) */}
          <circle cx="24" cy="8" r="3.2" fill="#FDE68A" filter="url(#inuaGlow)" />
          <circle cx="24" cy="8" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-lg ${
                light ? 'text-white' : 'text-slate-900'
              }`}
            >
              INUA
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
              KE
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[10px] font-medium tracking-wide uppercase ${
                light ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
