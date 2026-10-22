import React from 'react'

const Loader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--c-canvas)] to-[var(--c-panel)] text-[var(--c-text)] p-4">
      {/* Logo */}
      <img
        src="/brand/talkyy-symbol-transparent.png"
        alt="Talkyy Logo"
        className="w-20 h-20 animate-pulse mb-5 drop-shadow-lg object-contain"
      />

      {/* Brand Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Talkyy
      </h1>

      {/* Tagline */}
      <p className="text-sm sm:text-base tracking-wide text-[var(--c-text-2)] font-normal">
        A calmer space for real conversations.
      </p>

      {/* Progress Bar */}
      <div className="mt-10 w-24 h-1.5 bg-[var(--c-raised)] rounded-full relative overflow-hidden shadow-inner">
        <div className="absolute w-full h-full bg-green-500 animate-loaderSlide rounded-full" />
      </div>
    </div>

  )
}

export default Loader