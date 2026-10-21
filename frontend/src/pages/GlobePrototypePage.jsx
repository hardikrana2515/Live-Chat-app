import { useState } from 'react';
import { Link } from 'react-router-dom';
import InteractiveGlobe from '../components/landing/globe/InteractiveGlobe';

/**
 * Isolated Prototype Page for Phase 3: Interactive 3D Earth Globe.
 * Allows comprehensive testing across viewports, interactions, and fallback states
 * without modifying any authenticated routes or core chat logic.
 */
export default function GlobePrototypePage() {
  const [viewportMode, setViewportMode] = useState('responsive'); // 'responsive' | 'mobile' | 'tablet' | 'desktop'

  const getContainerWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
        return 'max-w-[1240px]';
      default:
        return 'w-full max-w-[1240px]';
    }
  };

  return (
    <div className="landing-root min-h-screen bg-[var(--c-canvas)] text-[var(--c-primary-ink)] font-body py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Prototype Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--c-divider)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#2858E8] px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                Phase 3 Prototype
              </span>
              <span className="text-xs text-[var(--c-secondary-ink)]">
                Interactive 3D Earth Globe Verification
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--c-primary-ink)]">
              Talkyy Global Connection Globe
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport simulation switcher */}
            <div className="flex items-center rounded-lg border border-[var(--c-divider)] bg-white p-1 shadow-sm text-xs">
              <button
                onClick={() => setViewportMode('responsive')}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'responsive' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
              >
                Auto Full
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'desktop' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
              >
                Desktop (1240px)
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'tablet' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
              >
                Tablet (768px)
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'mobile' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
              >
                Mobile (390px)
              </button>
            </div>

            <Link
              to="/prototype/assets"
              className="rounded-lg border border-[var(--c-divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[#2858E8] hover:bg-[#E8EEFF] transition shadow-xs"
            >
              Phase 4 Assets →
            </Link>

            <Link
              to="/"
              className="rounded-lg border border-[var(--c-divider)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--c-primary-ink)] hover:bg-[#F3F6FC] transition"
            >
              ← Back to App
            </Link>
          </div>
        </div>

        {/* Prototype Showcase Stage */}
        <div className="mt-8 flex justify-center">
          <div className={`transition-all duration-300 ${getContainerWidth()}`}>
            {/* Hero Simulation Context */}
            <div
              className={`mb-6 grid items-center gap-8 ${
                viewportMode === 'mobile' || viewportMode === 'tablet'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]'
              }`}
            >
              <div>
                <p className="landing-eyebrow">A more personal place to talk</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight text-[var(--c-primary-ink)]">
                  Good conversations bring us closer.
                </h2>
                <p className="mt-3 text-base text-[var(--c-secondary-ink)]">
                  Interactive demonstration showcasing geographic connection routes between major sovereign nations
                  and regional communication hubs.
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    WebGL 3D Active
                  </span>
                  <span className="text-xs text-[var(--c-secondary-ink)]">
                    Drag to spin · Click pins to inspect
                  </span>
                </div>
              </div>

              {/* The Globe Prototype Component */}
              <div>
                <InteractiveGlobe />
              </div>
            </div>

            {/* Verification Checklist Card */}
            <div className="mt-10 rounded-2xl border border-[var(--c-divider)] bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-[var(--c-primary-ink)]">
                Phase 3 Refinement: Digital Connection Map Verification Matrix
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Digital Map Linework:</strong> Luminous brand cobalt (`#2858E8`) Natural Earth vector coastlines.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Seamless Warm Paper:</strong> 100% transparent canvas sitting directly on `#F7F5EF` with no dark container box.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Delicate Graticule:</strong> Parallels (Equator, ±30°, ±60°) and meridians in subtle faint cobalt.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Curved Connection Arcs:</strong> Refined 3D Bézier corridors with traveling signal points.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Compact Tooltip:</strong> Minimal card displaying region name and illustrative connections count.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Regional Hover & Click:</strong> Highlights active corridors and beacons with smooth rotation.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Smooth Momentum Drag:</strong> Pointer and touch rotation with realistic inertial damping.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>2D Vector Fallback:</strong> Clean SVG vector fallback for non-WebGL/reduced-motion environments.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Zero Layout Shift:</strong> Fast, non-blocking rendering and instant load.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
