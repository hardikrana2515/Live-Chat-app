import SectionHeading from './SectionHeading'

const MEMBERS = [
  { initials: 'A', name: 'Alex', text: 'Everyone ready for the game tonight?', time: '7:30 PM', color: 'bg-[var(--c-cobalt)]', online: true },
  { initials: 'J', name: 'Jamie', text: "I'm in! What time?", time: '7:31 PM', color: 'bg-[#3f6df0]', online: true },
  { initials: 'S', name: 'Sam', text: "Don't forget the snacks.", time: '7:32 PM', color: 'bg-[var(--c-deep-blue)]', admin: true },
  { initials: 'C', name: 'Casey', text: "I'll bring drinks.", time: '7:34 PM', color: 'bg-[#5480f2]' },
  { initials: 'M', name: 'Morgan', text: 'Getting the playlist ready.', time: '7:35 PM', color: 'bg-[#6f8ff5]' },
]

const CAPABILITIES = [
  'Group creation in a few taps',
  'Member requests and removals',
  'Admin controls for the people in charge',
  'Group calls without leaving the thread',
]

const GroupsSection = () => {
  return (
    <section
      id="groups"
      className="landing-section landing-section--dark relative overflow-hidden bg-[var(--c-dark-section-bg)] text-[var(--c-dark-section-text)]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: "url('/chatbg.png')" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            index="03"
            eyebrow="One group. A thousand little moments."
            dark
            title={
              <>
                One group.
                <br />
                A thousand little moments.
              </>
            }
            lede="Create a group in a few taps, invite the people who belong in it, and keep the whole conversation in one place. Admins can add members, update the group, and start a call when talking beats typing."
          />

          <ul className="mt-9 border-t border-white/10">
            {CAPABILITIES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 border-b border-white/10 py-3.5 text-sm text-[var(--c-dark-text-2)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9FB2F5" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12.5l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Group roster with live presence */}
        <div className="rounded-2xl border border-white/10 bg-[var(--c-dark-surface)] p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--c-cobalt)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
                <path d="M16 6a3 3 0 010 6M18 20a6 6 0 00-2-4.5" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="font-semibold">Family Group</p>
              <p className="text-xs text-[var(--c-dark-text-2)]">5 members &middot; 2 online</p>
            </div>
            <span className="ml-auto rounded border border-[#9FB2F5]/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#9FB2F5]">
              Group
            </span>
          </div>

          <ul className="flex flex-col gap-3 pt-4">
            {MEMBERS.map((member) => (
              <li key={member.name} className="flex items-start gap-3">
                <span
                  className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${member.color}`}
                >
                  {member.initials}
                  {member.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--c-dark-surface)] bg-[var(--c-online)]" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {member.name}
                    {member.admin && (
                      <span className="rounded border border-[#9FB2F5]/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9FB2F5]">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-[var(--c-dark-text-2)]">{member.text}</p>
                </div>
                <span className="ml-auto shrink-0 text-[11px] text-[var(--c-dark-text-2)]">{member.time}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="flex items-center gap-2 text-xs text-[var(--c-dark-text-2)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--c-online)]" />
              Group call in progress
            </span>
            <span className="rounded-md bg-[var(--c-cobalt)] px-3 py-1.5 text-xs font-semibold text-white">
              Join
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GroupsSection
