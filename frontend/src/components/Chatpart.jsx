import { useContext } from 'react';
import Chatbox from './Chatbox';
import chatContext from '../contexts/ChatContext/chatcontext';
import { FiArrowUpRight, FiLock, FiMessageCircle } from 'react-icons/fi';

const Chatpart = ({ onStartCall }) => {
  const { selectedchat } = useContext(chatContext);

  if (selectedchat) {
    return (
      <div className="flex-1 h-full w-full overflow-hidden bg-[var(--c-canvas)]">
        <Chatbox onStartCall={onStartCall} />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full w-full overflow-hidden bg-[var(--c-canvas)] flex items-center justify-center relative">
      {/* Soft brand glow, theme aware */}
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[var(--c-primary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[var(--c-accent-10)] blur-3xl" />

      <section className="relative w-full max-w-md px-7 text-center sm:px-14 animate-fadeIn">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--c-primary-soft)] text-[var(--c-link)] avatar-ring">
            <FiMessageCircle className="text-2xl" />
          </span>
          <span className="label-micro">Pick up where you left off</span>
        </div>

        <h2 className="mx-auto max-w-md text-3xl font-semibold tracking-tight text-[var(--c-text)] sm:text-4xl sm:leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
          A good chat starts with someone worth talking to.
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[var(--c-text-2)] sm:text-base">
          Search for a person, open a recent conversation, or gather your crew into a group. The rest stays out of your way.
        </p>

        <div className="mt-10 border-t border-[var(--c-line-50)] pt-4">
          <div className="flex items-center justify-between text-xs text-[var(--c-text-3)]">
            <span className="flex items-center gap-2"><FiLock className="text-[var(--c-online)]" /> Private messages are protected in transit</span>
            <FiArrowUpRight className="text-[var(--c-link)]" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chatpart;
