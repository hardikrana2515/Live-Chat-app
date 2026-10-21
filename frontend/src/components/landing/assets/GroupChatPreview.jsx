import { useState } from 'react';
import {
  FiLock,
  FiUsers,
  FiMoreVertical,
  FiPaperclip,
  FiBarChart2,
  FiSend,
  FiSmile,
  FiCheck,
  FiCheckCircle
} from 'react-icons/fi';
import { MOMENTS } from './castData';

/**
 * GroupChatPreview - Scenario B: Group Conversation
 * Showcases friends & community interacting naturally with real photos,
 * member avatars, message reactions, and an interactive live poll.
 */
export default function GroupChatPreview() {
  const [userVote, setUserVote] = useState('lake'); // 'lake' | 'ridge' | null
  const [inputText, setInputText] = useState('');
  const [extraGroupMessages, setExtraGroupMessages] = useState([]);
  const [lakeReactions, setLakeReactions] = useState(3);
  const [hasLakeReacted, setHasLakeReacted] = useState(false);

  // Poll vote calculations
  const baseVotes = {
    lake: 3,
    ridge: 1
  };

  const currentVotes = {
    lake: baseVotes.lake + (userVote === 'lake' ? 1 : 0),
    ridge: baseVotes.ridge + (userVote === 'ridge' ? 1 : 0)
  };

  const totalVotes = currentVotes.lake + currentVotes.ridge;
  const lakePercent = Math.round((currentVotes.lake / totalVotes) * 100);
  const ridgePercent = Math.round((currentVotes.ridge / totalVotes) * 100);

  const handleVote = (option) => {
    if (userVote === option) {
      setUserVote(null);
    } else {
      setUserVote(option);
    }
  };

  const toggleReaction = () => {
    if (hasLakeReacted) {
      setHasLakeReacted(false);
      setLakeReactions((r) => r - 1);
    } else {
      setHasLakeReacted(true);
      setLakeReactions((r) => r + 1);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    setExtraGroupMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        senderName: 'Marcus Vance',
        senderAvatar: '/assets/cast/marcus.jpg',
        text: inputText,
        time: 'Just now'
      }
    ]);
    setInputText('');
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--c-divider)] bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Group Chat Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-divider)] bg-[var(--c-warm-paper)] px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar Stack */}
          <div className="relative flex items-center -space-x-2">
            <img
              src="/assets/cast/dev.jpg"
              alt="Dev"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs z-30"
            />
            <img
              src="/assets/cast/sofia.jpg"
              alt="Sofia"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs z-20"
            />
            <img
              src="/assets/cast/elena.jpg"
              alt="Elena"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs z-10"
            />
            <img
              src="/assets/cast/marcus.jpg"
              alt="Marcus"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs z-0"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-[var(--c-primary-ink)]">
                Weekend Hikers 🌲
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-[var(--c-soft-blue-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[#2858E8]">
                <FiLock className="h-2.5 w-2.5" /> E2EE
              </span>
            </div>
            <p className="text-xs text-[var(--c-secondary-ink)]">
              4 members • Dev, Sofia, Elena, Marcus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-[var(--c-secondary-ink)]">
          <button
            title="Group Members"
            className="rounded-lg p-2 hover:bg-white hover:text-[#2858E8] transition-colors"
          >
            <FiUsers className="h-4 w-4" />
          </button>
          <button
            title="More Options"
            className="rounded-lg p-2 hover:bg-white transition-colors"
          >
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 bg-[#FAF8F5] p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[580px]">
        {/* Security Banner */}
        <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-lg bg-[var(--c-soft-blue-surface)]/70 px-3 py-1.5 text-center text-xs text-[var(--c-secondary-ink)] border border-[var(--c-cobalt)]/15">
          <FiLock className="h-3.5 w-3.5 text-[#2858E8] shrink-0" />
          <span>This group is private and end-to-end encrypted.</span>
        </div>

        {/* Date Divider */}
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-medium text-[var(--c-secondary-ink)] border border-[var(--c-divider)] shadow-2xs">
            Saturday Hike Planning
          </span>
        </div>

        {/* Dev Patel: Text intro */}
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
          <img
            src="/assets/cast/dev.jpg"
            alt="Dev Patel"
            className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white mt-0.5"
          />
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#D97706] ml-1">
              Dev Patel <span className="text-[10px] font-normal text-[var(--c-secondary-ink)]">• Host</span>
            </span>
            <div className="rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs text-sm text-[var(--c-primary-ink)]">
              <p>
                Morning everyone! Scouted the trails this morning. Weather looks incredible for Saturday. Here’s the view from the ridge:
              </p>
              <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                8:14 AM
              </span>
            </div>
          </div>
        </div>

        {/* Dev Patel: Mountain Trail Photo */}
        <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
          <div className="h-8 w-8 shrink-0" />
          <div className="rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-2 shadow-2xs overflow-hidden">
            <div className="relative overflow-hidden rounded-xl bg-neutral-100">
              <img
                src={MOMENTS[1].src}
                alt="Alpine Trail View"
                className="w-full max-h-[280px] object-cover transition-transform duration-300 hover:scale-102"
                loading="lazy"
              />
              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur-xs">
                📍 {MOMENTS[1].location}
              </div>
            </div>
            <div className="p-2 pt-2.5">
              <p className="text-sm text-[var(--c-primary-ink)]">
                {MOMENTS[1].caption}
              </p>
              <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                8:15 AM
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Talkyy Poll */}
        <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
          <div className="h-8 w-8 shrink-0" />
          <div className="w-full rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--c-divider)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--c-soft-blue-surface)] text-[#2858E8]">
                  <FiBarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--c-primary-ink)]">
                    Group Poll • Trail Choice
                  </h4>
                  <p className="text-[11px] text-[var(--c-secondary-ink)]">Created by Dev • {totalVotes} votes</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#16a34a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            {/* Option A: Lake Loop */}
            <div
              onClick={() => handleVote('lake')}
              className={`relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-200 ${
                userVote === 'lake'
                  ? 'border-[#2858E8] bg-[#E8EEFF]/30 ring-1 ring-[#2858E8]'
                  : 'border-[var(--c-divider)] hover:border-[#2858E8]/50'
              }`}
            >
              <div
                className="absolute inset-0 bg-[#E8EEFF] transition-all duration-500 opacity-60"
                style={{ width: `${lakePercent}%` }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                      userVote === 'lake'
                        ? 'border-[#2858E8] bg-[#2858E8] text-white'
                        : 'border-[var(--c-divider)] bg-white'
                    }`}
                  >
                    {userVote === 'lake' && <FiCheck className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--c-primary-ink)] block">
                      Alpine Lake Trail (8.4 km)
                    </span>
                    <span className="text-[10px] text-[var(--c-secondary-ink)]">
                      Lakeside overlook + gentle descent
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Voters avatar cluster */}
                  <div className="flex -space-x-1.5">
                    <img
                      src="/assets/cast/sofia.jpg"
                      alt="Sofia voted"
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                      title="Sofia Chen"
                    />
                    <img
                      src="/assets/cast/elena.jpg"
                      alt="Elena voted"
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                      title="Elena Costa"
                    />
                    <img
                      src="/assets/cast/marcus.jpg"
                      alt="Marcus voted"
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                      title="Marcus Vance"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#2858E8] w-9 text-right font-display">
                    {lakePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Option B: Pine Ridge */}
            <div
              onClick={() => handleVote('ridge')}
              className={`relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-200 ${
                userVote === 'ridge'
                  ? 'border-[#2858E8] bg-[#E8EEFF]/30 ring-1 ring-[#2858E8]'
                  : 'border-[var(--c-divider)] hover:border-[#2858E8]/50'
              }`}
            >
              <div
                className="absolute inset-0 bg-[#E8EEFF] transition-all duration-500 opacity-60"
                style={{ width: `${ridgePercent}%` }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                      userVote === 'ridge'
                        ? 'border-[#2858E8] bg-[#2858E8] text-white'
                        : 'border-[var(--c-divider)] bg-white'
                    }`}
                  >
                    {userVote === 'ridge' && <FiCheck className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--c-primary-ink)] block">
                      Pine Ridge Overlook (5.2 km)
                    </span>
                    <span className="text-[10px] text-[var(--c-secondary-ink)]">
                      Shorter steep ridge loop
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex -space-x-1.5">
                    <img
                      src="/assets/cast/dev.jpg"
                      alt="Dev voted"
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                      title="Dev Patel"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#2858E8] w-9 text-right font-display">
                    {ridgePercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--c-secondary-ink)] pt-1">
              <span>{userVote ? 'Your vote is recorded' : 'Click an option to cast your vote'}</span>
              <span>8:16 AM</span>
            </div>
          </div>
        </div>

        {/* Sofia Chen: Response message */}
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
          <img
            src="/assets/cast/sofia.jpg"
            alt="Sofia Chen"
            className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white mt-0.5"
          />
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#0F766E] ml-1">
              Sofia Chen
            </span>
            <div className="relative group">
              <div className="rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs text-sm text-[var(--c-primary-ink)]">
                <p>
                  Lake Loop 100%! The morning light over the water will be magical. We can stop for lunch at the rock ledge 🥪
                </p>
                <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                  8:18 AM
                </span>
              </div>
              {/* Reaction Pill */}
              <button
                onClick={toggleReaction}
                className={`absolute -bottom-2 right-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 ${
                  hasLakeReacted
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-[var(--c-divider)] text-[var(--c-secondary-ink)]'
                }`}
              >
                <span>⛰️</span>
                <span>{lakeReactions}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Elena Costa: Response */}
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
          <img
            src="/assets/cast/elena.jpg"
            alt="Elena Costa"
            className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white mt-0.5"
          />
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#2858E8] ml-1">
              Elena Costa
            </span>
            <div className="rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs text-sm text-[var(--c-primary-ink)]">
              <p>
                Count me in for the Lake Trail! Marcus, will you bring your coffee thermos again? ☕️
              </p>
              <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                8:20 AM
              </span>
            </div>
          </div>
        </div>

        {/* Extra Interactive Messages */}
        {extraGroupMessages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
            <img
              src={msg.senderAvatar}
              alt={msg.senderName}
              className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white mt-0.5"
            />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#173BB5] ml-1">
                {msg.senderName}
              </span>
              <div className="rounded-2xl rounded-tl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs text-sm text-[var(--c-primary-ink)]">
                <p>{msg.text}</p>
                <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                  {msg.time}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex items-center gap-2 text-xs text-[var(--c-secondary-ink)] pt-1">
          <div className="flex h-5 items-center gap-1 rounded-full bg-white px-2.5 py-1 border border-[var(--c-divider)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[11px]">Marcus Vance is typing...</span>
        </div>
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-[var(--c-divider)] bg-white px-4 py-3"
      >
        <button
          type="button"
          title="Create poll"
          className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[#2858E8] transition"
        >
          <FiBarChart2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Attach photo"
          className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[var(--c-primary-ink)] transition"
        >
          <FiPaperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Add emoji"
          className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[var(--c-primary-ink)] transition"
        >
          <FiSmile className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Reply to Weekend Hikers..."
          className="flex-1 rounded-lg border border-[var(--c-divider)] bg-[var(--c-warm-paper)] px-3.5 py-2 text-sm text-[var(--c-primary-ink)] placeholder-[var(--c-secondary-ink)] focus:border-[#2858E8] focus:bg-white focus:outline-none transition"
        />

        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2858E8] text-white hover:bg-[#173BB5] transition shadow-xs"
        >
          <FiSend className="h-4 w-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
