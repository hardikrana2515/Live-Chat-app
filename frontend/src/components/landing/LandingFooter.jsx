import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';

const EXPLORE_NAV = [
  { label: 'Conversations', href: '#conversations' },
  { label: 'Groups', href: '#groups' },
  { label: 'Voice & video', href: '#calls' },
  { label: 'Privacy & trust', href: '#privacy' },
  { label: 'FAQ', href: '#faq' }
];

const ACCOUNT_LEGAL_NAV = [
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/login' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms' }
];

/**
 * Phase 6.1: Brand Footer
 *
 * Restrained editorial footer:
 * - Brand area with logo, concise description, supporting sentence, and location (India · Gujarat · 395002).
 * - Explore navigation (Conversations, Groups, Calls, Privacy, FAQ).
 * - Account & Legal navigation (Sign in, Create account, Privacy Policy, Terms of Service).
 * - Dynamic copyright year, legal links, and smooth Back to Top action.
 * - Zero internal technical disclosures (WebRTC, Socket.IO, crypto derivation removed).
 */
const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-panel landing-panel--z-footer relative border-t border-[var(--c-divider)] bg-[var(--c-warm-paper)] text-[var(--c-primary-ink)]">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:py-16 landing-panel__inner">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Info (Left Column - 6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <Link to="/" className="group inline-flex items-center" aria-label="Talkyy home">
                <img
                  src="/brand/talkyy-horizontal-clean.png"
                  alt="Talkyy"
                  className="h-9 w-auto max-w-[170px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </Link>

              <p className="mt-4 text-base font-semibold tracking-tight text-[var(--c-primary-ink)] max-w-md">
                A calmer space for real conversations.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-[var(--c-secondary-ink)] max-w-md">
                Private conversations, groups, and calls—designed around the people who matter to you.
              </p>
            </div>

            {/* Requested Company Location */}
            <div className="mt-6 text-xs text-[var(--c-secondary-ink)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-pulse" />
              <span>India &middot; Gujarat &middot; 395002</span>
            </div>
          </div>

          {/* Navigation Columns (Right Column - 6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 sm:gap-12">
            {/* Explore Column */}
            <nav aria-label="Explore navigation">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--c-primary-ink)] mb-4">
                Explore
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
                {EXPLORE_NAV.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-all duration-150 inline-block hover:translate-x-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Account & Legal Column */}
            <nav aria-label="Account and legal navigation">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--c-primary-ink)] mb-4">
                Account &amp; Legal
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
                {ACCOUNT_LEGAL_NAV.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[var(--c-secondary-ink)] hover:text-[#2858E8] transition-all duration-150 inline-block hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--c-divider)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[var(--c-secondary-ink)]">
          <span>&copy; {currentYear} Talkyy. All rights reserved.</span>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <Link
              to="/privacy-policy"
              className="hover:text-[#2858E8] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[var(--c-divider)]" aria-hidden="true">&middot;</span>
            <Link
              to="/terms"
              className="hover:text-[#2858E8] transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-[var(--c-divider)]" aria-hidden="true">&middot;</span>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-1.5 font-semibold text-[var(--c-primary-ink)] hover:text-[#2858E8] transition-colors cursor-pointer"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <FiArrowUp className="text-sm transition-transform duration-200 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
