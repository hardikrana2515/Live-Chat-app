import { useContext } from 'react';
import messageContext from '../contexts/MessageContext/messageContext';
import chatContext from '../contexts/ChatContext/chatcontext';
import { MdPoll } from "react-icons/md";

const PollMessage = ({ message }) => {
    const { VotePoll } = useContext(messageContext);
    const { user } = useContext(chatContext);

    if (!message.poll) return null;

    const totalVotes = message.poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

    const handleVote = (index) => {
        VotePoll(message._id, index);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl w-64 sm:w-80 shadow-lg border border-gray-700">
            <h3 className="font-bold text-white mb-3 flex items-start gap-2">
                <MdPoll className="text-fuchsia-400 text-xl mt-1 shrink-0" />
                {message.poll.question}
            </h3>

            <div className="flex flex-col gap-2">
                {message.poll.options.map((opt, idx) => {
                    const voteCount = opt.votes.length;
                    const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                    const hasVoted = opt.votes.some(v => v._id === user._id || v === user._id);

                    return (
                        <div key={idx} className="relative">
                            {/* Vote Bar Background */}
                            <div
                                className="absolute top-0 left-0 h-full bg-fuchsia-900/40 rounded-lg transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />

                            {/* Option Content */}
                            <button
                                onClick={() => handleVote(idx)}
                                className={`relative w-full text-left p-2 rounded-lg border z-10 flex justify-between items-center transition-colors
                                    ${hasVoted ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                                `}
                            >
                                <span className="truncate flex-1">{opt.text}</span>
                                <span className="text-xs font-mono ml-2">{voteCount}</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 text-right text-xs text-gray-500">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default PollMessage;
