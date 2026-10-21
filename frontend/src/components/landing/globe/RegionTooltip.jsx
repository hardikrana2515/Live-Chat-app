import React from 'react';

/**
 * Minimal, compact tooltip for the digital world map.
 * Supports both Level 1 (Country) and Level 2 (Regional Hub) entities.
 * Clearly labels illustrative connection counts as demo data.
 */
export default function RegionTooltip({ hub, country, entity, onClose }) {
  const item = entity || country || hub;
  if (!item) return null;

  const isCountry = Boolean(item.iso || country || item.hubRef);
  const title = item.name;
  const badge = item.iso || item.code;
  const connections = item.connections || '1,000+';
  const anchorCity = item.anchorCity;

  return (
    <div
      className="pointer-events-auto min-w-[190px] max-w-[260px] rounded-xl border border-[#2858E8]/20 bg-white/95 px-3 py-2 text-[var(--c-primary-ink)] shadow-md backdrop-blur-md transition-all duration-200 animate-fadeIn"
      style={{
        boxShadow: '0 4px 18px -2px rgba(25, 27, 32, 0.12), 0 2px 6px -1px rgba(40, 88, 232, 0.08)',
      }}
      role="tooltip"
      aria-label={`${title}: Illustrative demo, ${connections} connections`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2858E8] shadow-[0_0_6px_rgba(40,88,232,0.6)]" />
          <h4 className="truncate font-display text-xs sm:text-sm font-bold text-[var(--c-primary-ink)]">
            {title}
          </h4>
          {badge && (
            <span className="shrink-0 rounded bg-[#2858E8]/10 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-[#2858E8]">
              {badge}
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded p-0.5 text-xs text-[var(--c-secondary-ink)] hover:bg-[#F3F6FC] hover:text-[var(--c-primary-ink)] transition"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-0.5">
        <p className="font-mono text-[10px] sm:text-[11px] text-[var(--c-secondary-ink)]">
          <span className="font-semibold text-[#2858E8]">{connections}</span> global routes{' '}
          <span className="text-[9px] opacity-75">(demo)</span>
        </p>
        {anchorCity && (
          <p className="truncate text-[10px] text-[var(--c-secondary-ink)] opacity-85">
            {isCountry ? 'Capital / Hub' : 'Anchor'}: {anchorCity}
          </p>
        )}
      </div>
    </div>
  );
}

