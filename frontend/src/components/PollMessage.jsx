import { useContext } from 'react';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import { decryptMessage } from '../utils/EncryptionUtils';
import { MdHowToVote } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";

const PollMessage = ({ message }) => {
    const { VotePoll } = useContext(messageContext);
    const { user } = useContext(chatContext);

    if (!message.poll) return null;

    // Poll question/option text is stored encrypted (Issue 3.2); resolve the
    // conversation's chat id to pick the right key.
    const chatId = message.chatId?._id ?? message.chatId ?? message.chat?._id ?? message.chat;
    const question = decryptMessage(message.poll.question, chatId);

    const totalVotes = message.poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

    const handleVote = (index) => {
        VotePoll(message._id, index);
    };

    return (
        <div className="bg-[var(--c-surface)] p-4 rounded-2xl w-64 sm:w-80 shadow-lg border border-[var(--c-line)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[var(--c-accent-20)] text-[var(--c-accent)] flex items-center justify-center shrink-0">
                    <MdHowToVote className="text-base" />
                </span>
                <span className="label-micro">Poll</span>
            </div>

            <h3 className="font-semibold text-[var(--c-text)] mb-3.5 text-sm sm:text-base leading-snug">
                {question}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-2">
                {message.poll.options.map((opt, idx) => {
                    const voteCount = opt.votes.length;
                    const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                    const hasVoted = opt.votes.some(v => v._id === user._id || v === user._id);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleVote(idx)}
                            className={`relative w-full overflow-hidden text-left rounded-xl border text-sm transition-all
                                ${hasVoted
                                    ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10'
                                    : 'border-[var(--c-line)] hover:border-[var(--c-accent)] hover:bg-[var(--c-hover)]'}
                            `}
                        >
                            {/* Vote fill bar */}
                            <div
                                className="absolute inset-y-0 left-0 bg-[var(--c-accent-20)] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />

                            {/* Option content */}
                            <div className="relative flex items-center gap-2.5 px-3 py-2.5">
                                {/* Selection indicator */}
                                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                                    ${hasVoted ? 'border-[var(--c-accent)] bg-[var(--c-accent)]' : 'border-[var(--c-text-3)]'}
                                `}>
                                    {hasVoted && <BsCheckCircleFill className="text-[9px] text-[var(--c-on-primary)]" />}
                                </span>

                                <span className={`flex-1 truncate text-xs sm:text-sm ${hasVoted ? 'text-[var(--c-text)] font-medium' : 'text-[var(--c-text)]'}`}>
                                    {decryptMessage(opt.text, chatId)}
                                </span>

                                <span className="text-[11px] font-semibold text-[var(--c-text-2)] shrink-0 tabular-nums">
                                    {totalVotes > 0 ? `${percentage}%` : ''}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-[var(--c-line-50)] flex items-center justify-between text-[11px] text-[var(--c-text-3)]">
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                <span className="font-medium">Tap to vote</span>
            </div>
        </div>
    );
};

export default PollMessage;
