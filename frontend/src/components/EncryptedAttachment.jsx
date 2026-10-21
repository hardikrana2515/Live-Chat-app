import { useState, useEffect, useRef } from 'react';
import { decryptFile } from '../utils/EncryptionUtils';
import AudioMessage from './AudioMessage'; // Reuse your audio player

const EncryptedAttachment = ({ url, type, alt, chatId }) => {
    const [decryptedUrl, setDecryptedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    // Track the blob URL in a ref: the cleanup closure would otherwise capture
    // the `decryptedUrl` state from the first render (always null) and
    // URL.revokeObjectURL would never run — leaking blob URLs into memory. (Issue 1.5)
    const blobUrlRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const processFile = async () => {
            // If local localhost url, we need to decrypt
            // If it's a blob (local preview), it might not need decryption if checked earlier, 
            // but here we assume 'url' is from server (http...) which is encrypted text file.
            const res = await decryptFile(url, chatId);
            if (isMounted) {
                blobUrlRef.current = (typeof res === 'string' && res.startsWith('blob:')) ? res : null;
                setDecryptedUrl(res);
                setLoading(false);
            } else if (typeof res === 'string' && res.startsWith('blob:')) {
                // Unmounted while decrypting (e.g. StrictMode double-invoke) —
                // revoke immediately so the blob never leaks.
                URL.revokeObjectURL(res);
            }
        };

        processFile();

        return () => {
            isMounted = false;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [url, chatId]);

    if (loading) return <div className="animate-pulse bg-[var(--c-raised)] h-32 w-32 rounded flex items-center justify-center text-xs text-[var(--c-text-2)]">Decrypting...</div>;

    if (!type) return null;

    const fileType = type.toLowerCase();

    const isAudio = ['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(fileType) ||
                    (fileType === 'webm' && (url.toLowerCase().includes('voice') || url.toLowerCase().includes('audio')));

    if (isAudio) {
        return (
            <AudioMessage src={decryptedUrl} />
        );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        return (
            <img
                src={decryptedUrl}
                alt={alt || "Encrypted Media"}
                loading="lazy"
                className="rounded-md max-w-full max-h-64 object-contain"
            />
        );
    } else if (['mp4', 'webm', 'mov', 'mkv'].includes(fileType)) {
        return (
            <video controls className="rounded-md max-w-full max-h-64">
                <source src={decryptedUrl} type={`video/${fileType}`} />
                Your browser does not support the video tag.
            </video>
        );
    } else if (fileType === 'pdf') {
        return (
            <a
                href={decryptedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[var(--c-info)] flex items-center gap-2"
            >
                📄 View PDF (Decrypted)
            </a>
        );
    } else {
        return (
            <a
                href={decryptedUrl}
                download
                className="underline text-[var(--c-info)]"
            >
                📁 Download File (Decrypted)
            </a>
        );
    }
};

export default EncryptedAttachment;
