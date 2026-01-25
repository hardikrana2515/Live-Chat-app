import { IoDocumentText, IoCamera, IoImage, IoPerson, IoMusicalNotes } from "react-icons/io5";
import { MdPoll } from "react-icons/md";

const AttachmentMenu = ({ onOptionClick }) => {
    const options = [
        { id: 'poll', label: 'Poll', icon: <MdPoll className="text-xl" />, color: 'bg-teal-500' },
        { id: 'contact', label: 'Contact', icon: <IoPerson className="text-xl" />, color: 'bg-blue-500' },
        { id: 'document', label: 'Document', icon: <IoDocumentText className="text-xl" />, color: 'bg-indigo-500' },
        { id: 'camera', label: 'Camera', icon: <IoCamera className="text-xl" />, color: 'bg-pink-500' },
        { id: 'gallery', label: 'Photos & Videos', icon: <IoImage className="text-xl" />, color: 'bg-purple-500' },
        { id: 'audio', label: 'Audio', icon: <IoMusicalNotes className="text-xl" />, color: 'bg-orange-500' },
    ];

    // Show in reverse order (bottom to top) to mimic WhatsApp stack
    return (
        <div className="absolute bottom-16 left-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-200 z-50">
            {options.map((opt) => (
                <div
                    key={opt.id}
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => onOptionClick(opt.id)}
                >
                    {/* Label (Tooltip style) */}
                    {/* <span className="bg-gray-700 text-white text-sm py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {opt.label}
                    </span> */}

                    {/* Icon Bubble */}
                    <div className={`${opt.color} p-3 rounded-full text-white shadow-lg hover:scale-110 transition-transform`}>
                        {opt.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AttachmentMenu;
