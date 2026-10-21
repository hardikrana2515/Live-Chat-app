import PollResult from './PollResult'
import SectionHeading from './SectionHeading'

const MESSAGE_FEATURES = [
  {
    term: 'Edit and delete',
    detail: 'Change a message after sending it; others see it was edited.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M4 20h4l10-10a2.8 2.8 0 10-4-4L4 16v4z" strokeLinejoin="round" />
        <path d="M13.5 6.5l4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    term: 'React and vote',
    detail: 'React to a single message or settle a plan with a quick poll.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M4 5h16M4 12h10M4 19h7" strokeLinecap="round" />
        <circle cx="18" cy="17.5" r="3" />
      </svg>
    ),
  },
  {
    term: 'Send anything',
    detail: 'Photos, video, documents, and voice messages stay in the thread.',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.4 3.4 0 014.8 4.8L10 17.3a1.8 1.8 0 01-2.5-2.5l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const MessagingSection = () => {
  return (
    <section className="landing-section bg-white">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-2 lg:gap-20">
        {/* Product composition: a thread that ends in a poll */}
        <div className="order-last lg:order-first">
          <div className="relative">
            {/* Reaction slip breaking out of the card */}
            <div className="absolute -bottom-6 -left-4 z-10 hidden rotate-[-3deg] items-center gap-2 rounded-xl border border-[var(--c-divider)] bg-white px-3 py-2 shadow-[0_18px_34px_-22px_rgba(25,29,37,0.55)] sm:flex lg:-left-8">
              {['👍', '❤️', '😂'].map((emoji) => (
                <span key={emoji} className="grid h-7 w-7 place-items-center rounded-md bg-[var(--c-warm-paper)] text-sm">
                  {emoji}
                </span>
              ))}
              <span className="pl-1 text-[11px] font-semibold text-[var(--c-secondary-ink)]">3</span>
            </div>

            <div className="rounded-2xl border border-[var(--c-divider)] bg-[var(--c-warm-paper)] p-5 sm:p-7">
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <div className="bubble bubble--out">Where should we eat on Friday?</div>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <PollResult />
                  <span className="bubble-meta">Poll &middot; 3 options &middot; 12 votes</span>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <div className="bubble bubble--in">
                    The ramen place, obviously 🍜
                  </div>
                  <span className="bubble-meta">Edited &middot; 6 min ago</span>
                </div>

                <div className="flex items-center gap-2 border-t border-[var(--c-divider)] pt-5">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-lg">😊</span>
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-lg">📎</span>
                  <div className="flex h-11 flex-1 items-center rounded-lg border border-[var(--c-divider)] bg-white px-3 text-sm text-[var(--c-secondary-ink)]">
                    Type a message&hellip;
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--c-cobalt)] text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M4 12l16-8-6 8 6 8-16-8z" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            index="02"
            eyebrow="Messaging that feels natural"
            title={
              <>
                From a quick hello to
                <br />
                conversations that last.
              </>
            }
            lede="Real-time direct messages with read receipts and typing indicators, editing and deletion, emoji reactions, and polls — plus images, video, documents, and voice notes in the same thread."
          />

          <dl className="mt-9 border-t border-[var(--c-divider)]">
            {MESSAGE_FEATURES.map((item) => (
              <div key={item.term} className="flex gap-4 border-b border-[var(--c-divider)] py-5">
                <span className="mt-0.5 shrink-0 text-[var(--c-cobalt)]" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <dt className="font-semibold text-[var(--c-primary-ink)]">{item.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--c-secondary-ink)]">
                    {item.detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export default MessagingSection
