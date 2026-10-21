import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/legal/LegalLayout';

const TOC_ITEMS = [
  { id: 'section-1', label: '1. Acceptance of These Terms' },
  { id: 'section-2', label: '2. Eligibility & Registration' },
  { id: 'section-3', label: '3. Security & Cryptographic Keys' },
  { id: 'section-4', label: '4. Acceptable Use' },
  { id: 'section-5', label: '5. User Content & Responsibility' },
  { id: 'section-6', label: '6. Voice & Video Calling' },
  { id: 'section-7', label: '7. Service Availability & Changes' },
  { id: 'section-8', label: '8. Suspension & Termination' },
  { id: 'section-9', label: '9. Privacy & Data Protection' },
  { id: 'section-10', label: '10. Disclaimers of Warranties' },
  { id: 'section-11', label: '11. Limitation of Liability' },
  { id: 'section-12', label: '12. Governing Law & Jurisdiction' },
  { id: 'section-13', label: '13. Changes to These Terms' },
  { id: 'section-14', label: '14. Contact & Inquiries' }
];

/**
 * Talkyy Terms of Service Page
 *
 * Official terms of service incorporating testing & development configuration details:
 * - Publication / Effective date: 1/11/2026
 * - Responsible operator: Talky.chat.com
 * - Contact email: helpdesk@talky.chat.com
 * - Location: India · Gujarat · 395002
 */
