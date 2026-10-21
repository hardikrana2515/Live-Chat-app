const OPTIONS = [
  { label: 'The ramen place, obviously', votes: 7, width: '58%' },
  { label: 'That new burger spot', votes: 3, width: '25%' },
  { label: 'Stay in and cook', votes: 2, width: '17%' },
]

const PollResult = () => {
  return (
    <div className="w-full max-w-[18rem] rounded-xl border border-[var(--c-divider)] bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-[var(--c-primary-ink)]">
        Where should we eat on Friday?
      </p>
      <ul className="flex flex-col gap-2">
        {OPTIONS.map((option) => (
          <li key={option.label}>
            <div className="flex items-center justify-between text-xs text-[var(--c-secondary-ink)]">
              <span className="truncate pr-2">{option.label}</span>
              <span className="tabular-nums">{option.votes}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--c-soft-blue-surface)]">
              <div
                className="h-full rounded-full bg-[var(--c-cobalt)]"
                style={{ width: option.width }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PollResult
