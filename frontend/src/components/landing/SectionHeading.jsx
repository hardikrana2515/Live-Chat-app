/**
 * Shared editorial heading used by every landing section:
 * index number — hairline rule — eyebrow, then title and lede.
 * The index gives the page a readable rhythm and makes each section
 * easy to reference (01 … 05) instead of repeating identical headers.
 */
const SectionHeading = ({ index, eyebrow, title, lede, dark = false, className = '' }) => (
  <div className={className}>
    <div className="flex items-center gap-3">
      <span className="landing-index">{index}</span>
      <span className="landing-index__rule" aria-hidden="true" />
      <p className={`landing-eyebrow${dark ? ' landing-eyebrow--dark' : ''}`}>{eyebrow}</p>
    </div>

    <h2
      className={`mt-5 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl${
        dark ? '' : ' text-[var(--c-primary-ink)]'
      }`}
    >
      {title}
    </h2>

    {lede && (
      <p
        className={`mt-6 max-w-lg text-lg leading-relaxed${
          dark ? ' text-[var(--c-dark-text-2)]' : ' text-[var(--c-secondary-ink)]'
        }`}
      >
        {lede}
      </p>
    )}
  </div>
)

export default SectionHeading
