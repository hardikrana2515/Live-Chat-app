import React from 'react';
import LegalLayout from '../components/legal/LegalLayout';

const TOC_ITEMS = [
  { id: 'section-1', label: '1. Who We Are' },
  { id: 'section-2', label: '2. Information We Collect' },
  { id: 'section-3', label: '3. How We Use Information' },
  { id: 'section-4', label: '4. Message Privacy and Encryption' },
  { id: 'section-5', label: '5. Files and Media Protection' },
  { id: 'section-6', label: '6. Voice and Video Calling' },
  { id: 'section-7', label: '7. Cookies, Browser Storage & Device Info' },
  { id: 'section-8', label: '8. Passwords and Account Security' },
  { id: 'section-9', label: '9. How We Share Information' },
  { id: 'section-10', label: '10. Data Retention and Deletion' },
  { id: 'section-11', label: '11. Your Choices and Privacy Rights' },
  { id: 'section-12', label: "12. Children's Privacy" },
  { id: 'section-13', label: '13. International Processing' },
  { id: 'section-14', label: '14. Changes to This Privacy Policy' },
  { id: 'section-15', label: '15. Contact Us' }
];

/**
 * Talkyy Privacy Policy Page
 *
 * Official privacy policy incorporating testing & development configuration details:
 * - Publication date: 1/11/2026
 * - Legal entity: Talky.chat.com
 * - Verified privacy contact email: helpdesk@talky.chat.com
 * - Location: India · Gujarat · 395002
 */
