import React from 'react'

const Loader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-4">
      {/* Logo */}
      <img
        src="/Logo1.png"
        alt="Talkky Logo"
        className="w-24 h-24 animate-bounce mb-6 drop-shadow-xl"
      />

      {/* Brand Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-2 font-poppins">
        Talkky
      </h1>

      {/* Tagline */}
      <p className="text-sm sm:text-base tracking-widest text-gray-300 font-light">
        Connecting Conversations...
      </p>

      {/* Progress Bar */}
      <div className="mt-10 w-24 h-1.5 bg-gray-600 rounded-full relative overflow-hidden shadow-inner">
        <div className="absolute w-full h-full bg-green-500 animate-loaderSlide rounded-full" />
      </div>
    </div>

  )
}

export default Loader