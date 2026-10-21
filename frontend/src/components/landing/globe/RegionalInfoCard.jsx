import React from 'react';
import { REGIONAL_HUBS, CONNECTION_ROUTES } from './globeData.js';

/**
 * Editorial contextual detail card displayed when a geographic hub is selected or hovered.
 * Adheres strictly to the Talkyy design system and product truth guidelines.
 */
export default function RegionalInfoCard({
  hubId,
  onClose,
  onSelectHub,
}) {
  const hub = REGIONAL_HUBS.find((h) => h.id === hubId);
  if (!hub) return null;

  // Find all active routes connected to this hub
  const connectedRoutes = CONNECTION_ROUTES.filter(
    (r) => r.from === hub.id || r.to === hub.id
  ).map((r) => {
    const otherId = r.from === hub.id ? r.to : r.from;
    const otherHub = REGIONAL_HUBS.find((h) => h.id === otherId);
    return {
      routeId: r.id,
      label: r.label,
      targetId: otherId,
      targetName: otherHub ? otherHub.name : otherId,
    };
  });

  return (
    <div
      className="w-full max-w-[320px] rounded-2xl border border-white/15 bg-[#141822]/95 p-4 text-[#F7F5EF] shadow-2xl backdrop-blur-lg transition-all duration-300 animate-fadeIn"
      role="region"
      aria-label={`Detailed communication information for ${hub.name}`}
    >
      {/* Header with region code, name, and close action */}
      <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-[#2858E8] bg-[#2858E8]/15 border border-[#2858E8]/30 px-1.5 py-0.5 rounded" aria-hidden="true">
              {hub.code}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9FB2F5]">
              {hub.type}
            </span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-white">
            {hub.name}
          </h3>
          <p className="text-[11px] text-[#9aa6be]">{hub.anchorCity}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9aa6be] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close region panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Illustrative Communication Metrics (Demo Mode) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-[#1C222E] p-2.5">
          <p className="text-[11px] font-medium text-[#9aa6be]">Active Encrypted</p>
          <p className="mt-0.5 font-display text-base font-bold text-white">
            {hub.demoMetrics.activeConversations}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#1C222E] p-2.5">
          <p className="text-[11px] font-medium text-[#9aa6be]">Direct Threads</p>
          <p className="mt-0.5 font-display text-base font-bold text-white">
            {hub.demoMetrics.directThreads}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#1C222E] p-2.5">
          <p className="text-[11px] font-medium text-[#9aa6be]">Group Polls</p>
          <p className="mt-0.5 font-display text-base font-bold text-[#B9D9C7]">
            {hub.demoMetrics.groupPolls}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#1C222E] p-2.5">
          <p className="text-[11px] font-medium text-[#9aa6be]">Live Calls</p>
          <p className="mt-0.5 font-display text-base font-bold text-[#7EA6FF]">
            {hub.demoMetrics.p2pCalls}
          </p>
        </div>
      </div>

      {/* Region Communication Pattern */}
      <p className="mt-3 text-xs leading-relaxed text-[#9aa6be]">
        {hub.description}
      </p>

      {/* Connected Pathway Routes */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9FB2F5]">
          Active Connection Corridors ({connectedRoutes.length})
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {connectedRoutes.map((cr) => (
            <button
              key={cr.routeId}
              onClick={() => onSelectHub && onSelectHub(cr.targetId)}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#1e2533] px-2 py-1 text-[11px] text-[#e8edf7] transition-colors hover:border-[#2858e8] hover:bg-[#2858e8]/20"
              title={`Jump to ${cr.targetName}`}
            >
              <span>→</span>
              <span>{cr.targetName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Transparency & Demonstration Notice */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-[10px] text-[#8892a6]">
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
        <span>Illustrative Demo Data · Talkyy never tracks individual user locations</span>
      </div>
    </div>
  );
}
