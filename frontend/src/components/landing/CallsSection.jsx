import SectionHeading from './SectionHeading'

const PARTICIPANTS = [
  { initials: 'YO', name: 'You', color: 'bg-[var(--c-cobalt)]' },
  { initials: 'AL', name: 'Alex', color: 'bg-[var(--c-deep-blue)]', speaking: true },
  { initials: 'SM', name: 'Sam', color: 'bg-[#4a74ef]' },
  { initials: 'CA', name: 'Casey', color: 'bg-[#6f8ff5]' },
]

const CALL_POINTS = [
  'Incoming call prompts with accept and decline',
  'Mute, camera, and leave controls in one bar',
  'Works alongside the group chat it belongs to',
]

const MicIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" strokeLinecap="round" />
  </svg>
)

const CameraIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3z" strokeLinejoin="round" />
  </svg>
)

const CallsSection = () => {
  return (
    <section id="calls" className="landing-section">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            index="04"
            eyebrow="Sometimes, a message isn't enough"
            title={
              <>
                Sometimes, a message
                <br />
                isn&apos;t enough.
              </>
            }
            lede="Move from a thread to a voice or video call without leaving the conversation. One-to-one calls and group calls are built into the same workspace."
          />

          <ul className="mt-9 border-t border-[var(--c-divider)]">
            {CALL_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 border-b border-[var(--c-divider)] py-3.5 text-sm text-[var(--c-secondary-ink)]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-cobalt)]" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Live call state: who is here, who is speaking, how to leave */}
        <div>
          <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(25,29,37,0.45)] sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-[var(--c-primary-ink)]">
                Family Group call
              </p>
              <span className="flex items-center gap-2 text-xs text-[var(--c-secondary-ink)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--c-online)]" />
                1:30
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PARTICIPANTS.map((person) => (
                <div
                  key={person.name}
                  className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl bg-[var(--c-soft-blue-surface)] ${
                    person.speaking ? 'ring-2 ring-[var(--c-cobalt)]' : ''
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full font-display text-sm font-bold text-white ${person.color}`}
                  >
                    {person.initials}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--c-secondary-ink)]">
                    {person.name}
                    {person.speaking && (
                      <span className="flex items-end gap-0.5" aria-label="speaking">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--c-cobalt)]" />
                        <span className="h-2 w-1.5 animate-pulse rounded-sm bg-[var(--c-cobalt)] [animation-delay:150ms]" />
                        <span className="h-1.5 w-1 animate-pulse rounded-sm bg-[var(--c-cobalt)] [animation-delay:300ms]" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--c-divider)] pt-5">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--c-divider)] text-[var(--c-secondary-ink)]"
                  aria-hidden="true"
                >
                  <MicIcon />
                </span>
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--c-divider)] text-[var(--c-secondary-ink)]"
                  aria-hidden="true"
                >
                  <CameraIcon />
                </span>
              </div>

              <span className="landing-btn landing-btn--primary h-10 px-4 text-sm">
                Leave call
              </span>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-[var(--c-secondary-ink)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
            </svg>
            Voice and video run peer-to-peer through WebRTC, alongside the chat they belong to.
          </p>
        </div>
      </div>
    </section>
  )
}

export default CallsSection
