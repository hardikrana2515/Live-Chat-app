import { useEffect, useRef, useState } from 'react'

/**
 * Hero composition: a conversation broken into physical layers.
 *
 * Every fragment of the product (thread, voice note, poll, incoming call,
 * reaction, encryption note) sits on its own plane at a real translateZ
 * depth, so rotating the whole stage once produces genuine parallax between
 * the layers — no WebGL, no libraries, no layout shift.
 *
 * Fallbacks:
 *  - prefers-reduced-motion  -> no sway, no entrance animation, fixed tilt
 *  - touch / no-hover device -> no pointer listeners, fixed tilt
 * The markup is decorative (aria-hidden); the same features are described in
 * full as text further down the page.
 */

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const WAVE = [7, 13, 20, 11, 16, 9, 18, 22, 12, 7, 15, 19, 10, 14, 8, 17, 21, 11, 6, 13, 16, 9]

/* Positions are tuned so every slip's content stays readable: overlaps
   only ever cover padding, and scaled planes (translateZ) stay inside the
   stage at desktop and mobile widths. */
const PLANES = [
  { id: 'lock', left: 4, top: 3, width: 44, z: -60, rot: -3, delay: 0.34 },
  { id: 'call', left: 46, top: 8, width: 52, z: 30, rot: 2.5, delay: 0.28 },
  // On phones only lock + call + thread fit without a plane covering
  // another's controls (the stage is ~350px wide there); voice, poll and
  // the reaction chip are a tablet-and-up composition.
  { id: 'voice', left: 2, top: 22, width: 55, z: 70, rot: -2, delay: 0.16, hideSm: true },
  { id: 'thread', left: 31, top: 35, width: 62, z: 150, rot: 1.5, delay: 0.04 },
  { id: 'poll', left: 2, top: 66, width: 45, z: -10, rot: -1.5, delay: 0.4, hideSm: true },
  { id: 'react', left: 63, top: 72, width: 30, z: 170, rot: 3, delay: 0.5, hideSm: true },
]

const LockGlyph = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 018 0v3" strokeLinecap="round" />
  </svg>
)

const Handset = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.6a1 1 0 01-.25 1z" />
  </svg>
)

const Plane = ({ plane, children }) => (
  <div
    className={`diorama__plane${plane.hideSm ? ' hidden sm:block' : ''}`}
    style={{
      left: `${plane.left}%`,
      top: `${plane.top}%`,
      width: `${plane.width}%`,
      transform: `translateZ(${plane.z}px) rotate(${plane.rot}deg)`,
    }}
  >
    <div className="diorama__face" style={{ animationDelay: `${plane.delay}s` }}>
      {children}
    </div>
  </div>
)

const VoiceSlip = () => (
  <div className="slip p-3">
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--c-cobalt)] text-white">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M3 1.6v8.8L10 6z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--c-secondary-ink)]">
          Voice message
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="waveform">
            {WAVE.map((height, i) => (
              <span key={i} style={{ height: `${height}px` }} />
            ))}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-[var(--c-secondary-ink)]">0:14</span>
        </div>
      </div>
    </div>
  </div>
)

const CallSlip = () => (
  <div className="slip p-3">
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--c-cobalt)] text-[11px] font-bold text-white">
        MR
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[12.5px] font-semibold text-[var(--c-primary-ink)]">Morgan Reyes</p>
        <p className="text-[10.5px] text-[var(--c-secondary-ink)]">Incoming video call</p>
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--c-online)] text-white" aria-hidden="true">
        <Handset />
      </span>
      <span
        className="grid h-8 w-8 place-items-center rounded-full bg-[var(--c-danger)] text-white"
        style={{ transform: 'rotate(135deg)' }}
        aria-hidden="true"
      >
        <Handset />
      </span>
      <span className="ml-auto text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--c-secondary-ink)]">
        Video
      </span>
    </div>
  </div>
)

