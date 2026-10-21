import SectionHeading from './SectionHeading'

const PhotoBubble = () => (
  <div className="bubble bubble--in max-w-[15rem] p-2">
    <div className="flex h-28 w-44 items-center justify-center rounded-md bg-[var(--c-soft-blue-surface)] text-[var(--c-cobalt)]">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M4 18l5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <p className="mt-2 truncate px-1 text-xs text-[var(--c-secondary-ink)]">coast-01.jpg</p>
  </div>
)

const MOMENTS = [
  {
    label: 'Reactions',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path
          d="M12 20s-7-4.4-7-9.3A4 4 0 0112 8a4 4 0 017 2.7C19 15.6 12 20 12 20z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Replies',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M10 8L5 12l5 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12h8a6 6 0 016 6v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Read receipts',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M2.5 12.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16.5l1 1 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Typing signals',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="18" cy="12" r="1.8" />
      </svg>
    ),
  },
]

const ConversationShowcase = () => {
  return (
    <section id="conversations" className="landing-section">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            index="01"
            eyebrow="Small moments. Real connections."
            title={
              <>
                A conversation,
                <br />
                exactly as it happens.
              </>
            }
            lede="From a quick hello to a conversation that lasts all evening, Talkyy keeps the texture of a real chat: attachments, reactions, replies, and the quiet signal of someone typing back."
          />

          <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--c-divider)] pt-7">
            {MOMENTS.map((moment) => (
              <li
                key={moment.label}
                className="flex items-center gap-2.5 text-sm font-medium text-[var(--c-primary-ink)]"
              >
                <span className="text-[var(--c-cobalt)]" aria-hidden="true">
                  {moment.icon}
                </span>
                {moment.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Product composition: the thread with a reply slip breaking out of it */}
        <div className="relative">
          <div className="absolute -top-8 -right-3 z-10 hidden w-56 rotate-[2.5deg] rounded-xl border border-[var(--c-divider)] bg-white p-3 shadow-[0_18px_34px_-22px_rgba(25,29,37,0.55)] sm:block lg:-right-8">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--c-cobalt)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M10 8L5 12l5 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12h8a6 6 0 016 6v1" strokeLinecap="round" />
              </svg>
              Replying to Morgan
            </p>
            <p className="mt-2 truncate text-xs text-[var(--c-secondary-ink)]">
              Did you see the photos from the trip?
            </p>
            <div className="mt-2 border-l-2 border-[var(--c-cobalt)] bg-[var(--c-soft-blue-surface)] px-2.5 py-1.5 text-xs text-[var(--c-primary-ink)]">
              No answer yet, but I love the last one!
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(25,29,37,0.45)] sm:p-7">
            <div className="flex items-center gap-3 border-b border-[var(--c-divider)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--c-cobalt)] font-display text-sm font-bold text-white">
                MR
              </span>
              <div>
                <p className="font-semibold text-[var(--c-primary-ink)]">Morgan Reyes</p>
                <p className="text-xs text-[var(--c-online)]">Online</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-5">
              <span className="day-chip self-center">Yesterday</span>

              <div className="flex flex-col items-end gap-1">
                <div className="bubble bubble--out">Did you see the photos from the trip?</div>
                <span className="bubble-meta">4:30 PM &middot; Read</span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <PhotoBubble />
              </div>

              <div className="flex flex-col items-start gap-1">
                <div className="bubble bubble--in">No answer yet, but I love the last one!</div>
                <span className="bubble-meta">2:15 PM &middot; ❤️ 1</span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <div className="bubble bubble--in">I&apos;m almost ready, just finishing up!</div>
                <span className="flex items-center gap-1.5 text-xs text-[var(--c-secondary-ink)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--c-online)]" />
                  Casey is typing&hellip;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ConversationShowcase
