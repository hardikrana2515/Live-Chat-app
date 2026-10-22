import React, { useState, useEffect } from 'react';
import {
  IoCall,
  IoVideocam,
  IoCheckmarkDone,
  IoClose,
  IoPeopleOutline,
  IoSend,
  IoCheckmarkCircle
} from 'react-icons/io5';
import { LuCrown, LuUsers, LuSlidersHorizontal } from 'react-icons/lu';
import { FiShield, FiMaximize2, FiSearch, FiCheck } from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

// Fictional group members from Phase 4 cast
const GROUP_MEMBERS = [
  {
    id: 'sofia',
    name: 'Sofia Chen',
    role: 'Creator',
    location: 'Vancouver',
    avatar: '/assets/cast/sofia.jpg',
    online: true,
    isCreator: true,
    accentColor: '#0F766E'
  },
  {
    id: 'dev',
    name: 'Dev Patel',
    role: 'Admin',
    location: 'Bristol',
    avatar: '/assets/cast/dev.jpg',
    online: true,
    isAdmin: true,
    accentColor: '#D97706'
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'You',
    location: 'London',
    avatar: '/assets/cast/marcus.jpg',
    online: true,
    isSelf: true,
    accentColor: '#173BB5'
  },
  {
    id: 'elena',
    name: 'Elena Costa',
    role: 'Member',
    location: 'Lisbon',
    avatar: '/assets/cast/elena.jpg',
    online: false,
    accentColor: '#2858E8'
  },
  {
    id: 'leo',
    name: 'Grandfather Leo',
    role: 'Member',
    location: 'Florence',
    avatar: '/assets/cast/leo.jpg',
    online: false,
    accentColor: '#78350F'
  }
];

/**
 * Phase 5.3: Group Messaging & Collaboration Section
 *
 * Showcases Talkyy's group conversation experience:
 * - Editorial introduction: Space Grotesk heading, DM Sans body, three concise supporting points
 * - Product Showcase: "Weekend Hikers" group conversation with 5 participants
 * - Authentic features: Sender avatars/names, photo sharing (Alpine trail),
 *   interactive Poll voting with live percentage recalculation, reaction toggling,
 *   active members panel, and composer.
 */
