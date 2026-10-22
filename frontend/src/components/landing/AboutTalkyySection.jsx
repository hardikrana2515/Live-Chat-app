import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

/**
 * AboutTalkyySection
 *
 * Polished editorial "About Talkyy" section placed between FAQ and FinalCTA.
 * Uses the supplied wide office banner as its hero visual.
 */
const AboutTalkyySection = () => {
  return (
    <section
      id="about"
      className="landing-section relative bg-[var(--c-warm-paper)] border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-about py-16 sm:py-20 lg:py-24"
      aria-labelledby="about-talkyy-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        {/* Editorial Two-Column Introduction */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12 mb-10 sm:mb-12">
          {/* Left Column: Eyebrow, Heading, Paragraph */}
          <div className="lg:col-span-8 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8]" aria-hidden="true" />
              <span className="tracking-wider uppercase">A LITTLE ABOUT TALKYY</span>
            </div>

            <h2
              id="about-talkyy-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.14]"
            >
              A calmer space for{' '}
              <span className="text-[#2858E8]">real conversations.</span>
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--c-secondary-ink)] sm:text-lg">
              Talkyy brings private conversations, group chats, and voice or video calls into one thoughtfully designed space — so staying close to your people feels simple and natural.
            </p>
          </div>

          {/* Right Column: Primary Action Button */}
          <div className="lg:col-span-4 flex lg:justify-end items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#2858E8] hover:bg-[#173BB5] px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <span>Explore Talkyy</span>
              <FiArrowRight className="text-base" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Panoramic Office Banner Visual */}
        <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl border border-[var(--c-divider)] shadow-[0_8px_30px_rgba(25,27,32,0.06)] bg-[#191B20]">
          <div className="aspect-[2172/724] sm:aspect-[21/8] w-full relative">
            <img
              src="/brand/talkyy-office-banner.png"
              alt="Talkyy brand identity displayed in a calm, modern space"
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
              loading="lazy"
              width="2172"
              height="724"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTalkyySection;