const PrivacyPolicyPage = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="This Privacy Policy explains what personal information we collect, how we use and protect it, when information may be shared, and what choices you have when using Talkyy."
      effectiveDate="1/11/2026"
      alertTitle="Testing & Development Period Configuration"
      alertContent="These operating and contact details (Talky.chat.com / helpdesk@talky.chat.com) are temporarily configured for the active testing and development period."
      tocItems={TOC_ITEMS}
    >
      <div className="mb-8 text-xs text-[#51545C]">
        <p className="mb-2">
          <strong>Last updated:</strong> 1/11/2026
        </p>
        <p className="leading-relaxed">
          Talkyy (“Talkyy,” “we,” “our,” or “us”) provides a browser-based communication service for private messaging, group conversations, message interactions, and voice and video calls.
        </p>
        <p className="mt-2 leading-relaxed">
          We aim to handle personal information responsibly and explain our practices clearly. This policy should be read alongside our Terms of Service.
        </p>
      </div>

      {/* 1. Who We Are */}
      <section id="section-1" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          1. Who We Are
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          Talkyy is operated from Gujarat, India.
        </p>

        <div className="rounded-xl border border-[#DCDAD3] bg-white p-5 text-xs text-[#191B20] space-y-2 mb-4">
          <p>
            <strong>Responsible operator:</strong> Talky.chat.com
          </p>
          <p>
            <strong>Location:</strong> India &middot; Gujarat &middot; 395002
          </p>
          <p>
            <strong>Privacy contact:</strong>{' '}
            <a href="mailto:helpdesk@talky.chat.com" className="text-[#2858E8] font-medium hover:underline">
              helpdesk@talky.chat.com
            </a>
          </p>
        </div>

        <p className="text-xs text-[#51545C] leading-relaxed">
          The responsible operator is accountable for responding to privacy-related questions and requests concerning the service.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section id="section-2" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          2. Information We Collect
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          The information we process depends on how you use Talkyy and which features you access.
        </p>

        <div className="space-y-5">
          {/* 2.1 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.1 Account and profile information
            </h3>
            <p className="text-xs text-[#51545C] mb-2 leading-relaxed">
              When you create or manage an account, Talkyy may process:
            </p>
            <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1 mb-3">
              <li><strong>Display name and username</strong> to identify your profile and help other users find or recognize you.</li>
              <li><strong>Email address</strong> to identify your account, support authentication, and facilitate password recovery.</li>
              <li><strong>Phone number</strong> where required by the account registration process or provided as part of your profile.</li>
              <li><strong>Gender information</strong> where requested during registration or used for profile preferences.</li>
              <li><strong>Profile image or avatar</strong> that you upload or select.</li>
              <li><strong>Authentication information</strong>, including password hashes and session-related information used to authenticate your account.</li>
            </ul>
            <p className="text-xs text-[#51545C] leading-relaxed border-t border-[#DCDAD3]/60 pt-2">
              Passwords are intended to be stored as one-way bcrypt hashes rather than plaintext passwords. Authentication credentials and session information are handled to support account security and access to the service.
            </p>
          </div>

          {/* 2.2 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.2 Contacts and social connections
            </h3>
            <p className="text-xs text-[#51545C] mb-2 leading-relaxed">
              When you use Talkyy's social features, we process information associated with:
            </p>
            <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1 mb-3">
              <li>Friend requests and their status.</li>
              <li>Accepted connections and contact relationships.</li>
              <li>User identifiers associated with blocked accounts.</li>
              <li>Group membership and participant roles.</li>
            </ul>
            <p className="text-xs text-[#51545C] leading-relaxed border-t border-[#DCDAD3]/60 pt-2">
              We use this information to maintain connections, deliver conversations to the appropriate participants, enforce blocking preferences, and support group functionality.
            </p>
          </div>

          {/* 2.3 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.3 Messages and conversation activity
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              When you use Talkyy, the service processes information needed to send and manage conversations, including message content or encrypted message payloads, sender and conversation identifiers, timestamps, delivery and read status, reactions, edits, and deletion indicators.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Group conversations may also involve polls, voting records, participant information, and other interaction data associated with the features you use.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              The exact information processed depends on the type of message and the features enabled in your conversation.
            </p>
          </div>

          {/* 2.4 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.4 Presence and activity information
            </h3>
            <p className="text-xs text-[#51545C] mb-2 leading-relaxed">
              Talkyy may process operational information such as:
            </p>
            <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1 mb-3">
              <li>Online or offline presence.</li>
              <li>Last-seen or connection-related timestamps.</li>
              <li>Account creation and profile update timestamps.</li>
              <li>Message delivery and read events.</li>
            </ul>
            <p className="text-xs text-[#51545C] leading-relaxed border-t border-[#DCDAD3]/60 pt-2">
              This information helps Talkyy display activity status, synchronize conversations, and provide real-time communication features.
            </p>
          </div>

          {/* 2.5 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.5 Files, media, and voice notes
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              When you share images, documents, videos, audio recordings, or other supported attachments, Talkyy processes the associated files and information needed to upload, reference, deliver, and display them.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Depending on the feature and its implementation, this may include file references, media metadata, encrypted file data, and audio visualization data generated in your browser.
            </p>
          </div>

          {/* 2.6 */}
          <div className="rounded-lg bg-white p-4 border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              2.6 Voice and video calls
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              When you use voice or video calling, your browser processes audio and, where enabled, video from your selected devices.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Talkyy also processes signaling and connection information needed to establish and maintain calls. Depending on the connection, this may include session descriptions, network connection candidates, participant identifiers, and call-related events.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Your browser may request microphone or camera permission when you initiate or accept a call.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How We Use Information */}
      <section id="section-3" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          3. How We Use Information
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We use information for the following purposes:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-2 mb-4">
          <li><strong>Providing the service:</strong> creating accounts, authenticating users, and enabling access to Talkyy.</li>
          <li><strong>Delivering communications:</strong> routing messages, synchronizing conversations, and supporting delivery and read receipts.</li>
          <li><strong>Supporting social features:</strong> managing friend requests, blocked users, group membership, reactions, polls, and other interactions.</li>
          <li><strong>Enabling calls:</strong> establishing call connections and relaying the signaling information required for voice and video communication.</li>
          <li><strong>Maintaining security:</strong> protecting accounts, enforcing access controls, limiting abusive requests, and investigating suspected misuse.</li>
          <li><strong>Supporting recovery:</strong> facilitating password resets and account-related assistance.</li>
          <li><strong>Maintaining the service:</strong> diagnosing errors, addressing technical problems, and improving reliability.</li>
          <li><strong>Meeting applicable obligations:</strong> responding to valid legal requirements and handling privacy requests.</li>
        </ul>
        <p className="text-xs text-[#51545C] leading-relaxed">
          We do not intend to use personal information for purposes unrelated to the service without an appropriate basis and, where required, additional notice or consent.
        </p>
      </section>

      {/* 4. Message Privacy and Encryption */}
      <section id="section-4" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          4. Message Privacy and Encryption
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          Talkyy is designed to protect message content through client-side encryption. The following description reflects the application's intended and reported implementation and must remain consistent with the deployed code.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              4.1 Message content
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              The application encrypts supported text messages in the browser before they are transmitted. For one-to-one conversations, the application uses device-side key agreement to establish conversation encryption keys. Group conversations use a group-key mechanism to support communication among authorized participants.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Where these mechanisms operate as intended, the server receives and stores encrypted message content rather than readable message text.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Encryption does not eliminate every privacy risk. The security of a conversation also depends on key management, the devices and browsers used by participants, and the implementation of the complete communication flow.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              4.2 Conversation information
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Even when message content is encrypted, Talkyy needs certain operational information to deliver messages and maintain conversations.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              This may include sender identifiers, conversation or room identifiers, timestamps, delivery and read status, reactions, poll data, and group membership information.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              We distinguish this operational information from encrypted message content. Encryption of content does not necessarily encrypt all associated metadata.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              4.3 Group conversations
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Group conversations require information about membership and participation to route messages to the appropriate group.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              The application uses a group-key mechanism to support encrypted group messaging. The actual protection available to current and former members depends on the deployed key-management and membership-update behavior.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-2">
              4.4 Limits of encryption
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Encryption cannot protect information after it has been exposed on a compromised or unlocked device. Recipients may also copy, screenshot, record, or share content they can access.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              We do not represent encryption as a guarantee against every form of unauthorized access, metadata exposure, or device compromise.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Files and Media Protection */}
      <section id="section-5" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          5. Files and Media Protection
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy supports file and media sharing through the features available in the application.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Where client-side attachment encryption is implemented, supported files are encrypted before upload and stored in encrypted form. Authorized recipients use the relevant client-side mechanisms to access the content.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          The protection applied may depend on the attachment type and the feature used. Users should not assume that every file, thumbnail, filename, preview, or associated piece of metadata is encrypted unless the relevant implementation confirms it.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          Media may be stored on infrastructure used to operate Talkyy. The exact storage providers, access controls, and retention periods must be confirmed before this policy is published.
        </p>
      </section>

      {/* 6. Voice and Video Calling */}
      <section id="section-6" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          6. Voice and Video Calling
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy uses browser-based calling technology to establish voice and video connections.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Call setup relies on signaling information exchanged through the service. Audio and video may travel directly between participants when network conditions permit, or through intermediary network infrastructure when required by the connection.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          The application is designed to establish calls without recording call audio or video on Talkyy's servers. This statement must be confirmed against the deployed call architecture and any infrastructure used to relay media.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          This policy does not promise that calls are immune to interception, device compromise, participant recording, or every network-level privacy risk.
        </p>
      </section>

      {/* 7. Cookies, Browser Storage, and Device Information */}
      <section id="section-7" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          7. Cookies, Browser Storage, and Device Information
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy uses browser storage and session mechanisms to support authentication, preferences, and client-side features.
        </p>
        <p className="mb-2 text-[#51545C] leading-relaxed">
          Depending on the deployed version, these may include:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1.5 mb-4">
          <li><strong>Local or session storage</strong> for session information and application preferences.</li>
          <li><strong>Cookies</strong> for authentication or session management, where configured.</li>
          <li><strong>Browser-based key storage</strong> for cryptographic material used by the application.</li>
          <li><strong>Temporary browser memory</strong> for message processing, media handling, and other interactive features.</li>
        </ul>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          The exact storage mechanism for authentication tokens and private keys depends on the deployed implementation. Browser storage is not equivalent to a dedicated hardware security boundary and may be accessible to malicious code running in the same browser context.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Clearing browser data, using private browsing, changing devices, or losing local key material may affect access to previously encrypted conversations. Recovery may not be possible if the required keys are unavailable.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          You should protect your devices, keep your browser updated, and avoid using shared or untrusted devices for sensitive conversations.
        </p>
      </section>

      {/* 8. Passwords and Account Security */}
      <section id="section-8" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          8. Passwords and Account Security
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy uses authentication mechanisms to help prevent unauthorized account access.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          The application is designed to store passwords as bcrypt hashes and may use time-limited password-reset tokens to support account recovery. Other security measures may include request rate limiting and access controls.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          No online service can guarantee absolute security. You are responsible for keeping your login credentials private, protecting devices used to access Talkyy, and notifying the operator if you suspect unauthorized access to your account.
        </p>
      </section>

      {/* 9. How We Share Information */}
      <section id="section-9" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          9. How We Share Information
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          Talkyy does not sell personal information as a business model. Information may be processed or disclosed in the following circumstances, where applicable:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              9.1 Service providers
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Hosting, database, storage, email delivery, and other infrastructure providers may process information as necessary to operate the service.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              The information available to each provider depends on the services it supplies and the data transmitted to it.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              9.2 Other participants
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Information you send to another user or group is made available to the intended recipients according to the features you use. Recipients may retain or redistribute information they can access.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              9.3 Legal and safety requirements
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              We may disclose information where reasonably necessary to comply with applicable law, respond to valid legal process, protect users, investigate abuse, or safeguard the rights and security of the service, subject to applicable legal requirements.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              9.4 Business changes
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              If Talkyy undergoes a merger, acquisition, restructuring, or transfer of operations, information may be handled as part of that transaction, subject to applicable law and appropriate safeguards.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              9.5 No advertising sale
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Talkyy is not intended to sell personal information to advertisers or data brokers. Any analytics, advertising, or third-party tracking technologies introduced in the future should be reflected in an updated policy before use.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Data Retention and Deletion */}
      <section id="section-10" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          10. Data Retention and Deletion
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          We retain information for as long as necessary to provide the service, maintain account and conversation functionality, meet applicable obligations, resolve disputes, and protect the service. Actual retention periods depend on the type of information and the feature involved.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              10.1 Editing messages
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Where message editing is supported, an edited message may replace its earlier content in the application's stored record. The service may retain an edit indicator or modification timestamp. Editing a message does not necessarily remove copies that recipients previously viewed, downloaded, or captured.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              10.2 Delete for everyone
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              Talkyy supports a message deletion feature subject to the application's current eligibility rules, including a reported one-hour limit.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed mb-2">
              When deletion is processed, the application may mark the message as deleted and remove associated content or references from the relevant database record. The exact effect depends on the message type and the deployed deletion flow.
            </p>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Deletion from a database record does not, by itself, establish that every copy has been erased from backups, logs, recipients' devices, downloaded files, or other systems.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              10.3 Delete for me
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Where available, this feature hides a message from the requesting user's conversation view. It does not necessarily delete the message for other participants.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#DCDAD3]">
            <h3 className="font-display text-sm font-bold text-[#191B20] mb-1">
              10.4 Account deletion and backups
            </h3>
            <p className="text-xs text-[#51545C] leading-relaxed">
              Do not assume that deleting an account automatically removes all associated messages, group records, logs, backups, or information retained for legitimate operational or legal purposes.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Your Choices and Privacy Rights */}
      <section id="section-11" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          11. Your Choices and Privacy Rights
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Depending on the features available and the laws that apply to you, you may be able to:
        </p>
        <ul className="list-disc list-inside text-xs text-[#51545C] space-y-1.5 mb-4">
          <li>Update your display name and profile image.</li>
          <li>Manage connections and block specific users.</li>
          <li>Leave group conversations or manage groups where you have the required permissions.</li>
          <li>Request access to, correction of, or deletion of personal information, subject to applicable law.</li>
          <li>Withdraw consent where consent is the applicable basis for processing.</li>
          <li>Raise a concern about how your information is handled.</li>
        </ul>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          To submit a privacy request, contact{' '}
          <a href="mailto:helpdesk@talky.chat.com" className="text-[#2858E8] font-semibold hover:underline">
            helpdesk@talky.chat.com
          </a>{' '}
          and provide enough information for the operator to identify your account and understand your request. Avoid sending passwords, private cryptographic keys, or other unnecessary sensitive information.
        </p>
        <p className="text-xs text-[#51545C] leading-relaxed">
          We will review and respond to requests in accordance with applicable law. Some information may need to be retained where legally permitted or required, or where deletion would affect other users' records or the operation of the service.
        </p>
      </section>

      {/* 12. Children's Privacy */}
      <section id="section-12" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          12. Children's Privacy
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          Talkyy is not represented by this policy as a service specifically designed for children.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          The minimum age for using Talkyy and any parental-consent requirements must be established in the Terms of Service and implemented consistently with applicable law. If we learn that personal information has been collected in circumstances that violate applicable requirements, we will assess and take appropriate action.
        </p>
      </section>

      {/* 13. International Processing */}
      <section id="section-13" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          13. International Processing
        </h2>
        <p className="text-[#51545C] leading-relaxed">
          Depending on the infrastructure and service providers used, information may be processed or stored in locations outside the region where you access Talkyy.
        </p>
      </section>

      {/* 14. Changes to This Privacy Policy */}
      <section id="section-14" className="scroll-mt-24 mb-10 pb-8 border-b border-[#DCDAD3]">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          14. Changes to This Privacy Policy
        </h2>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          We may update this Privacy Policy as Talkyy's features, data practices, or legal obligations change.
        </p>
        <p className="mb-3 text-[#51545C] leading-relaxed">
          The updated version will be published on this page with a revised “Last updated” date. Where applicable law requires additional notice or consent for a material change, we will follow the relevant requirements.
        </p>
        <p className="text-[#51545C] leading-relaxed">
          We encourage users to review this page periodically to understand how information is handled.
        </p>
      </section>

      {/* 15. Contact Us */}
      <section id="section-15" className="scroll-mt-24">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#191B20] mb-3">
          15. Contact Us
        </h2>
        <p className="mb-4 text-[#51545C] leading-relaxed">
          For privacy questions, requests concerning personal information, or complaints about data handling, contact the operator using the details below:
        </p>

        <div className="rounded-xl border border-[#DCDAD3] bg-white p-5 text-xs text-[#191B20] space-y-2 mb-4">
          <p>
            <strong>Service:</strong> Talkyy
          </p>
          <p>
            <strong>Responsible operator:</strong> Talky.chat.com
          </p>
          <p>
            <strong>Location:</strong> India &middot; Gujarat &middot; 395002
          </p>
          <p>
            <strong>Privacy contact:</strong>{' '}
            <a href="mailto:helpdesk@talky.chat.com" className="text-[#2858E8] font-semibold hover:underline">
              helpdesk@talky.chat.com
            </a>
          </p>
        </div>

        <p className="text-xs text-[#51545C] leading-relaxed">
          Please do not send passwords, private keys, authentication tokens, or message contents unless they are genuinely necessary to resolve your request.
        </p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
