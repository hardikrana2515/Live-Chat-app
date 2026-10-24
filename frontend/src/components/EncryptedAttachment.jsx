import { useState, useEffect, useRef } from 'react';
import { decryptFile } from '../utils/EncryptionUtils';
import AudioMessage from './AudioMessage'; // Reuse your audio player

const EncryptedAttachment = ({ url, type, alt, chatId }) => {
    const [attachment, setAttachment] = useState({ url: null, mimeType: '' });
    const [loading, setLoading] = useState(true);
    const blobUrlRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const processFile = async () => {
            const res = await decryptFile(url, chatId);
            const targetUrl = (res && typeof res === 'object') ? res.url : res;
            const targetMime = (res && typeof res === 'object') ? (res.mimeType || '') : '';

            if (isMounted) {
                blobUrlRef.current = (typeof targetUrl === 'string' && targetUrl.startsWith('blob:')) ? targetUrl : null;
                setAttachment({ url: targetUrl, mimeType: targetMime });
                setLoading(false);
            } else if (typeof targetUrl === 'string' && targetUrl.startsWith('blob:')) {
                URL.revokeObjectURL(targetUrl);
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

    const decryptedUrl = attachment.url;
    if (!decryptedUrl) return null;

    const mime = (attachment.mimeType || '').toLowerCase();
    const fileType = (type || '').toLowerCase();

    const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType);
    const isAudio = mime.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(fileType) ||
                    (fileType === 'webm' && (url.toLowerCase().includes('voice') || url.toLowerCase().includes('audio')));
    const isVideo = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(fileType);
    const isPdf = mime === 'application/pdf' || fileType === 'pdf';

    if (isAudio) {
        return (
            <AudioMessage src={decryptedUrl} />
        );
    } else if (isImage) {
        return (
            <div className="relative group overflow-hidden rounded-md max-w-full">
                <img
                    src={decryptedUrl}
                    alt={alt || "Encrypted Image"}
                    loading="lazy"
                    className="rounded-md max-w-full max-h-72 object-contain cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    onClick={() => window.open(decryptedUrl, '_blank')}
                />
            </div>
        );
    } else if (isVideo) {
        return (
            <video controls className="rounded-md max-w-full max-h-64">
                <source src={decryptedUrl} type={mime || `video/${fileType}`} />
                Your browser does not support the video tag.
            </video>
        );
    } else if (isPdf) {
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
                className="underline text-[var(--c-info)] flex items-center gap-2"
            >
                📁 Download File (Decrypted)
            </a>
        );
    }
};

export default EncryptedAttachment;
