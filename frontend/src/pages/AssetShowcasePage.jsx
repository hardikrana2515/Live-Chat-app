import { useState } from 'react';
import { Link } from 'react-router-dom';
import CastReferenceSheet from '../components/landing/assets/CastReferenceSheet';
import PrivateChatPreview from '../components/landing/assets/PrivateChatPreview';
import GroupChatPreview from '../components/landing/assets/GroupChatPreview';
import VideoCallPreview from '../components/landing/assets/VideoCallPreview';
import {
  FiUsers,
  FiMessageSquare,
  FiLayers,
  FiVideo,
  FiDatabase,
  FiArrowRight,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiTablet
} from 'react-icons/fi';

/**
 * Isolated Prototype Page for Phase 4: Human-Centered Visual Asset System.
 * Accessible at /prototype/assets for comprehensive review and validation.
 */
export default function AssetShowcasePage() {
  const [activeTab, setActiveTab] = useState('cast'); // 'cast' | 'private' | 'group' | 'call' | 'specs'
  const [viewportMode, setViewportMode] = useState('responsive'); // 'responsive' | 'mobile' | 'tablet' | 'desktop'

  const getContainerWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
        return 'max-w-[1240px]';
      default:
        return 'w-full max-w-[1240px]';
    }
  };

  const tabs = [
    { id: 'cast', label: '1. Cast Reference Sheet', icon: FiUsers },
    { id: 'private', label: '2. Scenario A: 1:1 Chat', icon: FiMessageSquare },
    { id: 'group', label: '3. Scenario B: Group Chat', icon: FiLayers },
    { id: 'call', label: '4. Scenario C: Video Call', icon: FiVideo },
    { id: 'specs', label: '5. Asset Specs & Optimization', icon: FiDatabase }
  ];

  const assetInventory = [
    {
      name: 'elena.jpg',
      type: 'Portrait Avatar',
      category: 'Cast Directory',
      dimensions: '1024 × 1024',
      ratio: '1:1',
      size: '687 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/cast/elena.jpg',
      desc: 'Elena Costa: 30yo Portuguese architect, natural warm lighting'
    },
    {
      name: 'marcus.jpg',
      type: 'Portrait Avatar',
      category: 'Cast Directory',
      dimensions: '1024 × 1024',
      ratio: '1:1',
      size: '742 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/cast/marcus.jpg',
      desc: 'Marcus Vance: 28yo sound engineer, short fade, mustard crewneck'
    },
    {
      name: 'sofia.jpg',
      type: 'Portrait Avatar',
      category: 'Cast Directory',
      dimensions: '1024 × 1024',
      ratio: '1:1',
      size: '701 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/cast/sofia.jpg',
      desc: 'Sofia Chen: 26yo designer, black chin-length bob, forest green knit'
    },
    {
      name: 'dev.jpg',
      type: 'Portrait Avatar',
      category: 'Cast Directory',
      dimensions: '1024 × 1024',
      ratio: '1:1',
      size: '728 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/cast/dev.jpg',
      desc: 'Dev Patel: 31yo photographer, textured wavy hair, casual navy shirt'
    },
    {
      name: 'leo.jpg',
      type: 'Portrait Avatar',
      category: 'Cast Directory',
      dimensions: '1024 × 1024',
      ratio: '1:1',
      size: '786 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/cast/leo.jpg',
      desc: 'Grandfather Leo: 68yo teacher & musician, silver hair, gray cardigan'
    },
    {
      name: 'lisbon-tram.jpg',
      type: 'Photo Moment',
      category: 'Private Chat',
      dimensions: '1365 × 1024',
      ratio: '4:3',
      size: '1.05 MB',
      format: 'JPEG (High Quality)',
      path: '/assets/moments/lisbon-tram.jpg',
      desc: 'Elena in Lisbon Alfama with yellow vintage tram 28 in morning sun'
    },
    {
      name: 'alpine-trail.jpg',
      type: 'Photo Moment',
      category: 'Group Chat',
      dimensions: '1365 × 1024',
      ratio: '4:3',
      size: '1.22 MB',
      format: 'JPEG (High Quality)',
      path: '/assets/moments/alpine-trail.jpg',
      desc: 'Dev scouting alpine trail with sunlit pine trees and serene lake view'
    },
    {
      name: 'call-sofia.jpg',
      type: 'Video Call Stream',
      category: 'Video Grid',
      dimensions: '1820 × 1024',
      ratio: '16:9',
      size: '618 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/calls/call-sofia.jpg',
      desc: 'Sofia Chen speaking enthusiastically into laptop camera at desk'
    },
    {
      name: 'call-leo.jpg',
      type: 'Video Call Stream',
      category: 'Video Grid',
      dimensions: '1820 × 1024',
      ratio: '16:9',
      size: '746 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/calls/call-leo.jpg',
      desc: 'Grandfather Leo strumming acoustic guitar with warm smile'
    },
    {
      name: 'call-marcus.jpg',
      type: 'Video Call Stream',
      category: 'Video Grid',
      dimensions: '1820 × 1024',
      ratio: '16:9',
      size: '688 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/calls/call-marcus.jpg',
      desc: 'Marcus Vance listening attentively with warm genuine expression'
    },
    {
      name: 'call-elena.jpg',
      type: 'Video Call Stream',
      category: 'Video Grid',
      dimensions: '1820 × 1024',
      ratio: '16:9',
      size: '715 KB',
      format: 'JPEG (High Quality)',
      path: '/assets/calls/call-elena.jpg',
      desc: 'Elena Costa resting chin, smiling and laughing during family call'
    }
  ];

  return (
    <div className="landing-root min-h-screen bg-[var(--c-canvas)] text-[var(--c-primary-ink)] font-body py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Prototype Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--c-divider)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#2858E8] px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                Phase 4 Prototype
              </span>
              <span className="text-xs text-[var(--c-secondary-ink)]">
                Human-Centered Visual Asset System
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--c-primary-ink)]">
              Talkyy Visual Assets & Scenarios
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport Simulation Switcher */}
            <div className="flex items-center rounded-lg border border-[var(--c-divider)] bg-white p-1 shadow-sm text-xs">
              <button
                onClick={() => setViewportMode('responsive')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'responsive' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
                title="Full Responsive"
              >
                <FiMonitor className="h-3.5 w-3.5" />
                <span>Auto</span>
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'desktop' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
                title="1240px Desktop View"
              >
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'tablet' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
                title="768px Tablet View"
              >
                <FiTablet className="h-3.5 w-3.5" />
                <span>Tablet</span>
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
                  viewportMode === 'mobile' ? 'bg-[#2858E8] text-white' : 'text-[var(--c-secondary-ink)]'
                }`}
                title="420px Mobile View"
              >
                <FiSmartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Link to Phase 3 Globe */}
            <Link
              to="/prototype/globe"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--c-divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--c-primary-ink)] shadow-sm hover:border-[#2858E8] hover:text-[#2858E8] transition"
            >
              <FiGlobe className="h-3.5 w-3.5" />
              <span>Phase 3 Globe</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-[var(--c-divider)] pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#2858E8] text-white shadow-sm'
                    : 'bg-white text-[var(--c-secondary-ink)] border border-[var(--c-divider)] hover:text-[var(--c-primary-ink)] hover:border-[#2858E8]/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Container */}
        <div className="mt-8 flex justify-center">
          <div className={`w-full transition-all duration-300 ${getContainerWidth()}`}>
            {activeTab === 'cast' && <CastReferenceSheet />}
            {activeTab === 'private' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-4 border border-[var(--c-divider)] text-center text-xs text-[var(--c-secondary-ink)]">
                  <strong className="text-[var(--c-primary-ink)]">Scenario A • Private 1-on-1 Conversation: </strong>
                  Authentic connection between Elena and Marcus. Try playing the voice note to hear the street sound waveform, or click the heart reaction badge.
                </div>
                <PrivateChatPreview />
              </div>
            )}
            {activeTab === 'group' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-4 border border-[var(--c-divider)] text-center text-xs text-[var(--c-secondary-ink)]">
                  <strong className="text-[var(--c-primary-ink)]">Scenario B • Group Conversation: </strong>
                  "Weekend Hikers" planning Saturday trail. Dev shared a scouting photo and a live poll. Click on either trail option to cast or toggle your vote interactively!
                </div>
                <GroupChatPreview />
              </div>
            )}
            {activeTab === 'call' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-4 border border-[var(--c-divider)] text-center text-xs text-[var(--c-secondary-ink)]">
                  <strong className="text-[var(--c-primary-ink)]">Scenario C • 4-Way Voice & Video Call: </strong>
                  Sofia Chen speaking with live audio equalizer, Grandfather Leo serenading with his acoustic guitar, Marcus Vance and Elena Costa participating. Toggle Mute or Video to test interaction states.
                </div>
                <VideoCallPreview />
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[var(--c-primary-ink)]">
                      Visual Asset Technical Inventory & Performance
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--c-secondary-ink)] mt-1">
                      All assets follow Talkyy’s strict editorial art direction: natural lighting, genuine skin tones, authentic documentary perspectives, and zero stock-photo watermarks or plastic AI artifacts.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[var(--c-divider)] rounded-xl overflow-hidden">
                      <thead className="bg-[var(--c-warm-paper)] text-[var(--c-primary-ink)] font-semibold border-b border-[var(--c-divider)]">
                        <tr>
                          <th className="p-3">File Name</th>
                          <th className="p-3">Asset Type</th>
                          <th className="p-3">Scenario</th>
                          <th className="p-3">Dimensions</th>
                          <th className="p-3">Ratio</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--c-divider)]">
                        {assetInventory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="p-3 font-mono font-bold text-[#2858E8]">{item.name}</td>
                            <td className="p-3 font-medium text-[var(--c-primary-ink)]">{item.type}</td>
                            <td className="p-3 text-[var(--c-secondary-ink)]">{item.category}</td>
                            <td className="p-3 font-mono">{item.dimensions}</td>
                            <td className="p-3">
                              <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                                {item.ratio}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-neutral-600">{item.size}</td>
                            <td className="p-3 text-[var(--c-secondary-ink)]">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--c-divider)] pt-6 text-xs text-[var(--c-secondary-ink)]">
          <p>Talkyy Phase 4 • Human-Centered Visual Asset System • Isolated Prototype</p>
          <div className="flex items-center gap-4">
            <Link to="/prototype/globe" className="hover:text-[#2858E8] transition">
              Phase 3 Globe Prototype
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-[#2858E8] transition">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