const TermsOfServicePage = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="These Terms of Service govern your access to and use of the Talkyy application, messaging workspace, voice and video calling features, and related services."
      effectiveDate="1/11/2026"
      alertTitle="Testing & Development Period Configuration"
      alertContent="These operating entity details (Talky.chat.com) and contact address (helpdesk@talky.chat.com) are temporarily configured for the active testing and development period."
      tocItems={TOC_ITEMS}
    >
      <div className="mb-8 text-xs text-[#51545C]">
        <p className="mb-2">
          <strong>Last Updated:</strong> 1/11/2026
        </p>
        <p className="leading-relaxed">
          These Terms form an agreement between you and the person or legal entity operating Talkyy, identified in the Contact section below.
        </p>
      </div>

      {/* 1. Acceptance of These Terms */}
      <section id="section-1" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          1. Acceptance of These Terms
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Welcome to Talkyy (“Talkyy,” “we,” “us,” or “our”). These Terms of Service (“Terms”) govern your access to and use of the Talkyy application, messaging workspace, voice and video calling features, and related services (collectively, the “Service”).
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          By creating an account, accessing, or using the Service, you acknowledge that you have read and agree to these Terms. If you do not agree, you must not use the Service.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          These Terms form an agreement between you and the person or legal entity operating Talkyy, identified in the Contact section below.
        </p>
      </section>

      {/* 2. Eligibility and Account Registration */}
      <section id="section-2" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          2. Eligibility and Account Registration
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          You may use Talkyy only if you are legally capable of entering into a binding agreement under applicable law and meet any applicable age requirements.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          When registering, you agree to provide accurate, current, and complete information, including your display name, username, email address, and telephone number where requested. You are responsible for keeping your account information accurate and up to date.
        </p>
        <p className="mb-2 text-xs font-semibold text-[#191B20]">
          You must not:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1.5">
          <li>Impersonate another person or misrepresent your identity.</li>
          <li>Use another person's credentials without authorization.</li>
          <li>Create accounts to evade a block, suspension, or other reasonable security restriction.</li>
          <li>Use false or misleading registration information to abuse the Service.</li>
        </ul>
      </section>

      {/* 3. Account Security and Cryptographic Keys */}
      <section id="section-3" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          3. Account Security and Cryptographic Keys
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          You are responsible for maintaining the security of your account, credentials, devices, and browser environment.
        </p>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          Talkyy may use client-side cryptographic keys to protect private conversations. Depending on the Service's implementation, some private keys may be stored in browser storage on your device rather than on Talkyy's servers.
        </p>

        <div className="rounded-lg bg-amber-50/70 p-4 border border-amber-200 text-xs text-amber-950 leading-relaxed mb-4">
          <p className="font-bold mb-1">Loss of keys notice:</p>
          <p>
            Clearing browser data, uninstalling or resetting a browser, losing access to a device, or otherwise deleting locally stored keys may make some encrypted messages or conversations permanently inaccessible. Recovery may not be possible if the necessary keys are unavailable.
          </p>
        </div>

        <p className="mb-2 text-xs font-semibold text-[#191B20]">
          You agree to:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1.5 mb-4">
          <li>Keep your password and devices secure.</li>
          <li>Avoid sharing account credentials or private cryptographic keys.</li>
          <li>Notify the operator promptly if you suspect unauthorized access to your account.</li>
          <li>Take reasonable steps to prevent unauthorized use of your account.</li>
        </ul>

        <p className="text-xs text-[#51545C] leading-relaxed">
          You are responsible for activity carried out through your account to the extent permitted by applicable law. This does not make you responsible for activity caused by a security incident or circumstances beyond your reasonable control.
        </p>
      </section>

      {/* 4. Acceptable Use */}
      <section id="section-4" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          4. Acceptable Use
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          You agree to use Talkyy lawfully and respectfully. You must not use the Service to:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-2 mb-4">
          <li>Send spam, unsolicited bulk messages, deceptive promotions, or abusive solicitations.</li>
          <li>Harass, threaten, stalk, defraud, intimidate, or unlawfully defame another person.</li>
          <li>Share content that is illegal or infringes another person's rights.</li>
          <li>Distribute malware, malicious links, corrupted files, or other harmful material.</li>
          <li>Attempt unauthorized access to accounts, systems, APIs, databases, sockets, or communication infrastructure.</li>
          <li>Circumvent authentication, rate limits, access controls, or security measures.</li>
          <li>Interfere with the stability, availability, or security of the Service.</li>
          <li>Scrape, reverse-engineer, or automate access to the Service in ways prohibited by law or these Terms, except where applicable law does not permit such restrictions.</li>
          <li>Use Talkyy to violate applicable laws or facilitate unlawful activity.</li>
        </ul>
        <p className="text-xs text-[#51545C] leading-relaxed">
          You must respect other users' boundaries, including blocks, group membership decisions, and reasonable limits on calls or messages.
        </p>
      </section>

      {/* 5. User Content and Responsibility */}
      <section id="section-5" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          5. User Content and Responsibility
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          You retain ownership of the content you create or send through Talkyy, subject to any rights belonging to other parties.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          “User Content” includes messages, documents, images, audio clips, voice notes, poll entries, reactions, and other material you submit or transmit through the Service.
        </p>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          You grant Talkyy a limited, non-exclusive right to handle, transmit, temporarily process, and store your User Content only as reasonably necessary to operate, secure, maintain, and provide the Service, subject to our Privacy Policy and applicable law. This does not transfer ownership of your content to Talkyy.
        </p>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          You are responsible for ensuring that you have the rights and permissions necessary to share your content and that your use of the Service does not violate another person's rights or applicable law.
        </p>

        <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
          <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
            Editing and deletion
          </h3>
          <p className="text-xs text-[#51545C] leading-relaxed mb-2">
            Talkyy may provide options to edit messages and delete messages for yourself or other participants. If supported by the current implementation, deleting a message for everyone is available within a one-hour window.
          </p>
          <p className="text-xs text-[#51545C] leading-relaxed mb-2">
            Editing or deleting content does not guarantee that every copy has been erased. Recipients may have already viewed, copied, downloaded, photographed, or captured the content. Copies may also remain temporarily in notifications, backups, or other systems, subject to the Service's actual implementation and retention practices.
          </p>
          <p className="text-xs text-[#51545C] leading-relaxed">
            Deleting a message for yourself may not delete it for other participants.
          </p>
        </div>
      </section>

      {/* 6. Voice and Video Calling */}
      <section id="section-6" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          6. Voice and Video Calling
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy may provide voice and video calls using WebRTC and associated signaling services. Call availability and media routing depend on the implementation, network conditions, browser capabilities, and device hardware.
        </p>
        <p className="mb-2 text-xs font-semibold text-[#191B20]">
          When using calling features, you agree to:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1.5 mb-4">
          <li>Respect other participants' consent and privacy.</li>
          <li>Avoid nuisance, threatening, harassing, or repeated unwanted calls.</li>
          <li>Obtain any consent required by applicable law before recording, transmitting, or distributing a call.</li>
          <li>Avoid using calls to facilitate unlawful conduct.</li>
        </ul>
        <p className="mb-3 text-xs text-[#51545C] leading-relaxed">
          Call quality, availability, and connectivity are not guaranteed. Calls may fail or disconnect because of network issues, browser restrictions, device limitations, or service interruptions.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          Do not assume that a call is always exclusively peer-to-peer, unrecorded, or inaccessible to intermediary infrastructure unless the Service explicitly confirms this and the technical implementation supports it.
        </p>
      </section>

      {/* 7. Service Availability and Changes */}
      <section id="section-7" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          7. Service Availability and Changes
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy is provided on an “as is” and “as available” basis, subject to applicable law.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We may update, modify, suspend, or discontinue features or parts of the Service for operational, security, maintenance, or business reasons. Where reasonably practicable, we will provide notice of material changes that significantly affect users.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          We do not guarantee uninterrupted availability, compatibility with every device or browser, or that all messages, files, calls, or notifications will be delivered without delay or error.
        </p>
      </section>

      {/* 8. Suspension and Termination */}
      <section id="section-8" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          8. Suspension and Termination
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We may restrict, suspend, or terminate access to the Service where reasonably necessary to address violations of these Terms, suspected fraud, security threats, unlawful activity, or risks to users or the Service.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Where appropriate and legally permissible, we may provide notice and an opportunity to address the issue. We may act without prior notice when necessary to protect users, investigate abuse, or respond to urgent security or legal concerns.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          You may stop using Talkyy at any time. If account deletion is available, you may request it using the account controls or contact details provided by Talkyy. The effects of account deletion, including the treatment of encrypted messages, group content, backups, and retained records, are described in the Privacy Policy and are subject to applicable law.
        </p>
      </section>

      {/* 9. Privacy and Data Protection */}
      <section id="section-9" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          9. Privacy and Data Protection
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Your use of Talkyy is also governed by our{' '}
          <Link to="/privacy-policy" className="text-[#2858E8] font-semibold underline hover:text-[#173BB5]">
            Privacy Policy
          </Link>
          , which explains what information we collect, how we use and protect it, how client-side encryption works, what metadata may be processed, and how information may be retained or deleted.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          Please read the Privacy Policy before using the Service. These Terms and the Privacy Policy should be read together.
        </p>
      </section>

      {/* 10. Disclaimers of Warranties */}
      <section id="section-10" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          10. Disclaimers of Warranties
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          To the maximum extent permitted by applicable law, Talkyy is provided without warranties beyond those that cannot lawfully be excluded. We do not guarantee that the Service will be uninterrupted, error-free, secure in every circumstance, compatible with every system, or free from all harmful components.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          Nothing in these Terms excludes or limits a warranty, consumer protection, or other right that cannot be excluded or limited under applicable law.
        </p>
      </section>

      {/* 11. Limitation of Liability */}
      <section id="section-11" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          11. Limitation of Liability
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          To the maximum extent permitted by applicable law, the operator of Talkyy will not be liable for indirect, incidental, special, consequential, or punitive loss, or for loss of profits, goodwill, business opportunities, or data arising from the use of or inability to use the Service.
        </p>
        <p className="mb-3 text-xs text-[#51545C] leading-relaxed">
          This section does not exclude or limit liability where such exclusion or limitation is prohibited by law, including any liability that cannot legally be waived.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          The extent and enforceability of any additional limitation of liability will depend on applicable law and the circumstances of the claim.
        </p>
      </section>

      {/* 12. Governing Law and Jurisdiction */}
      <section id="section-12" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          12. Governing Law and Jurisdiction
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          These Terms are governed by the laws of India, subject to applicable conflict-of-law rules and mandatory legal protections.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Any dispute arising from these Terms or the Service will be handled by the competent courts having jurisdiction under applicable law. The specific jurisdiction, dispute-resolution process, and any additional contractual requirements must be confirmed by the Talkyy operator before publication.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          Nothing in this section removes any legal rights or remedies that users cannot waive under applicable law.
        </p>
      </section>

      {/* 13. Changes to These Terms */}
      <section id="section-13" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          13. Changes to These Terms
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We may update these Terms from time to time to reflect changes to the Service, security practices, legal requirements, or business operations.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We will update the “Last Updated” date when changes are made. Where required by law, or where a change materially affects users' rights or obligations, we will provide appropriate notice.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          Your continued use of the Service after revised Terms take effect constitutes acceptance only where that result is permitted by applicable law. If you do not agree to the revised Terms, you must stop using the Service.
        </p>
      </section>

      {/* 14. Contact and Inquiries */}
      <section id="section-14" className="scroll-mt-24">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          14. Contact and Inquiries
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          For questions about these Terms, acceptable use, or account-related concerns, contact the operator using the details below:
        </p>

        <div className="rounded-xl border border-[#DCDAD3] bg-white p-5 text-xs text-[#191B20] space-y-2 mb-4">
          <p>
            <strong>Responsible Operator:</strong> Talky.chat.com
          </p>
          <p>
            <strong>Location:</strong> India &middot; Gujarat &middot; 395002
          </p>
          <p>
            <strong>Legal Contact:</strong>{' '}
            <a href="mailto:helpdesk@talky.chat.com" className="text-[#2858E8] font-semibold hover:underline">
              helpdesk@talky.chat.com
            </a>
          </p>
          <p>
            <strong>Effective Date:</strong> 1/11/2026
          </p>
        </div>

        <div className="pt-4 border-t border-[#DCDAD3] text-[11px] text-[#51545C] italic">
          Publication note: This document is configured with temporary testing and development details (Talky.chat.com / helpdesk@talky.chat.com) during the pre-launch phase.
        </div>
      </section>
    </LegalLayout>
  );
};

export default TermsOfServicePage;
