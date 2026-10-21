import { useState, useEffect } from 'react';
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiShield,
  FiMaximize2,
  FiGrid,
  FiUser,
  FiVolume2,
  FiShare2
} from 'react-icons/fi';

/**
 * VideoCallPreview - Scenario C: Voice & Video Call
 * Showcases a natural, heartfelt 4-person video conversation
 * with authentic webcam perspectives, live active speaker pulse,
 * audio equalizer bars, and interactive video call controls.
 */
export default function VideoCallPreview() {
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'spotlight'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(872); // seconds (14:32)
  const [activeSpeaker, setActiveSpeaker] = useState('sofia'); // 'sofia' | 'leo'

  // Increment call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const participants = [
    {
      id: 'sofia',
      name: 'Sofia Chen',
      location: 'Vancouver',
      feed: '/assets/calls/call-sofia.jpg',
      isSpeaking: activeSpeaker === 'sofia',
      isMuted: false,
      role: 'Active Speaker'
    },
    {
      id: 'leo',
      name: 'Grandfather Leo',
      location: 'Florence',
      feed: '/assets/calls/call-leo.jpg',
      isSpeaking: activeSpeaker === 'leo',
      isMuted: false,
      role: 'Playing Guitar'
    },
    {
      id: 'marcus',
      name: 'Marcus Vance',
      location: 'London',
      feed: isVideoOff ? null : '/assets/calls/call-marcus.jpg',
      isSpeaking: false,
      isMuted: isMuted,
      role: 'Listening'
    },
    {
      id: 'elena',
      name: 'Elena Costa',
      location: 'Lisbon',
      feed: '/assets/calls/call-elena.jpg',
      isSpeaking: false,
      isMuted: true,
      role: 'Smiling'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--c-divider)] bg-[#191D25] text-[#F7F5EF] shadow-2xl overflow-hidden flex flex-col">
      {/* Call Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#12151B] px-4 sm:px-6 py-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-white tracking-wide">
                Family & Friends Sunday Call
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-[#2858E8]/20 px-2 py-0.5 text-[10px] font-semibold text-[#7EA6FF] border border-[#2858E8]/30">
                <FiShield className="h-2.5 w-2.5" /> E2EE 1080p
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              4 Participants • Lossless Opus Audio • WebRTC Mesh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/5 px-3 py-1 font-mono text-xs font-semibold text-white/90 border border-white/10">
            {formatTimer(callDuration)}
          </div>

          <div className="hidden sm:flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`rounded px-2 py-1 text-xs transition ${
                layoutMode === 'grid' ? 'bg-[#2858E8] text-white' : 'text-white/60 hover:text-white'
              }`}
              title="2x2 Grid View"
            >
              <FiGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('spotlight')}
              className={`rounded px-2 py-1 text-xs transition ${
                layoutMode === 'spotlight' ? 'bg-[#2858E8] text-white' : 'text-white/60 hover:text-white'
              }`}
              title="Speaker Spotlight View"
            >
              <FiMaximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid Canvas */}
      <div className="p-4 sm:p-6 bg-[#151921] min-h-[460px]">
        {layoutMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {participants.map((person) => {
              return (
                <div
                  key={person.id}
                  onClick={() => {
                    if (person.id === 'sofia' || person.id === 'leo') {
                      setActiveSpeaker(person.id);
                    }
                  }}
                  className={`group relative aspect-video overflow-hidden rounded-xl border bg-[#20252F] transition-all duration-300 ${
                    person.isSpeaking
                      ? 'border-[#2858E8] ring-2 ring-[#2858E8]/50 shadow-lg shadow-[#2858E8]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {person.feed ? (
                    <img
                      src={person.feed}
                      alt={person.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-101"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#252B38] text-white/50">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white text-xl font-bold font-display">
                        MV
                      </div>
                      <span className="mt-2 text-xs">Camera is paused</span>
                    </div>
                  )}

                  {/* Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Status: Active Speaker / Equalizer */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {person.isSpeaking && (
                      <div className="flex items-center gap-1.5 rounded-full bg-[#2858E8] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                        <span className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span>Speaking</span>
                      </div>
                    )}
                    {person.id === 'leo' && (
                      <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        🎸 Acoustic Stream
                      </span>
                    )}
                  </div>

                  {/* Bottom Participant Info Bar */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white tracking-wide text-xs drop-shadow-sm">
                        {person.name}
                      </span>
                      <span className="text-[10px] text-white/60">
                        ({person.location})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-xs ${
                          person.isMuted
                            ? 'bg-rose-500/80 text-white'
                            : 'bg-black/50 text-white/80'
                        }`}
                        title={person.isMuted ? 'Muted' : 'Unmuted'}
                      >
                        {person.isMuted ? (
                          <FiMicOff className="h-3 w-3" />
                        ) : (
                          <FiMic className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Spotlight Mode (Sofia Active Focus + 3 Thumbnails) */
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-[#2858E8] shadow-xl">
              <img
                src="/assets/calls/call-sofia.jpg"
                alt="Sofia Chen Speaking"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-[#2858E8] px-3 py-1 text-xs font-semibold text-white shadow-md">
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                </span>
                <span>Sofia Chen • Vancouver (Active Speaker)</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
                <img src="/assets/calls/call-leo.jpg" alt="Leo" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Leo (Guitar)
                </span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
                <img src="/assets/calls/call-marcus.jpg" alt="Marcus" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Marcus
                </span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
                <img src="/assets/calls/call-elena.jpg" alt="Elena" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Elena
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Call Controls Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#12151B] px-6 py-4">
        {/* Device Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
          <FiVolume2 className="h-4 w-4 text-[#7EA6FF]" />
          <span>MacBook Pro Speakers</span>
        </div>

        {/* Center Control Actions */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 ${
              isMuted
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-900/30'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <FiMicOff className="h-5 w-5" /> : <FiMic className="h-5 w-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 ${
              isVideoOff
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-900/30'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <FiVideoOff className="h-5 w-5" /> : <FiVideo className="h-5 w-5" />}
          </button>

          {/* Screen Share */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition active:scale-95"
            title="Share Screen"
          >
            <FiShare2 className="h-5 w-5" />
          </button>

          {/* End Call Button */}
          <button
            className="flex h-11 px-5 items-center justify-center gap-2 rounded-full bg-rose-600 text-white font-semibold text-xs tracking-wide hover:bg-rose-700 transition shadow-lg shadow-rose-900/40 active:scale-95 ml-2"
            title="Leave Call"
          >
            <FiPhoneOff className="h-4 w-4" />
            <span>Leave</span>
          </button>
        </div>

        {/* Latency & Encryption Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/50">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span>24ms latency • HD Stream</span>
        </div>
      </div>
    </div>
  );
}