const GroupMessagingSection = () => {
  // Active view mode in group showcase: 'chat' or 'members'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'members'

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Reaction state for Alpine photo
  const [fireReactionCount, setFireReactionCount] = useState(3);
  const [hasUserReactedFire, setHasUserReactedFire] = useState(false);

  // Interactive Poll State (mirrors Talkyy PollMessage.jsx)
  const [votedOptionIndex, setVotedOptionIndex] = useState(null); // null, 0, or 1
  const [pollVotes, setPollVotes] = useState({
    opt0: 3, // "Alpine Lake Lookout (8:30 AM)"
    opt1: 2  // "Pine Ridge Base (9:00 AM)"
  });

  // Handle poll voting
  const handleVote = (optionIndex) => {
    if (votedOptionIndex === optionIndex) {
      // Undo vote
      setPollVotes((prev) => ({
        ...prev,
        [`opt${optionIndex}`]: prev[`opt${optionIndex}`] - 1
      }));
      setVotedOptionIndex(null);
    } else {
      // New or switched vote
      setPollVotes((prev) => {
        const next = { ...prev };
        if (votedOptionIndex !== null) {
          next[`opt${votedOptionIndex}`] -= 1;
        }
        next[`opt${optionIndex}`] += 1;
        return next;
      });
      setVotedOptionIndex(optionIndex);
    }
  };

  const totalVotes = pollVotes.opt0 + pollVotes.opt1;
  const pctOpt0 = totalVotes > 0 ? Math.round((pollVotes.opt0 / totalVotes) * 100) : 0;
  const pctOpt1 = totalVotes > 0 ? Math.round((pollVotes.opt1 / totalVotes) * 100) : 0;

  // Photo reaction toggle
  const handleToggleFire = () => {
    if (hasUserReactedFire) {
      setFireReactionCount((c) => c - 1);
      setHasUserReactedFire(false);
    } else {
      setFireReactionCount((c) => c + 1);
      setHasUserReactedFire(true);
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!isPhotoModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsPhotoModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhotoModalOpen]);

  return (
    <section
      id="groups"
      className="landing-section relative bg-white border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-groups"
      aria-labelledby="group-messaging-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ========================================================
              PART A: PRODUCT GROUP CHAT SHOWCASE (Left Column)
              ======================================================== */}
          <div className="lg:col-span-7 w-full order-last lg:order-first">
            <div
              className="relative rounded-2xl border border-[var(--c-divider)] bg-[#FAF8F5] shadow-[0_20px_50px_-20px_rgba(25,29,37,0.12)] overflow-hidden flex flex-col h-[640px]"
              role="region"
              aria-label="Talkyy group chat preview"
            >
              {/* Group Header */}
              <header className="px-4 py-3 border-b border-[var(--c-divider)] bg-white flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#E8EEFF] border border-[#2858E8]/20 flex items-center justify-center text-[#2858E8] font-display font-bold text-base">
                      🏔️
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--c-primary-ink)] truncate">
                        Weekend Hikers
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded bg-[var(--c-soft-blue-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[#2858E8]">
                        5 members
                      </span>
                    </div>
                    <p className="text-xs text-[var(--c-secondary-ink)] truncate">
                      Sofia, Dev, Marcus, Elena, Leo
                    </p>
                  </div>
                </div>

                {/* View switcher tabs: Chat vs Members */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="inline-flex rounded-xl bg-[var(--c-warm-paper)] p-1 border border-[var(--c-divider)] text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                        activeTab === 'chat'
                          ? 'bg-white text-[var(--c-primary-ink)] shadow-2xs font-semibold scale-[1.02]'
                          : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white/50 active:scale-95'
                      }`}
                      aria-pressed={activeTab === 'chat'}
                    >
                      Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('members')}
                      className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'members'
                          ? 'bg-white text-[var(--c-primary-ink)] shadow-2xs font-semibold scale-[1.02]'
                          : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white/50 active:scale-95'
                      }`}
                      aria-pressed={activeTab === 'members'}
                    >
                      <LuUsers className="text-xs" />
                      <span>Roster</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    title="Group voice or video call"
                    className="p-2 rounded-xl bg-[var(--c-warm-paper)] hover:bg-[var(--c-soft-blue-surface)] border border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-colors hidden sm:flex"
                    aria-label="Start group call"
                  >
                    <IoVideocam className="text-sm" />
                  </button>
                </div>
              </header>

              {/* View 1: Group Chat Stream */}
              {activeTab === 'chat' && (
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 subtle-scrollbar bg-[#FAF8F5]"
                  role="log"
                  aria-live="polite"
                  aria-label="Group message stream"
                >
                  <span className="day-chip">Today, 8:12 AM</span>

                  {/* Message 1: Sofia Chen (Creator) */}
                  <div className="flex items-start gap-2.5 max-w-md">
                    <img
                      src="/assets/cast/sofia.jpg"
                      alt="Sofia Chen"
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[var(--c-divider)]"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#0F766E]">
                          Sofia Chen
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 text-[9px] font-semibold bg-[#0F766E]/10 text-[#0F766E]">
                          <LuCrown className="text-[9px]" /> Creator
                        </span>
                      </div>
                      <div className="bubble bubble--in text-sm border border-[var(--c-divider)] shadow-2xs">
                        Morning hikers! Dev scouted the North Ridge trail this morning — conditions are looking prime for Saturday.
                      </div>
                      <span className="bubble-meta pl-1 text-[10px]">8:12 AM</span>
                    </div>
                  </div>

                  {/* Message 2: Dev Patel (Admin) - Shared Photo */}
                  <div className="flex items-start gap-2.5 max-w-md">
                    <img
                      src="/assets/cast/dev.jpg"
                      alt="Dev Patel"
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[var(--c-divider)]"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#D97706]">
                          Dev Patel
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 text-[9px] font-semibold bg-[#D97706]/10 text-[#D97706]">
                          <FiShield className="text-[9px]" /> Admin
                        </span>
                      </div>

                      {/* Photo Card */}
                      <div className="relative rounded-2xl border border-[var(--c-divider)] bg-white p-2 shadow-xs max-w-[260px] sm:max-w-[290px]">
                        <div
                          className="relative group cursor-pointer overflow-hidden rounded-xl bg-black/5 aspect-[4/3]"
                          onClick={() => setIsPhotoModalOpen(true)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setIsPhotoModalOpen(true);
                          }}
                          aria-label="Enlarge Alpine Trail photo"
                        >
                          <img
                            src="/assets/moments/alpine-trail.jpg"
                            alt="Alpine Lake Trail scenic view"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="rounded-full bg-white/90 p-2 text-[#191B20] shadow-md backdrop-blur-xs">
                              <FiMaximize2 className="h-4 w-4" />
                            </span>
                          </div>
                        </div>

                        <div className="mt-1.5 px-1">
                          <p className="text-xs text-[var(--c-primary-ink)] font-medium leading-snug">
                            Pine air is 10/10 today. Ridge loop is clear of mud.
                          </p>
                          <span className="text-[10px] text-[var(--c-secondary-ink)]">
                            Alpine Trail · 8:14 AM
                          </span>
                        </div>

                        {/* Interactive Reaction Badge */}
                        <button
                          type="button"
                          onClick={handleToggleFire}
                          className={`reaction-pop absolute -bottom-2.5 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs select-none cursor-pointer transition-all duration-150 ${
                            hasUserReactedFire
                              ? 'bg-[#E8EEFF] border-[#2858E8] text-[#2858E8] shadow-sm'
                              : 'bg-white border-[var(--c-divider)] text-[var(--c-primary-ink)] hover:border-[#2858E8]/40 hover:bg-[#FAF8F5]'
                          }`}
                          title="React with fire"
                          aria-label={`Reaction: Fire, count ${fireReactionCount}`}
                        >
                          <span className="transition-transform duration-150 group-hover:scale-110">🔥</span>
                          <span>{fireReactionCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message 3: Interactive Group Poll (Dev Patel) */}
                  <div className="flex items-start gap-2.5 max-w-md">
                    <img
                      src="/assets/cast/dev.jpg"
                      alt="Dev Patel"
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[var(--c-divider)]"
                    />
                    <div className="flex flex-col gap-1 min-w-0 w-full max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#D97706]">
                          Dev Patel
                        </span>
                        <span className="text-[10px] text-[var(--c-secondary-ink)]">
                          created a poll
                        </span>
                      </div>

                      {/* Interactive Poll Card (mirrors Talkyy PollMessage.jsx) */}
                      <div className="bg-white p-3.5 rounded-2xl border border-[var(--c-divider)] shadow-xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2858E8] mb-2">
                          <MdHowToVote className="text-sm" />
                          <span>Group Poll</span>
                        </div>

                        <h4 className="font-semibold text-xs sm:text-sm text-[var(--c-primary-ink)] mb-3 leading-snug">
                          Which trailhead should we meet at Saturday?
                        </h4>

                        <div className="flex flex-col gap-2">
                          {/* Option 0 */}
                          <button
                            type="button"
                            onClick={() => handleVote(0)}
                            className={`relative w-full overflow-hidden text-left rounded-xl border p-2.5 text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-2xs active:translate-y-0 ${
                              votedOptionIndex === 0
                                ? 'border-[#2858E8] bg-[#E8EEFF]/30 shadow-2xs'
                                : 'border-[var(--c-divider)] hover:border-[#2858E8]/50 bg-white'
                            }`}
                            aria-pressed={votedOptionIndex === 0}
                          >
                            {/* Vote fill bar */}
                            <div
                              className="absolute inset-y-0 left-0 bg-[#E8EEFF] transition-all duration-500 ease-out -z-0"
                              style={{ width: `${pctOpt0}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                    votedOptionIndex === 0
                                      ? 'border-[#2858E8] bg-[#2858E8] scale-105'
                                      : 'border-[var(--c-divider)]'
                                  }`}
                                >
                                  {votedOptionIndex === 0 && (
                                    <IoCheckmarkCircle className="text-white text-[10px]" />
                                  )}
                                </span>
                                <span className="font-medium text-[var(--c-primary-ink)] truncate">
                                  Alpine Lake Lookout (8:30 AM)
                                </span>
                              </div>
                              <span className="font-semibold text-[#2858E8] text-[11px] shrink-0 tabular-nums">
                                {pctOpt0}%
                              </span>
                            </div>
                          </button>

                          {/* Option 1 */}
                          <button
                            type="button"
                            onClick={() => handleVote(1)}
                            className={`relative w-full overflow-hidden text-left rounded-xl border p-2.5 text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-2xs active:translate-y-0 ${
                              votedOptionIndex === 1
                                ? 'border-[#2858E8] bg-[#E8EEFF]/30 shadow-2xs'
                                : 'border-[var(--c-divider)] hover:border-[#2858E8]/50 bg-white'
                            }`}
                            aria-pressed={votedOptionIndex === 1}
                          >
                            {/* Vote fill bar */}
                            <div
                              className="absolute inset-y-0 left-0 bg-[#E8EEFF] transition-all duration-500 ease-out -z-0"
                              style={{ width: `${pctOpt1}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                    votedOptionIndex === 1
                                      ? 'border-[#2858E8] bg-[#2858E8] scale-105'
                                      : 'border-[var(--c-divider)]'
                                  }`}
                                >
                                  {votedOptionIndex === 1 && (
                                    <IoCheckmarkCircle className="text-white text-[10px]" />
                                  )}
                                </span>
                                <span className="font-medium text-[var(--c-primary-ink)] truncate">
                                  Pine Ridge Base (9:00 AM)
                                </span>
                              </div>
                              <span className="font-semibold text-[#2858E8] text-[11px] shrink-0 tabular-nums">
                                {pctOpt1}%
                              </span>
                            </div>
                          </button>
                        </div>

                        <div className="mt-2 text-[10px] text-[var(--c-secondary-ink)] flex items-center justify-between px-0.5">
                          <span>{totalVotes} total votes</span>
                          <span className="text-[#2858E8] font-medium">Tap option to vote</span>
                        </div>
                      </div>

                      <span className="bubble-meta pl-1 text-[10px]">8:15 AM</span>
                    </div>
                  </div>

                  {/* Message 4: Elena Costa (Member) */}
                  <div className="flex items-start gap-2.5 max-w-md">
                    <img
                      src="/assets/cast/elena.jpg"
                      alt="Elena Costa"
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[var(--c-divider)]"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2858E8]">
                          Elena Costa
                        </span>
                      </div>
                      <div className="bubble bubble--in text-sm border border-[var(--c-divider)] shadow-2xs">
                        Alpine Lake gets my vote! The morning light hitting the water will be magnificent ⛰️
                      </div>
                      <span className="bubble-meta pl-1 text-[10px]">8:18 AM</span>
                    </div>
                  </div>

                  {/* Message 5: Marcus Vance (You / Outgoing) */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="bubble bubble--out text-sm max-w-xs sm:max-w-sm shadow-xs">
                      Count me in for Alpine Lake. Packing the field filters and trail snacks. See everyone at 8:30!
                    </div>
                    <div className="bubble-meta pr-1">
                      <span>8:21 AM</span>
                      <span className="text-[#38bdf8] flex items-center" title="Read by 4 members">
                        <IoCheckmarkDone className="text-sm" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Group Member Roster (matches GroupSetting.jsx) */}
              {activeTab === 'members' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 subtle-scrollbar bg-white">
                  <div className="flex items-center justify-between border-b border-[var(--c-divider)] pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--c-primary-ink)]">
                        Group Roster
                      </h4>
                      <p className="text-xs text-[var(--c-secondary-ink)] mt-0.5">
                        5 participants in "Weekend Hikers"
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-xs font-semibold text-[#2858E8]">
                      3 active now
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {GROUP_MEMBERS.map((member) => (
                      <div
                        key={member.id}
                        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 ${
                          member.isSelf
                            ? 'bg-[#FAF8F5] border-[var(--c-divider)]'
                            : 'bg-white border-[var(--c-divider)]/60 hover:border-[#2858E8]/30 hover:bg-[#FAF8F5]/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover border border-[var(--c-divider)] transition-transform duration-150 group-hover:scale-105"
                            />
                            {member.online && (
                              <span
                                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] border-2 border-white rounded-full"
                                title="Online"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-[var(--c-primary-ink)] truncate">
                                {member.name}
                              </span>
                              {member.isSelf && (
                                <span className="rounded bg-[#2858E8]/10 px-1 py-0.2 text-[9px] font-semibold text-[#2858E8]">
                                  You
                                </span>
                              )}
                              {member.isCreator && (
                                <span className="rounded bg-[#0F766E]/10 px-1.5 py-0.2 text-[9px] font-semibold text-[#0F766E] flex items-center gap-0.5">
                                  <LuCrown className="text-[9px]" /> Creator
                                </span>
                              )}
                              {member.isAdmin && (
                                <span className="rounded bg-[#D97706]/10 px-1.5 py-0.2 text-[9px] font-semibold text-[#D97706] flex items-center gap-0.5">
                                  <FiShield className="text-[9px]" /> Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--c-secondary-ink)]">
                              {member.location}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-[var(--c-secondary-ink)] font-medium shrink-0">
                          {member.online ? (
                            <span className="text-[#16a34a] font-semibold">Online</span>
                          ) : (
                            'Offline'
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[var(--c-divider)] text-[11px] text-[var(--c-secondary-ink)] flex items-center justify-between">
                    <span>Admins can add members and manage group details.</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="text-[#2858E8] font-semibold hover:underline"
                    >
                      Back to conversation &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Composer Bar */}
              <div className="p-3 border-t border-[var(--c-divider)] bg-white flex items-center gap-2 shrink-0">
                <div className="flex-1 bg-[var(--c-warm-paper)] border border-[var(--c-divider)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--c-secondary-ink)] flex items-center justify-between select-none">
                  <span>Message Weekend Hikers...</span>
                  <span className="text-[10px] text-[#2858E8] font-medium hidden sm:inline">
                    🔒 E2E Encrypted Group
                  </span>
                </div>
                <button
                  type="button"
                  title="Send message"
                  className="p-2.5 rounded-xl bg-[#2858E8] text-white shadow-xs cursor-default"
                  aria-label="Send message"
                >
                  <IoSend className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              PART B: EDITORIAL INTRODUCTION & SUPPORTING POINTS (Right)
              ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-pulse" aria-hidden="true" />
              <LuUsers className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tracking-wide">GROUP CONVERSATIONS</span>
            </div>

            <h2
              id="group-messaging-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]"
            >
              Your people,
              <br />
              <span className="text-[#2858E8]">all in one place.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--c-secondary-ink)] max-w-xl">
              Bring your team, friends, or community together in a shared space designed for meaningful conversations.
            </p>

            {/* Three Concise Supporting Points */}
            <div className="mt-8 pt-8 border-t border-[var(--c-divider)] flex flex-col gap-6">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <span className="font-display text-xs font-bold">01</span>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Stay in sync
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Follow conversations and see new messages, votes, and photos as they arrive in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <span className="font-display text-xs font-bold">02</span>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Make it yours
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Create a group around the people and topics that matter, with custom icons, member roles, and interactive polls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <span className="font-display text-xs font-bold">03</span>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)]">
                    Keep conversations organized
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Manage members and group details with clear creator and admin controls, without noise or clutter.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive hint */}
            <div className="mt-8 rounded-xl border border-[#B9D9C7]/50 bg-[#F4F9F6] p-4 text-xs sm:text-sm text-[#191B20]/80 flex items-center gap-3">
              <span className="text-base select-none">📊</span>
              <p>
                <strong>Interactive preview:</strong> Tap the poll options to cast a vote and watch the tally recalculate, or click the "Roster" tab to view member roles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PHOTO LIGHTBOX MODAL (When visitor taps the Alpine photo)
          ======================================================== */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alpine-photo-caption"
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
                src="/assets/moments/alpine-trail.jpg"
                alt="Alpine Lake Trail scenic view"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
            <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 id="alpine-photo-caption" className="font-semibold text-sm sm:text-base text-[var(--c-primary-ink)]">
                  Scouted the ridge loop before work. Pine air is 10/10 today!
                </h4>
                <p className="text-xs text-[var(--c-secondary-ink)] mt-0.5">
                  Shared by Dev Patel · "Weekend Hikers" group · 8:14 AM
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

export default GroupMessagingSection;
