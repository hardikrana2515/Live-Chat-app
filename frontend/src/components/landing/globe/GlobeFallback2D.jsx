import React from 'react';
import { REGIONAL_HUBS, COUNTRIES, CONNECTION_ROUTES } from './globeData.js';
import { NATURAL_EARTH_LAND_PATH, projectNaturalEarth } from './globe2dData.js';
import { COUNTRY_SVG_PATHS } from './globe2dCountries.js';

/**
 * 2D Digital World Map Fallback (Natural Earth Cartographic Projection).
 * Renders recognizable global continental silhouettes with Talkyy brand cobalt linework,
 * individual country-level outlines, regional hubs, and expanded communication corridors.
 * 
 * Pointer Events Architecture:
 * - Graticules, base land silhouettes, and connection routes are marked pointer-events-none.
 * - Country boundary paths and Regional Hub beacons are the dedicated interaction targets.
 * - Stable identifiers eliminate all hover-flickering and layout displacement.
 */
export default function GlobeFallback2D({
  selectedHubId,
  hoveredHubId,
  onHubSelect,
  onHubHover,
  selectedCountryId,
  hoveredCountryId,
  onCountrySelect,
  onCountryHover,
}) {
  const activeHubId = hoveredHubId || selectedHubId;
  const activeCountryId = hoveredCountryId || selectedCountryId;

  // Determine active route hub for corridor highlighting
  const activeRouteHubId = React.useMemo(() => {
    if (activeHubId) return activeHubId;
    if (activeCountryId) {
      const country = COUNTRIES.find((c) => c.iso === activeCountryId);
      return country?.hubRef || null;
    }
    return null;
  }, [activeHubId, activeCountryId]);

  // Pre-calculate hub positions using Natural Earth projection
  const hubPositions = React.useMemo(() => {
    const map = new Map();
    REGIONAL_HUBS.forEach((hub) => {
      map.set(hub.id, projectNaturalEarth(hub.lng, hub.lat));
    });
    return map;
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <svg
        viewBox="0 0 800 390"
        className="h-auto w-full max-w-[740px] overflow-visible select-none"
        aria-label="2D Digital World Map showing global communication routes and selectable countries"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle glow filter for active route corridors and selected boundaries */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Subtle Graticule Grid Lines (Parallels and Meridians) - Non-interactive */}
        <g stroke="#2858E8" strokeOpacity="0.08" strokeWidth="0.8" strokeDasharray="3 3" className="pointer-events-none">
          {/* Parallels (Latitudes: 60°N, 30°N, Equator 0°, 30°S) */}
          <line x1="30" y1="94" x2="770" y2="94" />
          <line x1="30" y1="162" x2="770" y2="162" />
          <line x1="30" y1="230" x2="770" y2="230" />
          <line x1="30" y1="298" x2="770" y2="298" />

          {/* Meridians (Longitudes: 120°W, 60°W, Prime 0°, 60°E, 120°E) */}
          <line x1="145" y1="30" x2="145" y2="360" />
          <line x1="272" y1="30" x2="272" y2="360" />
          <line x1="400" y1="30" x2="400" y2="360" />
          <line x1="528" y1="30" x2="528" y2="360" />
          <line x1="655" y1="30" x2="655" y2="360" />
        </g>

        {/* 2. Base Continental Silhouette (Natural Earth Vector Outlines) - Non-interactive background */}
        <path
          d={NATURAL_EARTH_LAND_PATH}
          fill="#E8EEFF"
          stroke="#2858E8"
          strokeWidth="1.15"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="pointer-events-none transition-colors duration-200"
        />

        {/* 3. Major Priority Country Polygons (Level 1 Entities) - Interactive Targets */}
        <g id="country-layer">
          {COUNTRIES.map((country) => {
            const pathD = COUNTRY_SVG_PATHS[country.iso];
            if (!pathD) return null;

            const isSelected = selectedCountryId === country.iso;
            const isHovered = hoveredCountryId === country.iso;
            const isActive = isSelected || isHovered;

            return (
              <path
                key={country.iso}
                id={`country-${country.iso}`}
                d={pathD}
                fill={
                  isSelected
                    ? 'rgba(40, 88, 232, 0.32)'
                    : isHovered
                    ? 'rgba(40, 88, 232, 0.18)'
                    : 'rgba(40, 88, 232, 0.001)'
                }
                stroke={isSelected ? '#173BB5' : '#2858E8'}
                strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.8}
                strokeOpacity={isActive ? 0.95 : 0.28}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="all"
                className="cursor-pointer transition-all duration-150"
                style={{ pointerEvents: 'all' }}
                onMouseEnter={() => onCountryHover && onCountryHover(country.iso)}
                onMouseLeave={() => onCountryHover && onCountryHover(null)}
                onPointerEnter={() => onCountryHover && onCountryHover(country.iso)}
                onPointerLeave={() => onCountryHover && onCountryHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountrySelect && onCountrySelect(country.iso);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${country.name} (${country.iso})`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCountrySelect && onCountrySelect(country.iso);
                  }
                }}
              />
            );
          })}
        </g>


        {/* 4. Global Communication Corridors (27 Routes, Expanded Oceania) - Non-interactive strokes */}
        <g className="pointer-events-none">
          {CONNECTION_ROUTES.map((route) => {
            const p1 = hubPositions.get(route.from);
            const p2 = hubPositions.get(route.to);
            if (!p1 || !p2) return null;

            // Compute curved geodesic trajectory in 2D projection
            let ctrlX = (p1.x + p2.x) / 2;
            let ctrlY = Math.min(p1.y, p2.y) - 22;

            if (route.id === 'transpacific_north') {
              // Great Circle route over Alaska / Arctic
              ctrlX = (p1.x + p2.x) / 2;
              ctrlY = 30;
            } else if (route.id === 'pan_american') {
              ctrlX = Math.min(p1.x, p2.x) - 20;
              ctrlY = (p1.y + p2.y) / 2;
            } else if (route.id === 'pacific_rim_south') {
              ctrlX = (p1.x + p2.x) / 2;
              ctrlY = 352;
            } else if (route.id === 'oceania_north_america') {
              ctrlX = 470;
              ctrlY = 372;
            } else if (route.id === 'oceania_africa') {
              ctrlX = 585;
              ctrlY = 338;
            } else if (route.id === 'south_atlantic') {
              ctrlX = 390;
              ctrlY = 285;
            } else if (route.id === 'latin_america_europe') {
              ctrlX = 345;
              ctrlY = 180;
            } else if (route.id === 'africa_india') {
              ctrlX = 515;
              ctrlY = 222;
            }

            const pathData = `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`;
            const isConnected =
              activeRouteHubId &&
              (route.from === activeRouteHubId || route.to === activeRouteHubId);

            return (
              <g key={route.id} className="transition-all duration-300">
                {/* Active glow backing */}
                {isConnected && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#2858E8"
                    strokeWidth="4.5"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    filter="url(#routeGlow)"
                  />
                )}
                {/* Main route stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#2858E8"
                  strokeWidth={isConnected ? 2.2 : 1}
                  strokeOpacity={isConnected ? 0.95 : activeRouteHubId ? 0.12 : 0.25}
                  strokeDasharray={isConnected ? 'none' : '3 3'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* 5. Regional Hub Markers (Level 2 Entities) - Interactive Beacons */}
        <g id="hub-layer" className="z-10">
          {REGIONAL_HUBS.map((hub) => {
            const pos = hubPositions.get(hub.id);
            if (!pos) return null;

            const isSelected = selectedHubId === hub.id;
            const isHovered = hoveredHubId === hub.id;
            const isHubActive = isSelected || isHovered;

            return (
              <g
                key={hub.id}
                id={`hub-${hub.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onPointerEnter={() => onHubHover && onHubHover(hub.id)}
                onPointerLeave={() => onHubHover && onHubHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onHubSelect && onHubSelect(hub.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${hub.name} region`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onHubSelect && onHubSelect(hub.id);
                  }
                }}
              >
                {/* Generous touch/click invisible target */}
                <circle r="20" fill="transparent" />

                {/* Outer beacon pulse ring */}
                <circle
                  r={isHubActive ? 11 : 6.5}
                  fill="#2858E8"
                  fillOpacity={isHubActive ? 0.22 : 0.08}
                  stroke="#2858E8"
                  strokeWidth={isHubActive ? 1.8 : 1.1}
                  strokeOpacity={isHubActive ? 0.95 : 0.45}
                  className="transition-all duration-300 group-hover:scale-125"
                />

                {/* Center solid cobalt dot */}
                <circle
                  r={isHubActive ? 4.2 : 2.8}
                  fill="#2858E8"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

