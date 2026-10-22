import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Conversations', href: '#conversations' },
  { label: 'Groups', href: '#groups' },
  { label: 'Calls', href: '#calls' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'FAQ', href: '#faq' },
]

/**
 * Phase 6.1: Premium Sticky Navigation Bar
 *
 * Distinctive, editorial product navigation:
 * - Solid warm paper (#F7F5EF), no glassmorphism or neon gradients.
 * - Position sticky at top:0 with z-50 and hairline border/shadow on scroll.
 * - Balanced layout: Brand mark (left), centered navigation links with thin cobalt indicator,
 *   and restrained actions (right).
 * - Full accessibility: Keyboard focus states, aria-expanded, Escape to close,
 *   body scroll lock while mobile menu is open.
 */
const LandingHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [active, setActive] = useState('')

  // Hairline border & subtle elevation when scrolled
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy: mark active section currently in view
  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return

    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1))
    ).filter(Boolean)

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Escape key closes mobile panel
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Prevent background scrolling while mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      id="top"
      className={`landing-header sticky top-0 z-50 bg-[var(--c-warm-paper)] transition-all duration-200 ${
        stuck
          ? 'is-stuck border-b border-[var(--c-divider)] shadow-[0_2px_12px_rgba(25,27,32,0.04)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-6 px-5">
        {/* Left: Brand Horizontal Logo */}
        <Link
          to="/"
          className="group flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8]"
          aria-label="Talkyy home"
        >
          <img
            src="/brand/talkyy-horizontal-clean.png"
            alt="Talkyy"
            className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Center: Main Navigation */}
        <nav
          className="hidden items-center gap-6 md:flex lg:gap-8"
          aria-label="Page sections"
        >
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1)
            return (
              <a
                key={link.href}
                href={link.href}
                className={`landing-nav-link text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] rounded-xs ${
                  isActive ? 'is-active text-[var(--c-primary-ink)]' : 'text-[var(--c-secondary-ink)] hover:text-[#2858E8]'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Right: Auth Actions */}
        <div className="hidden items-center gap-3.5 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8]"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#2858E8] hover:bg-[#173BB5] hover:-translate-y-0.5 hover:shadow-md text-white text-sm font-semibold tracking-tight shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] focus-visible:ring-offset-2 active:scale-[0.98] active:translate-y-0"
          >
            Create account
          </Link>
        </div>

        {/* Mobile Menu Hamburger */}
        <button
          type="button"
          className="-mr-1.5 p-2 text-[var(--c-primary-ink)] hover:text-[#2858E8] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Panel */}
      {menuOpen && (
        <div
          id="landing-mobile-menu"
          className="border-t border-[var(--c-divider)] bg-[var(--c-warm-paper)] px-5 pb-8 pt-3 shadow-lg md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile page sections">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[var(--c-divider)]/60 py-3 text-[15px] font-medium text-[var(--c-primary-ink)] hover:text-[#2858E8] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-11 w-full rounded-lg bg-[#2858E8] text-white text-sm font-semibold tracking-tight shadow-xs active:bg-[#173BB5]"
              onClick={() => setMenuOpen(false)}
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-11 w-full rounded-lg border border-[var(--c-divider)] bg-white/70 text-[var(--c-primary-ink)] text-sm font-semibold tracking-tight hover:bg-white"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default LandingHeader
