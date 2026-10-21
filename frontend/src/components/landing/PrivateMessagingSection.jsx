import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IoCall,
  IoVideocam,
  IoCheckmarkDone,
  IoPlay,
  IoPause,
  IoSend,
  IoMic,
  IoClose,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { LuPaperclip } from 'react-icons/lu';
import { GrEmoji } from 'react-icons/gr';
import { BsLayoutSidebarReverse } from 'react-icons/bs';
import { FiLock, FiCheckCircle, FiSearch, FiMaximize2 } from 'react-icons/fi';
import { playSendSound } from '../../utils/SoundUtils';

// Pre-calculated waveform bar heights (normalized 0.15 - 1.0)
const WAVEFORM_HEIGHTS = [
  0.25, 0.45, 0.7, 0.35, 0.8, 0.95, 0.6, 0.3, 0.5, 0.85, 1.0, 0.75, 0.4, 0.65,
  0.9, 0.55, 0.35, 0.7, 0.8, 0.5, 0.3, 0.6, 0.4, 0.2
];

/**
 * Phase 5.2: Private Messaging Section
 *
 * Showcases Talkyy's private 1:1 messaging experience with:
 * - Editorial introduction (Space Grotesk + DM Sans, Warm Paper aesthetic)
 * - Authentic, high-fidelity chat showcase with Elena Costa (Lisbon)
 * - Interactive elements: Voice note waveform playback, photo lightbox,
 *   emoji reactions toggle, and live reply composer with send sound.
 */
