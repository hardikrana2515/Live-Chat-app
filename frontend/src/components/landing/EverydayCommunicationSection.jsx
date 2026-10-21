const CAPABILITIES = [
  {
    term: 'Direct conversations',
    detail: 'Private one-to-one messaging with read receipts, typing indicators, and reactions.',
    category: 'Messaging',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M20 12a7.5 7.5 0 01-10.6 6.8L4.5 20l1.3-4.6A7.5 7.5 0 1120 12z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    term: 'Groups and admins',
    detail: 'Create groups, manage members, assign admins, and keep shared media together.',
    category: 'Groups',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 19.5a6 6 0 0112 0" strokeLinecap="round" />
        <path d="M16 5.5a3.2 3.2 0 010 6M21 19.5a6 6 0 00-2.4-4.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    term: 'Files and voice notes',
    detail: 'Send images, video, documents, and recorded voice messages inside a thread.',
    category: 'Files',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    term: 'Voice and video calls',
    detail: 'Start a one-to-one or group call from the conversation you are already in.',
    category: 'Calls',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="6.5" width="12.5" height="11" rx="2.2" />
        <path d="M15.5 10.5l5.5-3v9l-5.5-3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    term: 'Message control',
    detail: 'Edit or delete your own messages, react to others, and reply to a specific message.',
    category: 'Controls',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 20h4L18.5 9.5a2.8 2.8 0 10-4-4L4 16v4z" strokeLinejoin="round" />
        <path d="M13.5 6.5l4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    term: 'Search and presence',
    detail: 'Find people and conversations quickly, and see who is online before you write.',
    category: 'Search',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

/**
 * The full capability list, laid out as a readable index (number, glyph,
 * description, category) rather than another grid of identical cards.
 */
const EverydayCommunicationSection = () => {
  return (
    <section id="features" className="landing-section bg-white">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="landing-index">06</span>
            <span className="landing-index__rule" aria-hidden="true" />
            <p className="landing-eyebrow">Built for everyday use</p>
          </div>

          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.08] tracking-tight text-[var(--c-primary-ink)] sm:text-4xl">
            Everything a conversation needs, nothing it doesn&apos;t.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--c-secondary-ink)]">
            Talkyy is a working chat application, not a concept. Each item below is part
            of the product you can use after signing in.
          </p>

          <a href="#faq" className="landing-arrow-link mt-7">
            Read the FAQ
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 5.5L19.5 12 13 18.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div>
          {CAPABILITIES.map((item, index) => (
            <div key={item.term} className="index-row last:border-b last:border-[var(--c-divider)]">
              <span className="pt-1 font-display text-sm font-semibold tabular-nums text-[var(--c-cobalt)]">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="flex min-w-0 gap-4">
                <span className="index-row__glyph shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-[var(--c-primary-ink)]">
                    {item.term}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--c-secondary-ink)]">
                    {item.detail}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--c-secondary-ink)] sm:hidden">
                    {item.category}
                  </p>
                </div>
              </div>

              <span className="hidden pt-1.5 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--c-secondary-ink)] sm:block">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EverydayCommunicationSection
