import { useState, useEffect } from 'react';
import {
  FiLock,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiPaperclip,
  FiMic,
  FiSend,
  FiSmile,
  FiCheck,
  FiPlay,
  FiPause,
  FiHeart
} from 'react-icons/fi';
import { MOMENTS } from './castData';

/**
 * PrivateChatPreview - Scenario A: Private 1-on-1 Conversation
 * Demonstrates intimate human connection between Elena and Marcus
 * using genuine Talkyy design tokens, authentic Lisbon photography,
 * an interactive voice note with waveform, read receipts, and reactions.
 */
export default function PrivateChatPreview() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(28); // percentage
  const [hasHeartReacted, setHasHeartReacted] = useState(true);
  const [heartCount, setHeartCount] = useState(1);
  const [inputText, setInputText] = useState('');
  const [extraMessages, setExtraMessages] = useState([]);

  // Voice note playback simulation
  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const toggleHeart = () => {
    if (hasHeartReacted) {
      setHasHeartReacted(false);
      setHeartCount((c) => c - 1);
    } else {
      setHasHeartReacted(true);
      setHeartCount((c) => c + 1);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    setExtraMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'marcus',
        text: inputText,
        time: 'Just now',
        status: 'read'
      }
    ]);
    setInputText('');
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--c-divider)] bg-white shadow-lg overflow-hidden flex flex-col">
      {/* 1:1 Chat Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-divider)] bg-[var(--c-warm-paper)] px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/assets/cast/elena.jpg"
              alt="Elena Costa"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#16a34a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-[var(--c-primary-ink)]">
                Elena Costa
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-[var(--c-soft-blue-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[#2858E8]">
                <FiLock className="h-2.5 w-2.5" /> E2EE
              </span>
            </div>
            <p className="text-xs text-[var(--c-secondary-ink)] flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
              Active now • Alfama, Lisbon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-[var(--c-secondary-ink)]">
          <button
            title="Start Voice Call"
            className="rounded-lg p-2 hover:bg-white hover:text-[#2858E8] transition-colors"
          >
            <FiPhone className="h-4 w-4" />
          </button>
          <button
            title="Start Video Call"
            className="rounded-lg p-2 hover:bg-white hover:text-[#2858E8] transition-colors"
          >
            <FiVideo className="h-4 w-4" />
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
      <div className="flex-1 bg-[#FAF8F5] p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[560px]">
        {/* Security Banner */}
        <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-lg bg-[var(--c-soft-blue-surface)]/70 px-3 py-2 text-center text-xs text-[var(--c-secondary-ink)] border border-[var(--c-cobalt)]/15">
          <FiLock className="h-3.5 w-3.5 text-[#2858E8] shrink-0" />
          <span>Messages & media are end-to-end encrypted. No one else can read them.</span>
        </div>

        {/* Date Divider */}
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-medium text-[var(--c-secondary-ink)] border border-[var(--c-divider)] shadow-2xs">
            Today
          </span>
        </div>

        {/* Elena: Text Message */}
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <img
            src="/assets/cast/elena.jpg"
            alt="Elena"
            className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-white"
          />
          <div className="rounded-2xl rounded-bl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs text-sm text-[var(--c-primary-ink)]">
            <p>
              Marcus! Made it out into Alfama early this morning. The sunlight reflecting off the cobblestones is something else.
            </p>
            <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
              10:41 AM
            </span>
          </div>
        </div>

        {/* Elena: Lisbon Photo Moment */}
        <div className="flex items-end gap-2 max-w-[90%] sm:max-w-[80%]">
          <div className="h-7 w-7 shrink-0" /> {/* Avatar spacer */}
          <div className="rounded-2xl rounded-bl-sm border border-[var(--c-divider)] bg-white p-2 shadow-2xs overflow-hidden">
            <div className="relative overflow-hidden rounded-xl bg-neutral-100">
              <img
                src={MOMENTS[0].src}
                alt="Lisbon Street Scene"
                className="w-full max-h-[300px] object-cover transition-transform duration-300 hover:scale-102"
                loading="lazy"
              />
              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur-xs flex items-center gap-1">
                📍 {MOMENTS[0].location}
              </div>
            </div>
            <div className="p-2 pt-2.5">
              <p className="text-sm text-[var(--c-primary-ink)]">
                {MOMENTS[0].caption}
              </p>
              <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                10:42 AM
              </span>
            </div>
          </div>
        </div>

        {/* Marcus (Self): Text Response */}
        <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-br-sm bg-[#2858E8] text-white p-3.5 shadow-2xs text-sm">
            <p>
              That yellow tram looks completely timeless! You have to stop at that little bakery on the corner for fresh pastéis de nata.
            </p>
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/80">
              <span>10:43 AM</span>
              <span className="flex text-[#B9D9C7]" title="Delivered & Read">
                <FiCheck className="h-3 w-3 -mr-1.5" />
                <FiCheck className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Elena: Voice Note */}
        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
          <img
            src="/assets/cast/elena.jpg"
            alt="Elena"
            className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-white"
          />
          <div className="relative group">
            <div className="rounded-2xl rounded-bl-sm border border-[var(--c-divider)] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2858E8] text-white transition hover:bg-[#173BB5] shadow-xs active:scale-95"
                >
                  {isPlayingAudio ? (
                    <FiPause className="h-4 w-4" />
                  ) : (
                    <FiPlay className="h-4 w-4 ml-0.5" />
                  )}
                </button>

                {/* Audio Waveform Visualization */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-end gap-1 h-7 cursor-pointer" onClick={() => setIsPlayingAudio(!isPlayingAudio)}>
                    {[35, 60, 45, 80, 65, 95, 40, 70, 85, 55, 30, 75, 90, 60, 45, 70, 85, 40, 65, 50, 35, 20].map((h, i) => {
                      const barPercent = (i / 22) * 100;
                      const isPlayed = barPercent <= audioProgress;
                      return (
                        <span
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isPlayed
                              ? 'bg-[#2858E8]'
                              : 'bg-[var(--c-divider)] group-hover:bg-[#DCDAD3]'
                          } ${isPlayingAudio && isPlayed ? 'animate-pulse' : ''}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--c-secondary-ink)]">
                    <span>{isPlayingAudio ? 'Playing...' : '0:34'}</span>
                    <span>Voice Note</span>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs text-[var(--c-secondary-ink)] italic">
                "Listen to the street guitarist playing right now by the fountain..."
              </p>

              <span className="mt-1 block text-[10px] text-[var(--c-secondary-ink)] text-right">
                10:44 AM
              </span>
            </div>

            {/* Reaction Badge on Voice Note */}
            <button
              onClick={toggleHeart}
              className={`absolute -bottom-2 right-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shadow-xs transition-transform active:scale-90 ${
                hasHeartReacted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-[var(--c-divider)] text-[var(--c-secondary-ink)]'
              }`}
            >
              <FiHeart className={`h-3 w-3 ${hasHeartReacted ? 'fill-rose-500' : ''}`} />
              <span>{heartCount}</span>
            </button>
          </div>
        </div>

        {/* Dynamic User Messages */}
        {extraMessages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-end gap-1 ml-auto max-w-[85%] sm:max-w-[75%]">
            <div className="rounded-2xl rounded-br-sm bg-[#2858E8] text-white p-3.5 shadow-2xs text-sm">
              <p>{msg.text}</p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/80">
                <span>{msg.time}</span>
                <span className="flex text-[#B9D9C7]">
                  <FiCheck className="h-3 w-3 -mr-1.5" />
                  <FiCheck className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        <div className="flex items-center gap-2 text-xs text-[var(--c-secondary-ink)] pt-1">
          <div className="flex h-5 items-center gap-1 rounded-full bg-white px-2.5 py-1 border border-[var(--c-divider)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[11px]">Elena is typing...</span>
        </div>
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-[var(--c-divider)] bg-white px-4 py-3"
      >
        <button
          type="button"
          title="Attach photo or file"
          className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[var(--c-primary-ink)] transition"
        >
          <FiPaperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Emoji picker"
          className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[var(--c-primary-ink)] transition"
        >
          <FiSmile className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message Elena..."
          className="flex-1 rounded-lg border border-[var(--c-divider)] bg-[var(--c-warm-paper)] px-3.5 py-2 text-sm text-[var(--c-primary-ink)] placeholder-[var(--c-secondary-ink)] focus:border-[#2858E8] focus:bg-white focus:outline-none transition"
        />

        {inputText.trim() ? (
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2858E8] text-white hover:bg-[#173BB5] transition shadow-xs"
          >
            <FiSend className="h-4 w-4 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            title="Record Voice Note"
            className="rounded-lg p-2 text-[var(--c-secondary-ink)] hover:bg-[var(--c-warm-paper)] hover:text-[#2858E8] transition"
          >
            <FiMic className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
