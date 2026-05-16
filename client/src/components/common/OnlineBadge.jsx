import React from 'react'

function OnlineBadge({ isOnline, showLabel = false, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          isOnline ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"
        }`}
      />
      {showLabel && (
        <span className={`text-xs ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </span>
  )
}

export default OnlineBadge