const ThreadSlip = () => (
  <div className="slip overflow-hidden">
    <div className="flex items-center gap-2 border-b border-[var(--c-divider)] px-3 py-2.5">
      <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--c-deep-blue)] text-[10px] font-bold text-white">
        C
        <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--c-online)]" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[12.5px] font-semibold text-[var(--c-primary-ink)]">Casey</p>
        <p className="text-[10.5px] text-[var(--c-online)]">Online</p>
      </div>
      <span className="ml-auto text-[10px] text-[var(--c-secondary-ink)]">Today</span>
    </div>

    <div className="flex flex-col gap-2 px-3 py-3">
      <span className="ml-auto w-fit max-w-[84%] rounded-[12px] rounded-br-[4px] bg-[var(--c-cobalt)] px-2.5 py-1.5 text-[12px] leading-snug text-white">
        Table&apos;s booked for 8.
      </span>
      <span className="mr-auto w-fit max-w-[84%] rounded-[12px] rounded-bl-[4px] bg-[var(--c-soft-blue-surface)] px-2.5 py-1.5 text-[12px] leading-snug text-[var(--c-primary-ink)]">
        Perfect — bringing the camera.
      </span>
      <span className="flex items-center gap-1.5 pt-0.5 text-[11px] text-[var(--c-secondary-ink)]">
        <span className="flex items-end gap-0.5" aria-hidden="true">
          <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--c-cobalt)]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--c-cobalt)] [animation-delay:150ms]" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-[var(--c-cobalt)] [animation-delay:300ms]" />
        </span>
        Casey is typing&hellip;
      </span>
    </div>
  </div>
)

const PollSlip = () => (
  <div className="slip slip--paper p-3">
    <p className="text-[11.5px] font-semibold text-[var(--c-primary-ink)]">Friday plans?</p>
    <ul className="mt-2 flex flex-col gap-1.5">
      {[
        { label: 'Ramen place', width: '64%' },
        { label: 'Cook at home', width: '36%' },
      ].map((option) => (
        <li key={option.label}>
          <div className="flex items-center justify-between text-[10px] text-[var(--c-secondary-ink)]">
            <span className="truncate pr-2">{option.label}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[var(--c-cobalt)]" style={{ width: option.width }} />
          </div>
        </li>
      ))}
    </ul>
  </div>
)

const ReactionSlip = () => (
  <div className="slip px-3 py-2 text-center">
    <p className="text-[15px] leading-none">
      ❤️ <span className="align-middle text-[12px] font-semibold text-[var(--c-primary-ink)]">3</span>
    </p>
    <p className="mt-1 text-[10px] font-semibold text-[var(--c-cobalt)]">✓✓ Read</p>
  </div>
)

const LockSlip = () => (
  <div className="slip flex items-center gap-2 px-3 py-2 text-[var(--c-cobalt)]">
    <LockGlyph />
    <p className="text-[11px] font-semibold text-[var(--c-secondary-ink)]">Encrypted on your device</p>
  </div>
)

const SLIPS = {
  voice: VoiceSlip,
  call: CallSlip,
  thread: ThreadSlip,
  poll: PollSlip,
  react: ReactionSlip,
  lock: LockSlip,
}

const HeroDiorama = () => {
  const tiltRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 5, y: -7 })

  useEffect(() => {
    const stage = tiltRef.current
    if (!stage) return

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noHover = window.matchMedia('(hover: none)').matches

    // Touch devices and reduced-motion visitors keep a fixed 3D still.
    if (reduced || noHover) return

    let frame = 0

    const handleMove = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        setTilt({ x: clamp(-py * 11, -9, 9), y: clamp(px * 15, -12, 12) })
      })
    }

    const handleLeave = () => {
      cancelAnimationFrame(frame)
      setTilt({ x: 5, y: -7 })
    }

    stage.addEventListener('pointermove', handleMove)
    stage.addEventListener('pointerleave', handleLeave)

    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return (
    <div className="diorama" ref={tiltRef} aria-hidden="true">
      <div
        className="diorama__tilt"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="diorama__sway">
          <div className="diorama__orbit">
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <ellipse
                cx="200"
                cy="200"
                rx="197"
                ry="197"
                fill="none"
                stroke="#DCDAD3"
                strokeWidth="2"
                strokeDasharray="5 11"
              />
            </svg>
          </div>

          <span className="diorama__ground" />

          {PLANES.map((plane) => {
            const Slip = SLIPS[plane.id]
            return (
              <Plane key={plane.id} plane={plane}>
                <Slip />
              </Plane>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HeroDiorama
