import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { FiEdit2, FiCheck } from "react-icons/fi";
import { decryptMessage } from '../utils/EncryptionUtils';

const EditMessageModal = ({ message, onClose, onSave }) => {
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (message && message.message) {
            setText(decryptMessage(message.message));
        } else {
            setText('');
        }
    }, [message]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }
        setSaving(true);
        try {
            await onSave(trimmed);
            onClose();
        } catch (err) {
            console.error("Save edit failed", err);
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-2 text-white font-semibold text-base">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <FiEdit2 className="text-base" />
                        </div>
                        <span>Edit Message</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                    >
                        <IoCloseSharp className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-4 space-y-3">
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={4}
                            autoFocus
                            placeholder="Type your updated message..."
                            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Press <b>Enter</b> to save, <b>Shift + Enter</b> for new line</span>
                        <span>{text.length} chars</span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !text.trim()}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                        >
                            {saving ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <FiCheck className="text-sm" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMessageModal;
