import { useState, useCallback, useMemo } from 'react';
import EarthCanvas from './EarthCanvas';
import GlobeFallback2D from './GlobeFallback2D';
import RegionTooltip from './RegionTooltip';
import { REGIONAL_HUBS, COUNTRIES } from './globeData';

/**
 * InteractiveGlobe (Digital World Map)
 * Seamlessly integrates with Talkyy's warm-paper (#F7F5EF) background.
 * Features luminous cobalt digital geographic linework, selectable priority countries,
 * regional hubs, 27 global communication corridors, drag-to-rotate with momentum,
 * and a minimal, compact, non-displacing tooltip (eliminating 2D hover flicker).
 */
export default function InteractiveGlobe({ className = '' }) {
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [hoveredHubId, setHoveredHubId] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [useFallback2D, setUseFallback2D] = useState(false);

  // Hub selection & hover callbacks
  const handleHubSelect = useCallback((hubId) => {
    setSelectedCountryId(null);
    setSelectedHubId((prev) => (prev === hubId ? null : hubId));
  }, []);

  const handleHubHover = useCallback((hubId) => {
    setHoveredHubId(hubId);
  }, []);

  // Country selection & hover callbacks
  const handleCountrySelect = useCallback((countryIso) => {
    setSelectedHubId(null);
    setSelectedCountryId((prev) => (prev === countryIso ? null : countryIso));
  }, []);

  const handleCountryHover = useCallback((countryIso) => {
    setHoveredCountryId(countryIso);
  }, []);

  const handleResetView = () => {
    setSelectedHubId(null);
    setHoveredHubId(null);
    setSelectedCountryId(null);
    setHoveredCountryId(null);
    setIsAutoRotate(true);
  };

  // Determine active entity based on clean priority hierarchy:
  // 1. Hovered Hub -> 2. Hovered Country -> 3. Selected Hub -> 4. Selected Country
  const activeEntity = useMemo(() => {
    if (hoveredHubId) {
      const hub = REGIONAL_HUBS.find((h) => h.id === hoveredHubId);
      return hub ? { type: 'hub', data: hub } : null;
    }
    if (hoveredCountryId) {
      const country = COUNTRIES.find((c) => c.iso === hoveredCountryId);
      return country ? { type: 'country', data: country } : null;
    }
    if (selectedHubId) {
      const hub = REGIONAL_HUBS.find((h) => h.id === selectedHubId);
      return hub ? { type: 'hub', data: hub } : null;
    }
    if (selectedCountryId) {
      const country = COUNTRIES.find((c) => c.iso === selectedCountryId);
      return country ? { type: 'country', data: country } : null;
    }
    return null;
  }, [hoveredHubId, hoveredCountryId, selectedHubId, selectedCountryId]);

  return (
    <div className={`relative flex flex-col items-center justify-center bg-transparent ${className}`}>
      {/* 3D Canvas / 2D Fallback Stage - Completely transparent, no dark card */}
      <div
        className={`relative w-full overflow-visible bg-transparent transition-all duration-300 ${
          useFallback2D
            ? 'max-w-[760px] flex items-center justify-center py-1'
            : 'max-w-[540px] h-[380px] sm:h-[460px] md:h-[500px] lg:h-[520px]'
        }`}
      >
        {useFallback2D ? (
          <GlobeFallback2D
            selectedHubId={selectedHubId}
            hoveredHubId={hoveredHubId}
            onHubSelect={handleHubSelect}
            onHubHover={handleHubHover}
            selectedCountryId={selectedCountryId}
            hoveredCountryId={hoveredCountryId}
            onCountrySelect={handleCountrySelect}
            onCountryHover={handleCountryHover}
          />
        ) : (
          <EarthCanvas
            selectedHubId={selectedHubId}
            hoveredHubId={hoveredHubId}
            onHubSelect={handleHubSelect}
            onHubHover={handleHubHover}
            selectedCountryId={selectedCountryId}
            hoveredCountryId={hoveredCountryId}
            onCountrySelect={handleCountrySelect}
            onCountryHover={handleCountryHover}
            isAutoRotate={isAutoRotate}
            onWebGLFailure={() => setUseFallback2D(true)}
          />
        )}

        {/* Compact Tooltip docks cleanly at top-left inside stage with absolute positioning */}
        {/* Absolutely positioned: NEVER alters document flow or causes 2D hover flickering */}
        {activeEntity && activeEntity.data && (
          <div className="absolute left-2.5 top-2.5 z-20 pointer-events-auto">
            <RegionTooltip
              entity={activeEntity.data}
              onClose={() => {
                setSelectedHubId(null);
                setHoveredHubId(null);
                setSelectedCountryId(null);
                setHoveredCountryId(null);
              }}
            />
          </div>
        )}

        {/* Discreet hint on initial view */}
        {!selectedHubId && !hoveredHubId && !selectedCountryId && !hoveredCountryId && (
          <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full border border-[var(--c-divider)] bg-white/85 px-3 py-1 text-[11px] text-[var(--c-secondary-ink)] backdrop-blur-sm shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2858E8] animate-pulse" />
            <span>
              {useFallback2D
                ? 'Hover or click countries & pins to inspect'
                : 'Drag to rotate · Hover countries & hubs to inspect'}
            </span>
          </div>
        )}

        {/* Minimalist Floating Action Controls (Quiet, understated buttons) */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          {!useFallback2D && (
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className="rounded-md border border-[var(--c-divider)] bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              title={isAutoRotate ? 'Pause Rotation' : 'Resume Rotation'}
              aria-label={isAutoRotate ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            >
              {isAutoRotate ? '⏸' : '▶'}
            </button>
          )}
          <button
            onClick={handleResetView}
            className="rounded-md border border-[var(--c-divider)] bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Reset to default view"
            aria-label="Reset selection and orientation"
          >
            ↺
          </button>
          <button
            onClick={() => setUseFallback2D(!useFallback2D)}
            className="rounded-md border border-[var(--c-divider)] bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[var(--c-cobalt)] hover:bg-white shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Toggle 2D / 3D mode"
          >
            {useFallback2D ? '3D' : '2D'}
          </button>
        </div>
      </div>
    </div>
  );
}

