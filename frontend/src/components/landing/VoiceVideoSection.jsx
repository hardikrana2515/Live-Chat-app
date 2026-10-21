import React, { useState, useEffect } from 'react';
import {
  IoCall,
  IoVideocam,
  IoVideocamOff,
  IoMic,
  IoMicOff,
  IoShieldCheckmarkOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { FiLock, FiMaximize2 } from 'react-icons/fi';
import { LuPhoneCall, LuVideo } from 'react-icons/lu';

// Phase 4 Cast calling profiles
const CALL_SCENES = {
  elena: {
    id: 'elena',
    name: 'Elena Costa',
    role: 'Architect & Travel Writer',
    location: 'Lisbon, Portugal',
    image: '/assets/calls/call-elena.jpg',
    avatar: '/assets/cast/elena.jpg',
    duration: '04:18',
    context: 'Afternoon coffee catch-up · Lisbon',
    alt: 'Elena Costa smiling warmly during a video call from Lisbon'
  },
  leo: {
    id: 'leo',
    name: 'Grandfather Leo',
    role: 'Retired Teacher & Musician',
    location: 'Florence, Italy',
    image: '/assets/calls/call-leo.jpg',
    avatar: '/assets/cast/leo.jpg',
    duration: '12:45',
    context: 'Sunday family music session · Florence',
    alt: 'Grandfather Leo smiling with his acoustic guitar in Florence'
  }
};

/**
 * Phase 5.4: Voice & Video Calling Showcase
 *
 * Showcases Talkyy's voice & video calling experience:
 * - Editorial introduction: Space Grotesk heading, DM Sans body, supporting points
 * - Product Showcase: Human-centered video call preview featuring Elena Costa (Lisbon)
 *   and Marcus Vance (London) with Picture-in-Picture (PiP)
 * - Authentic controls: Microphone mute/unmute, Camera toggle, Call Mode (Video/Voice),
 *   and Scene switcher (Elena / Grandfather Leo).
 */
const VoiceVideoSection = () => {
  // Active call scene: 'elena' | 'leo'
  const [selectedScene, setSelectedScene] = useState('elena');

  // Call mode: 'video' | 'voice'
  const [callMode, setCallMode] = useState('video');

  // Local controls state (presentation-only interactive controls)
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);

  // Timer simulation
  const [callSeconds, setCallSeconds] = useState(258); // 04:18

  useEffect(() => {
    if (isCallEnded) return;
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCallEnded]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentScene = CALL_SCENES[selectedScene];

  const handleEndCall = () => {
    setIsCallEnded(true);
  };

  const handleRestartCall = () => {
    setIsCallEnded(false);
    setCallSeconds(258);
  };

  return (
    <section
      id="calls"
      className="landing-section relative bg-[var(--c-warm-paper)] border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-calls"
      aria-labelledby="calls-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ========================================================
              PART A: EDITORIAL INTRODUCTION & SUPPORTING POINTS (Left)
              ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-pulse" aria-hidden="true" />
              <LuVideo className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tracking-wide">VOICE & VIDEO</span>
            </div>

            <h2
              id="calls-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]"
            >
              Sometimes, a message
              <br />
              <span className="text-[#2858E8]">isn't enough.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--c-secondary-ink)] max-w-xl">
              Hear the familiar voice. See the smile. Make room for the moments that feel better together.
            </p>

            {/* Three concise supporting points */}
            <div className="mt-8 pt-8 border-t border-[var(--c-divider)] flex flex-col gap-5">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <LuPhoneCall className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Voice calls
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Talk naturally without switching conversations or opening external apps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <LuVideo className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Video calls
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    See the people you're talking to with crisp, low-latency peer-to-peer video.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <IoShieldCheckmarkOutline className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Stay connected
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Return seamlessly to your ongoing conversation timeline right when the call ends.
                  </p>
                </div>
              </div>
            </div>

            {/* Architectural note */}
            <div className="mt-8 flex items-center gap-2 text-xs text-[var(--c-secondary-ink)] border-t border-[var(--c-divider)] pt-5">
              <FiLock className="text-[#2858E8] shrink-0 h-3.5 w-3.5" />
              <span>Peer-to-peer WebRTC media with Socket.IO signaling. No meeting links required.</span>
            </div>
          </div>

          {/* ========================================================
              PART B: PRODUCT CALL SHOWCASE (Right Column)
              ======================================================== */}
          <div className="lg:col-span-7 w-full">
            <div
              className="relative rounded-2xl border border-[var(--c-divider)] bg-[#191B20] text-white shadow-[0_24px_60px_-24px_rgba(25,29,37,0.3)] overflow-hidden flex flex-col h-[520px]"
              role="region"
              aria-label="Talkyy call preview"
            >
              {/* Call Top Header */}
              <header className="absolute top-0 inset-x-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/40 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={currentScene.avatar}
                      alt={currentScene.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/30"
                    />
                    {!isCallEnded && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] border-2 border-[#191B20] rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {currentScene.name}
                      </h3>
                      <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
                        {currentScene.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      {!isCallEnded ? (
                        <>
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Connected
                          </span>
                          <span>·</span>
                          <span className="font-mono text-white/90">{formatTimer(callSeconds)}</span>
                        </>
                      ) : (
                        <span className="text-red-400 font-medium">Call ended</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mode Selector & Scene Selector */}
                <div className="flex items-center gap-2">
                  {/* Scene toggle: Elena or Leo */}
                  <div className="hidden sm:inline-flex rounded-xl bg-black/40 backdrop-blur-xs p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedScene('elena')}
                      className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                        selectedScene === 'elena'
                          ? 'bg-white/20 text-white font-semibold shadow-2xs scale-[1.02]'
                          : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
                      }`}
                      aria-label="View Elena Costa video call"
                    >
                      Elena
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedScene('leo')}
                      className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                        selectedScene === 'leo'
                          ? 'bg-white/20 text-white font-semibold shadow-2xs scale-[1.02]'
                          : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
                      }`}
                      aria-label="View Grandfather Leo video call"
                    >
                      Leo
                    </button>
                  </div>

                  {/* Video vs Voice mode toggle */}
                  <div className="inline-flex rounded-xl bg-black/40 backdrop-blur-xs p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setCallMode('video')}
                      className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        callMode === 'video'
                          ? 'bg-[#2858E8] text-white font-semibold shadow-2xs scale-[1.02]'
                          : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
                      }`}
                      aria-label="Video mode"
                    >
                      <IoVideocam className="text-xs" />
                      <span className="hidden sm:inline">Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCallMode('voice')}
                      className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        callMode === 'voice'
                          ? 'bg-[#2858E8] text-white font-semibold shadow-2xs scale-[1.02]'
                          : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
                      }`}
                      aria-label="Voice mode"
                    >
                      <IoCall className="text-xs" />
                      <span className="hidden sm:inline">Voice</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Call Main Stage */}
              <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                {!isCallEnded ? (
                  callMode === 'video' ? (
                    /* Video Call Stage */
                    <div className="relative w-full h-full">
                      {/* Main Participant Video Feed */}
                      <img
                        src={currentScene.image}
                        alt={currentScene.alt}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        loading="lazy"
                      />

                      {/* Subtle Ambient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Scene Caption Overlay */}
                      <div className="absolute bottom-20 left-4 z-10 hidden sm:block">
                        <span className="rounded-lg bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs text-white/90 border border-white/10">
                          {currentScene.context}
                        </span>
                      </div>

                      {/* Picture-in-Picture (PiP) Local Participant Tile ("You - Marcus") */}
                      <div className="absolute bottom-20 right-4 z-10 w-28 sm:w-36 aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#191B20]">
                        {!isCameraOff ? (
                          <div className="relative w-full h-full">
                            <img
                              src="/assets/calls/call-marcus.jpg"
                              alt="Marcus Vance local video preview from London studio"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1">
                              <span>You</span>
                              {isMuted && <span className="text-red-400">· Muted</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-1 p-2 bg-[#20252F]">
                            <img
                              src="/assets/cast/marcus.jpg"
                              alt="Marcus"
                              className="w-10 h-10 rounded-full object-cover border border-white/20"
                            />
                            <span className="text-[10px] text-white/60">Camera off</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Voice Call Stage (Mirrors Talkyy VideoCall.jsx Voice Mode) */
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 w-full h-full px-6 py-12 bg-gradient-to-b from-[#1C202A] to-[#12141A]">
                      {/* Remote Caller Avatar with Audio Presence Ring */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute -inset-3 rounded-full bg-[#2858E8]/20 animate-pulse" />
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#2858E8] to-emerald-400 shadow-2xl relative z-10">
                            <img
                              src={currentScene.avatar}
                              alt={currentScene.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {currentScene.name}
                          </h4>
                          <p className="text-xs text-white/60">{currentScene.location}</p>
                        </div>
                      </div>

                      {/* Connection Wave Bridge */}
                      <div className="flex flex-col items-center gap-1 text-white/40">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#2858E8]">
                          HD Audio
                        </span>
                        <div className="w-16 border-t border-dashed border-white/20" />
                        <span className="font-mono text-xs text-white/70">{formatTimer(callSeconds)}</span>
                      </div>

                      {/* Local User ("You - Marcus") */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#173BB5] to-[#2858E8] shadow-2xl relative z-10">
                            <img
                              src="/assets/cast/marcus.jpg"
                              alt="Marcus Vance"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            Marcus (You)
                          </h4>
                          <p className="text-xs text-white/60">
                            {isMuted ? <span className="text-red-400">Microphone muted</span> : 'London, UK'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  /* Call Ended State */
                  <div className="flex flex-col items-center justify-center gap-4 text-center p-6 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                      <IoCall className="text-2xl rotate-[135deg]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        Call with {currentScene.name} ended
                      </h4>
                      <p className="text-xs text-white/60 mt-1">
                        Duration: {formatTimer(callSeconds)} · Return to conversation anytime
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestartCall}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 cursor-pointer"
                    >
                      <IoRefreshOutline className="text-sm" />
                      <span>Reconnect Call</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Call Controls Dock (matching real VideoCall.jsx) */}
              {!isCallEnded && (
                <footer className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-3 px-4">
                  <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-2xl">
                    {/* Microphone Mute/Unmute */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-full transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                        isMuted
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white/15 hover:bg-white/25 text-white hover:shadow-md'
                      }`}
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                      aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <IoMicOff size={18} /> : <IoMic size={18} />}
                    </button>

                    {/* Camera On/Off (Video mode only) */}
                    {callMode === 'video' && (
                      <button
                        type="button"
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={`p-3 rounded-full transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                          isCameraOff
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white/15 hover:bg-white/25 text-white hover:shadow-md'
                        }`}
                        title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                        aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                      >
                        {isCameraOff ? <IoVideocamOff size={18} /> : <IoVideocam size={18} />}
                      </button>
                    )}

                    {/* End Call Button */}
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="p-3 rounded-full bg-red-600 hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 text-white shadow-lg transition-all duration-150 cursor-pointer"
                      title="End Call"
                      aria-label="End call"
                    >
                      <IoCall size={18} className="rotate-[135deg]" />
                    </button>
                  </div>
                </footer>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceVideoSection;
