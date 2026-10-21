import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiArrowUp, FiAlertCircle, FiMapPin } from 'react-icons/fi';

/**
 * Shared Legal Document Layout for Talkyy.
 * Provides a clean, editorial reading experience for legal and compliance pages.
 * - Warm-paper palette (#F7F5EF, #191B20, Space Grotesk, DM Sans).
 * - Sticky navigation with Back to Talkyy and document cross-links.
 * - Draft alert banner for owner review before publication.
 * - Sticky Table of Contents sidebar for desktop.
 * - Dynamic copyright and verified location: India · Gujarat · 395002.
 */
const LegalLayout = ({
  title,
  subtitle,
  effectiveDate,
  tocItems = [],
  alertTitle,
  alertContent,
  children
}) => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#191B20] font-body selection:bg-[#E8EEFF] selection:text-[#2858E8]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-xs border-b border-[#DCDAD3]">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8]"
            aria-label="Talkyy Home"
          >
            <img src="/Logo1.png" alt="" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold tracking-tight text-[#191B20]">
              Talkyy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link
              to={isPrivacy ? '/terms' : '/privacy-policy'}
              className="text-[#51545C] hover:text-[#2858E8] transition-colors font-medium"
            >
              {isPrivacy ? 'Terms of Service →' : 'Privacy Policy →'}
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCDAD3] bg-white/70 hover:bg-white text-[#191B20] font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back to Talkyy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:py-14">
        {/* Document Header */}
        <div className="max-w-3xl mb-10 pb-8 border-b border-[#DCDAD3]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8EEFF] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-4">
            <span className="tracking-wide uppercase">LEGAL DOCUMENTATION</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#191B20]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-base sm:text-lg text-[#51545C] leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Document Metadata Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#51545C]">
            <div>
              <span className="font-semibold text-[#191B20]">Publication / Effective Date:</span>{' '}
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold">
                {effectiveDate || '1/11/2026'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <FiMapPin className="text-[#2858E8]" />
              <span className="font-semibold text-[#191B20]">Location:</span>{' '}
              <span>India &middot; Gujarat &middot; 395002</span>
            </div>
          </div>

          {/* Notice Alert Banner */}
          {alertTitle !== false && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-[#E8EEFF]/60 p-4 text-xs text-[#173BB5] leading-relaxed flex items-start gap-3">
              <FiAlertCircle className="text-base text-[#2858E8] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#191B20]">
                  {alertTitle || 'Testing & Development Phase Notice'}
                </p>
                <p className="mt-1 text-[#51545C]">
                  {alertContent || 'These operating entity details (Talky.chat.com) and contact address (helpdesk@talky.chat.com) are currently configured for testing and development purposes during the pre-launch phase.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Layout: Sidebar TOC + Main Reading Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 items-start">
          {/* Table of Contents Sidebar */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block sticky top-24 self-start bg-white/60 p-5 rounded-xl border border-[#DCDAD3] shadow-2xs">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-[#191B20] mb-3">
                Contents
              </h2>
              <nav aria-label="Table of contents">
                <ol className="flex flex-col gap-2 text-xs">
                  {tocItems.map((item, idx) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-[#51545C] hover:text-[#2858E8] transition-colors flex items-baseline gap-2 py-0.5 leading-snug"
                      >
                        <span className="font-mono text-[11px] text-[#2858E8] shrink-0">
                          {(idx + 1).toString().padStart(2, '0')}.
                        </span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}

          {/* Legal Text Body */}
          <article className="prose prose-neutral max-w-3xl text-sm leading-relaxed text-[#191B20]">
            {children}
          </article>
        </div>
      </main>

      {/* Legal Footer */}
      <footer className="border-t border-[#DCDAD3] bg-[#F7F5EF] py-10 text-xs text-[#51545C]">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1240px] px-5">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>&copy; {currentYear} Talkyy. All rights reserved.</span>
            <span className="hidden sm:inline text-[#DCDAD3]">&middot;</span>
            <span>India &middot; Gujarat &middot; 395002</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/privacy-policy" className="hover:text-[#2858E8] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#DCDAD3]">&middot;</span>
            <Link to="/terms" className="hover:text-[#2858E8] transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#DCDAD3]">&middot;</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 font-semibold text-[#191B20] hover:text-[#2858E8] transition-colors"
            >
              <span>Back to top</span>
              <FiArrowUp className="text-sm" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