const PrivateMessagingSection = () => {
  // Voice note playback simulation
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0); // 0 to 18 seconds
  const voiceTimerRef = useRef(null);

  // Photo modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Reaction state for photo attachment
  const [photoReactionCount, setPhotoReactionCount] = useState(2);
  const [hasUserReacted, setHasUserReacted] = useState(false);

  // Composer state for interactive preview
  const [draftMessage, setDraftMessage] = useState('');
  const [extraMessages, setExtraMessages] = useState([]);
  const messageEndRef = useRef(null);

  // Active contact selection in restrained sidebar
  const [selectedContact, setSelectedContact] = useState('elena');

  // Handle voice note play/pause
  const toggleVoiceNote = () => {
    if (isPlayingVoice) {
      clearInterval(voiceTimerRef.current);
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      voiceTimerRef.current = setInterval(() => {
        setVoiceProgress((prev) => {
          if (prev >= 18) {
            clearInterval(voiceTimerRef.current);
            setIsPlayingVoice(false);
            return 0;
          }
          return +(prev + 0.25).toFixed(2);
        });
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  // Handle user reaction toggle
  const handleToggleReaction = () => {
    if (hasUserReacted) {
      setPhotoReactionCount((c) => c - 1);
      setHasUserReacted(false);
    } else {
      setPhotoReactionCount((c) => c + 1);
      setHasUserReacted(true);
    }
  };

  // Handle send message from composer
  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    playSendSound();

    const newMsg = {
      id: Date.now(),
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user'
    };

    setExtraMessages((prev) => [...prev, newMsg]);
    setDraftMessage('');

    // Smooth scroll down
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    if (!isPhotoModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsPhotoModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhotoModalOpen]);

  const voicePercent = Math.min(100, (voiceProgress / 18) * 100);
  const formattedVoiceTime = `0:${Math.floor(voiceProgress).toString().padStart(2, '0')}`;

  return (
    <section
      id="conversations"
      className="landing-section relative bg-[var(--c-warm-paper)] border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-conversations"
      aria-labelledby="private-messaging-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ========================================================
              PART A: EDITORIAL INTRODUCTION
              ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 w-fit mb-4 shadow-2xs hover:border-[#2858E8]/30 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8]" aria-hidden="true" />
              <span className="tracking-wide">PRIVATE MESSAGING</span>
            </div>

            <h2
              id="private-messaging-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]"
            >
              Closer conversations.
              <br />
              <span className="text-[#2858E8]">Less noise.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--c-secondary-ink)] max-w-xl">
              A thoughtful space for one-to-one conversations, where sharing, reacting, and catching up feels effortless.
            </p>

            {/* Curated Product Truth Pillars */}
            <div className="mt-8 pt-8 border-t border-[var(--c-divider)] flex flex-col gap-5">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <IoShieldCheckmarkOutline className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Browser-native End-to-End Encryption
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Direct cryptographic keys (AES-GCM + ECDH) derived on device. Only you and your recipient hold the keys.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <IoCheckmarkDone className="h-4 w-4 text-[#2858E8]" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Transparent Read Receipts & Presence
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Subtle double-checks and live typing signals confirm your message was delivered and read without intrusive badges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <IoMic className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Vivid Moments & Voice Notes
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    High-resolution imagery and inline voice waveforms retain the warmth and cadence of real human interaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive hint */}
            <div className="mt-8 rounded-xl border border-[#B9D9C7]/50 bg-[#F4F9F6] p-4 text-xs sm:text-sm text-[#191B20]/80 flex items-center gap-3">
              <span className="text-base select-none">✨</span>
              <p>
                <strong>Interactive preview:</strong> Tap the voice note to hear the scrubber, click the Alfama photo to enlarge, or send a test reply.
              </p>
            </div>
          </div>

          {/* ========================================================
              PART B: PRODUCT CHAT SHOWCASE
              ======================================================== */}
          <div className="lg:col-span-7 w-full">
            <div
              className="relative rounded-2xl border border-[var(--c-divider)] bg-white shadow-[0_20px_50px_-20px_rgba(25,29,37,0.15)] overflow-hidden flex flex-col md:flex-row h-[620px]"
              role="region"
              aria-label="Talkyy private chat preview"
            >
              {/* Restrained Sidebar / Conversation List (Desktop & Tablet) */}
              <aside
                className="hidden md:flex flex-col w-[210px] lg:w-[225px] border-r border-[var(--c-divider)] bg-[#FAF8F3] shrink-0 select-none"
                aria-label="Conversation list"
              >
                {/* Sidebar Header */}
                <div className="p-3.5 border-b border-[var(--c-divider)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-xs tracking-wider text-[var(--c-primary-ink)] uppercase">
                      Direct Chats
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[var(--c-soft-blue-surface)] text-[10px] font-bold text-[#2858E8]">
                      3
                    </span>
                  </div>
                  <FiSearch className="text-[var(--c-secondary-ink)] h-3.5 w-3.5" aria-hidden="true" />
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto subtle-scrollbar p-2 flex flex-col gap-1">
                  {/* Elena Costa (Active) */}
                  <button
                    type="button"
                    onClick={() => setSelectedContact('elena')}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                      selectedContact === 'elena'
                        ? 'bg-white border border-[var(--c-divider)] shadow-xs'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src="/assets/cast/elena.jpg"
                        alt="Elena Costa"
                        className="w-9 h-9 rounded-full object-cover border border-[var(--c-divider)]"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] border-2 border-white rounded-full"
                        title="Online"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--c-primary-ink)] truncate">
                          Elena Costa
                        </span>
                        <span className="text-[10px] text-[var(--c-secondary-ink)]">10:45 AM</span>
                      </div>
                      <p className="text-[11px] text-[#2858E8] truncate font-medium mt-0.5">
                        🎙️ Voice note (0:18)
                      </p>
                    </div>
                  </button>

                  {/* Marcus Vance */}
                  <button
                    type="button"
                    onClick={() => setSelectedContact('marcus')}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                      selectedContact === 'marcus'
                        ? 'bg-white border border-[var(--c-divider)] shadow-xs'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src="/assets/cast/marcus.jpg"
                        alt="Marcus Vance"
                        className="w-9 h-9 rounded-full object-cover border border-[var(--c-divider)]"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] border-2 border-white rounded-full"
                        title="Online"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--c-primary-ink)] truncate">
                          Marcus Vance
                        </span>
                        <span className="text-[10px] text-[var(--c-secondary-ink)]">9:12 AM</span>
                      </div>
                      <p className="text-[11px] text-[var(--c-secondary-ink)] truncate mt-0.5">
                        Audio stems reviewed
                      </p>
                    </div>
                  </button>

                  {/* Sofia Chen */}
                  <button
                    type="button"
                    onClick={() => setSelectedContact('sofia')}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                      selectedContact === 'sofia'
                        ? 'bg-white border border-[var(--c-divider)] shadow-xs'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src="/assets/cast/sofia.jpg"
                        alt="Sofia Chen"
                        className="w-9 h-9 rounded-full object-cover border border-[var(--c-divider)]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--c-primary-ink)] truncate">
                          Sofia Chen
                        </span>
                        <span className="text-[10px] text-[var(--c-secondary-ink)]">Yesterday</span>
                      </div>
                      <p className="text-[11px] text-[var(--c-secondary-ink)] truncate mt-0.5">
                        Added 2 trail photos
                      </p>
                    </div>
                  </button>
                </div>

                {/* Sidebar Footer Trust Notice */}
                <div className="p-3 border-t border-[var(--c-divider)] bg-[#FAF8F3] text-[10px] text-[var(--c-secondary-ink)] flex items-center gap-1.5">
                  <FiLock className="text-[#2858E8] shrink-0" />
                  <span className="truncate">End-to-end encrypted</span>
                </div>
              </aside>

              {/* Active Conversation Panel */}
              <div className="flex-1 flex flex-col h-full bg-white min-w-0">
                {/* Conversation Header */}
                <header className="px-4 py-3 border-b border-[var(--c-divider)] bg-white/95 backdrop-blur-xs flex items-center justify-between z-10 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src="/assets/cast/elena.jpg"
                        alt="Elena Costa"
                        className="w-10 h-10 rounded-full object-cover border border-[var(--c-divider)]"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] border-2 border-white rounded-full animate-pulse"
                        title="Online"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--c-primary-ink)] truncate">
                          Elena Costa
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--c-soft-blue-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[#2858E8]">
                          <FiLock className="h-2.5 w-2.5" />
                          E2EE
                        </span>
                      </div>
                      <p className="text-xs text-[var(--c-secondary-ink)] truncate">
                        Active now · Lisbon, Portugal
                      </p>
                    </div>
                  </div>

                  {/* Header Actions matching real Chatbox.jsx */}
                  <div className="flex items-center gap-1.5 shrink-0" aria-label="Conversation actions">
                    <button
                      type="button"
                      title="Voice call with Elena"
                      className="p-2 rounded-xl bg-[var(--c-warm-paper)] hover:bg-[var(--c-soft-blue-surface)] border border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-colors"
                      aria-label="Start voice call"
                    >
                      <IoCall className="text-sm" />
                    </button>
                    <button
                      type="button"
                      title="Video call with Elena"
                      className="p-2 rounded-xl bg-[var(--c-warm-paper)] hover:bg-[var(--c-soft-blue-surface)] border border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-colors"
                      aria-label="Start video call"
                    >
                      <IoVideocam className="text-sm" />
                    </button>
                    <button
                      type="button"
                      title="Contact details"
                      className="p-2 rounded-xl bg-[var(--c-warm-paper)] hover:bg-[var(--c-soft-blue-surface)] border border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-colors"
                      aria-label="View conversation details"
                    >
                      <BsLayoutSidebarReverse className="text-sm" />
                    </button>
                  </div>
                </header>

                {/* Message Stream */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 subtle-scrollbar bg-[#FAF8F5]"
                  role="log"
                  aria-live="polite"
                  aria-label="Message stream"
                >
                  {/* Day separator */}
                  <span className="day-chip">Today, October 21</span>

                  {/* Encryption Banner */}
                  <div className="mx-auto max-w-sm rounded-lg border border-[var(--c-divider)] bg-white/90 px-3 py-1.5 text-center text-[11px] text-[var(--c-secondary-ink)] shadow-2xs">
                    <span className="inline-flex items-center gap-1 text-[#2858E8] font-medium mr-1">
                      <FiLock className="h-3 w-3" /> E2E Encrypted:
                    </span>
                    Messages and calls stay between you and Elena.
                  </div>

                  {/* Message 1: Outgoing from Marcus (User) */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="bubble bubble--out text-sm max-w-xs sm:max-w-sm shadow-xs">
                      Morning Elena! How's the light in Lisbon today?
                    </div>
                    <div className="bubble-meta pr-1">
                      <span>10:38 AM</span>
                      <span className="text-[#38bdf8] flex items-center" title="Read">
                        <IoCheckmarkDone className="text-sm" />
                      </span>
                    </div>
                  </div>

                  {/* Message 2: Incoming from Elena */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="bubble bubble--in text-sm border border-[var(--c-divider)] max-w-xs sm:max-w-sm shadow-xs">
                      Incredible! Caught Tram 28 climbing up through Alfama right as the sun hit the stone.
                    </div>
                    <div className="bubble-meta pl-1">
                      <span>10:41 AM</span>
                    </div>
                  </div>

                  {/* Message 3: Incoming Photo Attachment */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="relative rounded-2xl border border-[var(--c-divider)] bg-white p-2 shadow-xs max-w-[260px] sm:max-w-[300px]">
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-xl bg-black/5 aspect-[4/3]"
                        onClick={() => setIsPhotoModalOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setIsPhotoModalOpen(true);
                        }}
                        aria-label="Enlarge Lisbon Tram photo"
                      >
                        <img
                          src="/assets/moments/lisbon-tram.jpg"
                          alt="Tram 28 climbing the steep Alfama hill in Lisbon"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="rounded-full bg-white/90 p-2 text-[#191B20] shadow-md backdrop-blur-xs">
                            <FiMaximize2 className="h-4 w-4" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[var(--c-secondary-ink)]">
                        <span className="font-medium truncate">Tram 28 · Alfama</span>
                        <span className="text-[10px]">1.1 MB</span>
                      </div>

                      {/* Interactive Reaction Badge */}
                      <button
                        type="button"
                        onClick={handleToggleReaction}
                        className={`absolute -bottom-2.5 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs reaction-pop cursor-pointer ${
                          hasUserReacted
                            ? 'bg-[#E8EEFF] border-[#2858E8] text-[#2858E8] shadow-xs'
                            : 'bg-white border-[var(--c-divider)] text-[var(--c-primary-ink)] hover:border-[#2858E8]/40 hover:bg-[#FAF8F3]'
                        }`}
                        title="React with heart"
                        aria-label={`Reaction: Heart, count ${photoReactionCount}`}
                      >
                        <span className="inline-block transition-transform duration-150 active:scale-125">❤️</span>
                        <span>{photoReactionCount}</span>
                      </button>
                    </div>

                    <div className="bubble-meta pl-1 mt-1">
                      <span>10:42 AM</span>
                    </div>
                  </div>

                  {/* Message 4: Outgoing reply */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="bubble bubble--out text-sm max-w-xs sm:max-w-sm shadow-xs">
                      That morning glow is unreal. Did you record the street sounds?
                    </div>
                    <div className="bubble-meta pr-1">
                      <span>10:44 AM</span>
                      <span className="text-[#38bdf8] flex items-center" title="Read">
                        <IoCheckmarkDone className="text-sm" />
                      </span>
                    </div>
                  </div>

                  {/* Message 5: Incoming Voice Message */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-3 shadow-xs w-64 sm:w-72">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={toggleVoiceNote}
                          className="h-9 w-9 rounded-full bg-[#2858E8] text-white flex items-center justify-center hover:bg-[#173BB5] hover:scale-105 active:scale-95 transition-all duration-150 shrink-0 shadow-xs cursor-pointer"
                          aria-label={isPlayingVoice ? 'Pause voice message' : 'Play voice message'}
                        >
                          {isPlayingVoice ? (
                            <IoPause className="text-base" />
                          ) : (
                            <IoPlay className="text-base ml-0.5" />
                          )}
                        </button>

                        {/* Interactive Waveform Visualizer */}
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-7 flex items-center gap-[3px] px-1 overflow-hidden">
                            {WAVEFORM_HEIGHTS.map((height, idx) => {
                              const barPercent = (idx / WAVEFORM_HEIGHTS.length) * 100;
                              const isPast = barPercent <= voicePercent;
                              return (
                                <span
                                  key={idx}
                                  className="w-[3px] rounded-full transition-all duration-150"
                                  style={{
                                    height: `${Math.round(height * 24)}px`,
                                    backgroundColor: isPast ? '#2858E8' : '#DCDAD3',
                                    transform: isPlayingVoice && isPast ? 'scaleY(1.15)' : 'scaleY(1)'
                                  }}
                                />
                              );
                            })}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-[var(--c-secondary-ink)] px-1">
                            <span className="font-mono font-medium">
                              {isPlayingVoice ? formattedVoiceTime : '0:18'}
                            </span>
                            <span className="font-medium text-[10px] text-[#2858E8]">Voice note</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bubble-meta pl-1">
                      <span>10:45 AM</span>
                    </div>
                  </div>

                  {/* Dynamic user messages sent via preview composer */}
                  {extraMessages.map((m) => (
                    <div key={m.id} className="flex flex-col items-end gap-1 animate-fadeIn">
                      <div className="bubble bubble--out text-sm max-w-xs sm:max-w-sm shadow-xs">
                        {m.text}
                      </div>
                      <div className="bubble-meta pr-1">
                        <span>{m.time}</span>
                        <span className="text-[#38bdf8] flex items-center" title="Delivered">
                          <IoCheckmarkDone className="text-sm" />
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Subtle live typing indicator */}
                  <div className="flex items-center gap-2 pt-1 pl-1">
                    <img
                      src="/assets/cast/elena.jpg"
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-[var(--c-divider)]"
                    />
                    <div className="rounded-full bg-white border border-[var(--c-divider)] px-3 py-1 flex items-center gap-1.5 shadow-2xs">
                      <span className="text-[11px] font-medium text-[var(--c-secondary-ink)]">
                        Elena is typing
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '180ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '360ms' }} />
                      </span>
                    </div>
                  </div>

                  <div ref={messageEndRef} />
                </div>

                {/* Message Composer (Authentic Talkyy UI) */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-[var(--c-divider)] bg-white flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    title="Insert emoji"
                    className="p-2 rounded-lg text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-[var(--c-warm-paper)] transition-colors"
                    aria-label="Open emoji picker"
                  >
                    <GrEmoji className="text-lg" />
                  </button>

                  <button
                    type="button"
                    title="Attach photo or document"
                    className="p-2 rounded-lg text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-[var(--c-warm-paper)] transition-colors"
                    aria-label="Add attachment"
                  >
                    <LuPaperclip className="text-lg" />
                  </button>

                  <input
                    type="text"
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Type a message to Elena..."
                    className="flex-1 bg-[var(--c-warm-paper)] border border-[var(--c-divider)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--c-primary-ink)] placeholder:text-[var(--c-secondary-ink)]/70 focus:outline-hidden focus:border-[#2858E8] focus:bg-white transition-all"
                    aria-label="Type message preview"
                  />

                  <button
                    type="button"
                    title="Record voice note"
                    className="p-2 rounded-lg text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-[var(--c-warm-paper)] transition-colors"
                    aria-label="Record voice note"
                  >
                    <IoMic className="text-lg" />
                  </button>

                  <button
                    type="submit"
                    title="Send message"
                    className="p-2.5 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] text-white shadow-xs transition-colors shrink-0"
                    aria-label="Send message"
                  >
                    <IoSend className="text-sm" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PHOTO LIGHTBOX MODAL (When visitor taps the photo)
          ======================================================== */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-modal-caption"
        >
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-[var(--c-divider)]">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              aria-label="Close photo view"
            >
              <IoClose className="text-xl" />
            </button>
            <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src="/assets/moments/lisbon-tram.jpg"
                alt="Tram 28 climbing through Alfama, Lisbon"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
            <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 id="photo-modal-caption" className="font-semibold text-sm sm:text-base text-[var(--c-primary-ink)]">
                  Tram 28 climbing the steep Alfama hill
                </h4>
                <p className="text-xs text-[var(--c-secondary-ink)] mt-0.5">
                  Shared by Elena Costa · Lisbon, Portugal · 10:42 AM
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="landing-btn landing-btn--ghost text-xs h-9 px-4 self-end sm:self-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PrivateMessagingSection;
