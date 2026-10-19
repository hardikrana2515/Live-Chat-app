import { IoDocumentText, IoCamera, IoImage, IoPerson, IoMusicalNotes } from "react-icons/io5";
import { MdPoll } from "react-icons/md";

const AttachmentMenu = ({ onOptionClick }) => {
    // Each option gets its own hue (tinted circle + colored icon) so they are
    // instantly distinguishable and stay high-contrast in both themes.
    const options = [
        { id: 'document', label: 'Document', icon: <IoDocumentText className="text-lg" />, color: 'bg-[var(--c-primary)]/15 text-[var(--c-primary)] ring-1 ring-inset ring-[var(--c-primary)]/30' },
        { id: 'gallery', label: 'Photos & Videos', icon: <IoImage className="text-lg" />, color: 'bg-[var(--c-accent)]/15 text-[var(--c-accent)] ring-1 ring-inset ring-[var(--c-accent)]/30' },
        { id: 'camera', label: 'Camera', icon: <IoCamera className="text-lg" />, color: 'bg-[var(--c-danger)]/15 text-[var(--c-danger)] ring-1 ring-inset ring-[var(--c-danger)]/30' },
        { id: 'audio', label: 'Audio', icon: <IoMusicalNotes className="text-lg" />, color: 'bg-[var(--c-info)]/15 text-[var(--c-info)] ring-1 ring-inset ring-[var(--c-info)]/30' },
        { id: 'poll', label: 'Poll', icon: <MdPoll className="text-lg" />, color: 'bg-[var(--c-warning)]/15 text-[var(--c-warning)] ring-1 ring-inset ring-[var(--c-warning)]/30' },
        { id: 'contact', label: 'Contact', icon: <IoPerson className="text-lg" />, color: 'bg-[var(--c-online)]/15 text-[var(--c-online)] ring-1 ring-inset ring-[var(--c-online)]/30' },
    ];

    // WhatsApp-style popup: a themed panel anchored above the paperclip,
    // opening leftward (right-aligned) so it never overflows the screen.
    return (
        <div className="absolute bottom-14 right-0 z-50 w-56 p-2 rounded-2xl border border-[var(--c-line)] bg-[var(--c-panel)] shadow-2xl animate-fadeIn overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--c-text-3)] px-3 pt-1 pb-1.5">
                Share
            </p>
            {options.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onOptionClick(opt.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--c-hover)] focus:outline-none focus:bg-[var(--c-hover)] transition-colors text-left"
                >
                    <span className={`${opt.color} p-2 rounded-full shrink-0`}>
                        {opt.icon}
                    </span>
                    <span className="text-sm font-medium text-[var(--c-text)] truncate">
                        {opt.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default AttachmentMenu;
