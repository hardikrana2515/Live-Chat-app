import { useState } from 'react';
import { CAST_MEMBERS } from './castData';
import { FiCheckCircle, FiMapPin, FiMessageSquare, FiUsers, FiVideo, FiShield } from 'react-icons/fi';

/**
 * CastReferenceSheet - Character Reference Matrix for Phase 4
 * Documents each character's identity, physical traits, styling rules,
 * and cross-scene appearances to ensure complete continuity across Talkyy.
 */
export default function CastReferenceSheet() {
  const [selectedCharacter, setSelectedCharacter] = useState(CAST_MEMBERS[0]);

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8]">
              <FiShield className="h-3.5 w-3.5" /> Fictional Character Continuity System
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--c-primary-ink)]">
              Talkyy Cast Reference Matrix
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[var(--c-secondary-ink)] max-w-2xl">
              Authentic, diverse personas representing genuine human connection. Each character maintains consistent facial features, clothing aesthetic, and voice across direct messaging, group conversations, and video calls.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--c-secondary-ink)] border-t md:border-t-0 md:border-l border-[var(--c-divider)] pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-xl font-bold text-[#2858E8] font-display">5</p>
              <p>Cast Members</p>
            </div>
            <div className="h-8 w-px bg-[var(--c-divider)]" />
            <div>
              <p className="text-xl font-bold text-[#2858E8] font-display">3</p>
              <p>Scenarios</p>
            </div>
            <div className="h-8 w-px bg-[var(--c-divider)]" />
            <div>
              <p className="text-xl font-bold text-[#16a34a] font-display">100%</p>
              <p>Fictional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAST_MEMBERS.map((char) => {
          const isSelected = selectedCharacter.id === char.id;
          return (
            <div
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              className={`cursor-pointer rounded-2xl border bg-white overflow-hidden transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-[#2858E8] ring-2 ring-[#2858E8]/20 shadow-sm'
                  : 'border-[var(--c-divider)]'
              }`}
            >
              {/* Portrait Header */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]">
                <img
                  src={char.portrait}
                  alt={`Portrait of ${char.name}`}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--c-primary-ink)] shadow-sm backdrop-blur-sm">
                  {char.age} yrs
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <FiMapPin className="h-3 w-3 text-[#2858E8]" />
                  <span>{char.location}</span>
                </div>
              </div>

              {/* Character Details */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[var(--c-primary-ink)]">
                      {char.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                      {char.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#2858E8]">{char.role}</p>
                </div>

                <div className="space-y-2 text-xs text-[var(--c-secondary-ink)]">
                  <div>
                    <strong className="text-[var(--c-primary-ink)] font-semibold">Appearance: </strong>
                    {char.appearance}
                  </div>
                  <div>
                    <strong className="text-[var(--c-primary-ink)] font-semibold">Wardrobe Style: </strong>
                    {char.clothingStyle}
                  </div>
                </div>

                {/* Scene Tags */}
                <div className="border-t border-[var(--c-divider)] pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--c-secondary-ink)] mb-2">
                    Active Scenarios
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {char.scenes.map((scene, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-[var(--c-warm-paper)] px-2 py-0.5 text-[11px] font-medium text-[var(--c-primary-ink)] border border-[var(--c-divider)]"
                      >
                        {scene.includes('1:1') && <FiMessageSquare className="h-3 w-3 text-[#2858E8]" />}
                        {scene.includes('Group') && <FiUsers className="h-3 w-3 text-[#16a34a]" />}
                        {scene.includes('Video') && <FiVideo className="h-3 w-3 text-[#78350F]" />}
                        <span className="truncate max-w-[180px]">{scene.split('(')[0]}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Character Deep-Dive Card */}
      <div className="rounded-2xl border border-[var(--c-divider)] bg-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-48 shrink-0">
            <img
              src={selectedCharacter.portrait}
              alt={selectedCharacter.name}
              className="w-full aspect-square object-cover rounded-xl border border-[var(--c-divider)] shadow-sm"
            />
            {selectedCharacter.videoFrame && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-[var(--c-secondary-ink)] uppercase mb-1">
                  Video Stream Frame:
                </p>
                <img
                  src={selectedCharacter.videoFrame}
                  alt={`${selectedCharacter.name} in call`}
                  className="w-full aspect-video object-cover rounded-lg border border-[var(--c-divider)]"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-bold text-[var(--c-primary-ink)]">
                {selectedCharacter.name}
              </h3>
              <span className="rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-0.5 text-xs font-semibold text-[#2858E8]">
                {selectedCharacter.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-[var(--c-warm-paper)] border border-[var(--c-divider)]">
                <span className="font-bold text-[var(--c-primary-ink)] block mb-1">Location & Identity</span>
                <p className="text-[var(--c-secondary-ink)]">{selectedCharacter.location} • Age {selectedCharacter.age}</p>
                <p className="text-[var(--c-secondary-ink)] mt-1">Status: {selectedCharacter.statusText}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--c-warm-paper)] border border-[var(--c-divider)]">
                <span className="font-bold text-[var(--c-primary-ink)] block mb-1">Consistency Rules</span>
                <p className="text-[var(--c-secondary-ink)]">Same facial structure, genuine natural skin texture with subtle pores, natural eye contact, no airbrushed model look.</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--c-secondary-ink)] mb-2">
                Cross-Scene Presence in Landing Page Prototype
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--c-primary-ink)]">
                {selectedCharacter.scenes.map((scene, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FiCheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                    <span>{scene}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
