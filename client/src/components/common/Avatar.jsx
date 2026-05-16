import React from 'react'

function Avatar({ src, name, size = "md", showOnline = false, isOnline = false }) {

    const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const dotSizes = {
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
    xl: "w-3.5 h-3.5 border-2",
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name || "avatar"}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold`}
        >
          {initials}
        </div>
      )}
 
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-[#111111] ${
            isOnline ? "bg-emerald-400" : "bg-zinc-600"
          }`}
        />
      )}
    </div>
  )
}

export default Avatar
