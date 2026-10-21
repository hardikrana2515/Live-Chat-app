import { Link } from 'react-router-dom';
import { FiShield, FiLock } from 'react-icons/fi';
import InteractiveGlobe from './globe/InteractiveGlobe';

const ArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 4v15M5.5 13.5L12 20.5l6.5-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * HeroSection (Phase 5.1):
 * Combines Talkyy's editorial voice, clear conversion CTA, privacy trust markers,
 * and the approved interactive 3D digital globe representing global communication.
 */
const HeroSection = () => {
  return (
    <section className="landing-section landing-section--hero overflow-hidden landing-panel landing-panel--z-hero landing-panel--sticky bg-[var(--c-warm-paper)]">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 landing-panel__inner">
        {/* Editorial column */}
        <div className="animate-fadeIn z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-4 shadow-2xs hover:border-[#2858E8]/30 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
            </span>
            <span>Private real-time messaging &amp; calling</span>
          </div>

          <h1 className="font-display text-[2.75rem] font-bold leading-[1.04] tracking-tight text-[var(--c-primary-ink)] sm:text-5xl lg:text-6xl">
            Good conversations
            <br />
            bring us{' '}
            <span className="landing-mark">
              closer.
              <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M3 8.5C48 3.5 118 10 197 5"
                  fill="none"
                  stroke="#B9D9C7"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-[var(--c-secondary-ink)]">
            Private chats, lively groups, and voice or video calls. Stay close to
            your people, wherever life takes you.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link to="/login" className="landing-btn landing-btn--primary group">
              <span>Start talking</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
            <a href="#conversations" className="landing-arrow-link font-medium group">
              <span>See how it works</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-y-1" aria-hidden="true">
                <ArrowDown />
              </span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--c-divider)] pt-5 text-xs sm:text-sm text-[var(--c-secondary-ink)]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--c-primary-ink)]">
              <FiShield className="h-4 w-4 text-[#2858E8]" />
              End-to-end encrypted
            </span>
            <span aria-hidden="true" className="text-[var(--c-divider)]">·</span>
            <span>Runs in browser</span>
            <span aria-hidden="true" className="text-[var(--c-divider)]">·</span>
            <span>No install needed</span>
            <span aria-hidden="true" className="text-[var(--c-divider)]">·</span>
            <span>11 Global regions</span>
          </div>
        </div>

        {/* Signature 3D Digital World Map */}
        <div className="relative flex w-full items-center justify-center">
          <InteractiveGlobe className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
