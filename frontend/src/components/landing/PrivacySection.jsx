import React from 'react';
import { FiLock, FiShield, FiHeart } from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';

/**
 * Phase 5.5 (Refined): Privacy, Encryption & Trust Section
 *
 * Replaces the technical architecture dashboard with an editorial, human-centered
 * experience that builds confidence and trust:
 * - Eyebrow: "YOUR SPACE. YOUR CONVERSATIONS."
 * - Expressive Headline: "Some things should stay between you."
 * - Supporting copy focused on personal connection rather than jargon
 * - Three unboxed, concise trust statements
 * - Human-centered visual: Elena Costa (Lisbon) in warm natural light with a subtle,
 *   authentic Talkyy message snippet and restrained lock cue
 * - Quiet closing editorial statement
 */
const PrivacySection = () => {
  return (
    <section
      id="privacy"
      className="landing-section relative bg-white border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-privacy"
      aria-labelledby="privacy-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ========================================================
              PART A: EDITORIAL INTRODUCTION & TRUST STATEMENTS (Left)
              ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-pulse" aria-hidden="true" />
              <FiLock className="h-3 w-3" aria-hidden="true" />
              <span className="tracking-wide">YOUR SPACE. YOUR CONVERSATIONS.</span>
            </div>

            <h2
              id="privacy-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.85rem] lg:leading-[1.14]"
            >
              Some things should
              <br className="hidden sm:inline" />
              <span className="text-[#2858E8]"> stay between you.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--c-secondary-ink)] max-w-xl">
              Your conversations are personal. Talkyy is built with privacy in mind, so you can focus on the people you're talking to—not the technology behind it.
            </p>

            {/* Three Concise Trust Statements (Unboxed & Typographic) */}
            <div className="mt-9 flex flex-col gap-4 pt-8 border-t border-[var(--c-divider)] max-w-lg">
              {/* Statement 1 */}
              <div className="group p-2 -ml-2 rounded-xl transition-all duration-200 hover:bg-[#FAF8F5] flex items-start gap-3.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--c-soft-blue-surface)] text-[#2858E8] transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <FiLock className="h-3 w-3" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)] group-hover:text-[#2858E8] transition-colors">
                    Private conversations
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Designed to keep your personal conversations private.
                  </p>
                </div>
              </div>

              {/* Statement 2 */}
              <div className="group p-2 -ml-2 rounded-xl transition-all duration-200 hover:bg-[#FAF8F5] flex items-start gap-3.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--c-soft-blue-surface)] text-[#2858E8] transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <FiShield className="h-3 w-3" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)] group-hover:text-[#2858E8] transition-colors">
                    Your messages, protected
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Message protection is built into the Talkyy experience.
                  </p>
                </div>
              </div>

              {/* Statement 3 */}
              <div className="group p-2 -ml-2 rounded-xl transition-all duration-200 hover:bg-[#FAF8F5] flex items-start gap-3.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--c-soft-blue-surface)] text-[#2858E8] transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <FiHeart className="h-3 w-3" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--c-primary-ink)] group-hover:text-[#2858E8] transition-colors">
                    Thoughtful by design
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--c-secondary-ink)] leading-relaxed">
                    Privacy is considered in how conversations are handled.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              PART B: HUMAN-CENTERED VISUAL COMPOSITION (Right)
              ======================================================== */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-2xl border border-[var(--c-divider)] bg-[#FAF8F5] overflow-hidden shadow-[0_20px_50px_-20px_rgba(25,29,37,0.12)] max-w-lg mx-auto lg:mx-0 lg:max-w-none">
              {/* Primary Human Imagery: Elena Costa in Lisbon */}
              <div className="relative aspect-[4/3] sm:aspect-[14/10] overflow-hidden bg-[#EAE6DD]">
                <img
                  src="/assets/calls/call-elena.jpg"
                  alt="Elena Costa in natural morning sunlight in Lisbon, enjoying a quiet conversation"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />

                {/* Subtle warm ambient gradient for visual balance */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Top-Right Location Tag */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-[var(--c-primary-ink)] shadow-xs border border-white/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    Elena · Lisbon
                  </span>
                </div>

                {/* Restrained In-Context Message Snippet */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="rounded-xl border border-white/30 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 shadow-lg text-xs sm:text-sm">
                    {/* Quiet Privacy Cue Header */}
                    <div className="flex items-center justify-between border-b border-[var(--c-divider)]/60 pb-2 mb-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#2858E8] uppercase">
                        <FiLock className="h-3 w-3" />
                        Private Conversation
                      </span>
                      <span className="text-[10px] text-[var(--c-secondary-ink)]">
                        Just the two of you
                      </span>
                    </div>

                    {/* Fictional Message Sequence */}
                    <div className="flex flex-col gap-2">
                      {/* Incoming snippet */}
                      <div className="flex flex-col items-start">
                        <div className="bubble bubble--in text-xs sm:text-[13px] py-1.5 px-3 bg-[#FAF8F5] border border-[var(--c-divider)]">
                          Are you free to catch up later? Just the two of us.
                        </div>
                        <span className="bubble-meta pl-1 mt-0.5 text-[10px]">3:42 PM</span>
                      </div>

                      {/* Outgoing snippet */}
                      <div className="flex flex-col items-end">
                        <div className="bubble bubble--out text-xs sm:text-[13px] py-1.5 px-3 shadow-2xs">
                          Always. Calling you at five.
                        </div>
                        <div className="bubble-meta pr-1 mt-0.5 text-[10px] flex items-center gap-1">
                          <span>3:43 PM</span>
                          <span className="text-[#38bdf8] flex items-center" title="Read">
                            <IoCheckmarkDone className="text-xs" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            PART C: ONE QUIET PRIVACY STATEMENT
            ======================================================== */}
        <div className="mt-14 pt-6 border-t border-[var(--c-divider)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[var(--c-secondary-ink)]">
          <p className="italic">
            “Privacy is built into the experience—not added as an afterthought.”
          </p>
          <span className="font-display font-semibold text-[var(--c-primary-ink)] tracking-tight">
            Talkyy
          </span>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
