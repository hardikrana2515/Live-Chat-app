import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

// Phase 4 Cast avatars for the gentle human presence accent
const CAST_AVATARS = [
  { name: 'Elena Costa', src: '/assets/cast/elena.jpg' },
  { name: 'Marcus Vance', src: '/assets/cast/marcus.jpg' },
  { name: 'Sofia Chen', src: '/assets/cast/sofia.jpg' },
  { name: 'Dev Patel', src: '/assets/cast/dev.jpg' }
];

/**
 * Phase 5.6: Final Conversion-Focused CTA Section
 *
 * Distinctive, memorable closing section:
 * - Headline: "Make room for better conversations." with hand-drawn mint underline
 * - Supporting copy: "Bring your people a little closer with Talkyy."
 * - Primary CTA: "Get started" -> /login
 * - Secondary CTA: "Explore Talkyy" -> #conversations
 * - Human presence: Overlapping avatars of approved Phase 4 cast
 */
const FinalCTA = () => {
  return (
    <section
      className="landing-section landing-section--dark relative overflow-hidden bg-[#191D25] text-[#F7F5EF] landing-panel landing-panel--overlap landing-panel--dark-overlap landing-panel--sticky landing-panel--z-cta"
      aria-labelledby="final-cta-heading"
    >
      {/* Subtle ambient texture with gentle continuous drift */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.09] ambient-pattern"
        style={{ backgroundImage: "url('/chatbg.png')" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Headline & Copy (Left) */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#9FB2F5] border border-white/15 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9D9C7] animate-pulse" aria-hidden="true" />
              <span className="tracking-wide uppercase">START CONNECTING</span>
            </div>

            <h2
              id="final-cta-heading"
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Make room for{' '}
              <span className="landing-mark">
                better conversations.
                <svg viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M4 8C60 2.5 140 10.5 236 4.5"
                    fill="none"
                    stroke="#B9D9C7"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#AEB4C0] max-w-xl">
              Bring your people a little closer with Talkyy.
            </p>

            {/* Human Cast Accent */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-visible">
                {CAST_AVATARS.map((avatar) => (
                  <img
                    key={avatar.name}
                    src={avatar.src}
                    alt={avatar.name}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#191D25] object-cover transition-transform duration-200 hover:scale-125 hover:z-10 cursor-pointer"
                  />
                ))}
              </div>
              <span className="text-xs text-[#AEB4C0] font-medium">
                Private chats, lively groups, and clear calls.
              </span>
            </div>
          </div>

          {/* Action Buttons (Right) */}
          <div className="flex flex-col items-start lg:items-end justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/login"
                className="group landing-btn landing-btn--primary shadow-md flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-6 h-12"
              >
                <span>Get started</span>
                <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href="#conversations"
                className="landing-btn landing-btn--ghost landing-btn--on-dark flex items-center justify-center text-sm sm:text-base font-semibold px-6 h-12 transition-all duration-200 hover:-translate-y-0.5"
              >
                Explore Talkyy
              </a>
            </div>

            <p className="text-xs text-[#AEB4C0] pt-1">
              Runs in the browser &middot; No install needed &middot; Free to start
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
