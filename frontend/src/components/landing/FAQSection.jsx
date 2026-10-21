import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'What is Talkyy?',
    answer:
      'Talkyy is a browser-native messaging workspace for private one-to-one conversations and group chats, with peer-to-peer voice and video calls and media sharing built right into the thread.'
  },
  {
    id: 'faq-2',
    question: 'Can I create group conversations?',
    answer:
      'Yes. Anyone can create a group, assign admins, add or remove members, customize group icons, and run interactive group polls to make decisions together.'
  },
  {
    id: 'faq-3',
    question: 'Does Talkyy support voice and video calls?',
    answer:
      'Yes. Talkyy supports one-to-one and group voice and video calls directly from the conversation header using WebRTC, without switching rooms or needing external meeting links.'
  },
  {
    id: 'faq-4',
    question: 'How does Talkyy protect my conversations?',
    answer:
      'Message content and shared media are encrypted on your device using client-side keys before being sent. The server relays and stores only opaque ciphertext, while routing metadata like timestamps and participant lists remains visible to deliver messages.'
  },
  {
    id: 'faq-5',
    question: 'Can I share files and media?',
    answer:
      'Yes. You can share photos, documents, and record voice notes with inline waveform playback directly in personal and group threads.'
  },
  {
    id: 'faq-6',
    question: 'Can I edit or delete messages?',
    answer:
      "Yes. You can edit messages with a visible '(edited)' notice, or delete messages within one hour ('delete for everyone' clears the message on the server, while 'delete for me' hides it from your view)."
  }
];

/**
 * Phase 5.6: FAQ Section
 *
 * An elegant, accessible accordion answering key questions based on real verified functionality.
 * - Eyebrow: "GOOD QUESTIONS"
 * - Heading: "Before you join the conversation."
 * - Supporting copy: "Here are a few things worth knowing about Talkyy."
 * - Accessible keyboard interaction, aria-expanded attributes, and clean vertical rhythm.
 */
const FAQSection = () => {
  // Store which items are currently expanded (support multiple open or single accordion)
  const [openItems, setOpenItems] = useState({ 'faq-1': true });

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section
      id="faq"
      className="landing-section relative bg-[var(--c-warm-paper)] border-t border-[var(--c-divider)] landing-panel landing-panel--overlap landing-panel--sticky landing-panel--z-faq"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 landing-panel__inner">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 items-start">
          {/* Section Introduction (Left) */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2858E8] animate-pulse" aria-hidden="true" />
              <span className="tracking-wide">GOOD QUESTIONS</span>
            </div>

            <h2
              id="faq-heading"
              className="font-display text-3xl font-bold tracking-tight text-[var(--c-primary-ink)] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]"
            >
              Before you join
              <br />
              <span className="text-[#2858E8]">the conversation.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--c-secondary-ink)] max-w-md">
              Here are a few things worth knowing about Talkyy.
            </p>

            <div className="mt-8 pt-6 border-t border-[var(--c-divider)] text-xs text-[var(--c-secondary-ink)] leading-relaxed">
              <span>Have a different question? Everything runs directly in your browser without installs.</span>
            </div>
          </div>

          {/* Accessible Vertical Accordion List (Right) */}
          <div className="border-t border-[var(--c-divider)]" role="region" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item) => {
              const isOpen = Boolean(openItems[item.id]);
              return (
                <div
                  key={item.id}
                  className={`border-b border-[var(--c-divider)] transition-all duration-200 px-3.5 -mx-3.5 rounded-xl ${
                    isOpen ? 'bg-white/70 shadow-2xs' : 'hover:bg-white/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="group w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left font-display text-base sm:text-lg font-semibold text-[var(--c-primary-ink)] hover:text-[#2858E8] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2858E8] focus-visible:ring-offset-2 rounded-lg cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`${item.id}-answer`}
                    id={`${item.id}-question`}
                  >
                    <span className="pr-2 leading-snug">{item.question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out ${
                        isOpen
                          ? 'bg-[#E8EEFF] border-[#2858E8]/40 text-[#2858E8] rotate-180 scale-105 shadow-2xs'
                          : 'bg-white border-[var(--c-divider)] text-[var(--c-secondary-ink)] group-hover:border-[#2858E8]/30 group-hover:text-[#2858E8]'
                      }`}
                      aria-hidden="true"
                    >
                      {isOpen ? <FiMinus className="text-sm" /> : <FiPlus className="text-sm" />}
                    </span>
                  </button>

                  <div
                    id={`${item.id}-answer`}
                    role="region"
                    aria-labelledby={`${item.id}-question`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm sm:text-[15px] leading-relaxed text-[var(--c-secondary-ink)] max-w-2xl pl-0.5">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
