import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { FiEdit2, FiCheck } from "react-icons/fi";
import { decryptMessage } from '../utils/EncryptionUtils';

const EditMessageModal = ({ message, onClose, onSave }) => {
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (message && message.message) {
            // chatId selects the E2EE key for this message's conversation
            const chatId = message.chatId?._id ?? message.chatId ?? message.chat?._id ?? message.chat;
            setText(decryptMessage(message.message, chatId));
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
        <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--c-panel)] border border-[var(--c-line)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--c-line)] bg-[var(--c-panel-80)]">
                    <div className="flex items-center gap-2 text-[var(--c-text)] font-semibold text-base">
                        <div className="p-2 rounded-xl bg-[var(--c-primary-soft)] text-[var(--c-link)]">
                            <FiEdit2 className="text-base" />
                        </div>
                        <span>Edit Message</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--c-text-2)] hover:text-[var(--c-text)] p-1.5 rounded-lg hover:bg-[var(--c-surface)] transition"
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
                            className="w-full p-3 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-xs sm:text-sm text-[var(--c-text)]  focus:outline-none focus:border-[var(--c-primary)] transition resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--c-text-2)]">
                        <span>Press <b>Enter</b> to save, <b>Shift + Enter</b> for new line</span>
                        <span>{text.length} chars</span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--c-line-50)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-[var(--c-text-2)] hover:text-[var(--c-text)] rounded-xl hover:bg-[var(--c-surface)] transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !text.trim()}
                            className="px-5 py-2 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] disabled:opacity-50 text-[var(--c-text)] font-semibold text-xs rounded-xl shadow-md  transition flex items-center gap-1.5"
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
