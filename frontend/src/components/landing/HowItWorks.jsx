import { Link } from 'react-router-dom'

import SectionHeading from './SectionHeading'

/**
 * Three steps, drawn as a dotted timeline rather than three identical
 * cards. Copy mirrors the real sign-up and contact-request flow
 * (SignUp.jsx / Search.jsx / Requests.jsx) — nothing is invented here.
 */
const STEPS = [
  {
    num: '01',
    title: 'Create your account',
    body: 'Your name, a username, email and a password. That is the whole sign-up.',
  },
  {
    num: '02',
    title: 'Find your people',
    body: 'Search for someone by name or username, send a request — they accept, and you are connected.',
  },
  {
    num: '03',
    title: 'Talk however you like',
    body: 'Pick up the thread with a message, a voice note, a poll, a photo, or a call. Everything stays in the same conversation.',
  },
]

const HowItWorks = () => {
  return (
    <section id="how" className="landing-section bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-5">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="00"
            eyebrow="Getting started"
            title={
              <>
                Three steps from
                <br />
                strangers to a thread.
              </>
            }
            className="max-w-xl"
          />

          <Link to="/login" className="landing-btn landing-btn--primary shrink-0 self-start md:self-auto">
            Create account
          </Link>
        </div>

        <div className="lp-steps mt-14">
          {STEPS.map((step) => (
            <div key={step.num} className="lp-step">
              <span className="lp-step__num">{step.num}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-[var(--c-primary-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--c-secondary-ink)]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
