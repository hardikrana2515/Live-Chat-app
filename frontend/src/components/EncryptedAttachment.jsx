import { useState, useEffect } from 'react';
import { decryptFile } from '../utils/EncryptionUtils';
import AudioMessage from './AudioMessage'; // Reuse your audio player

const EncryptedAttachment = ({ url, type, alt }) => {
    const [decryptedUrl, setDecryptedUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const processFile = async () => {
            // If local localhost url, we need to decrypt
            // If it's a blob (local preview), it might not need decryption if checked earlier, 
            // but here we assume 'url' is from server (http...) which is encrypted text file.
            const res = await decryptFile(url);
            if (isMounted) {
                setDecryptedUrl(res);
                setLoading(false);
            }
        };

        processFile();

        return () => {
            isMounted = false;
            // Cleanup object URL if created
            if (decryptedUrl && decryptedUrl.startsWith('blob:')) {
                URL.revokeObjectURL(decryptedUrl);
            }
        };
    }, [url]);

    if (loading) return <div className="animate-pulse bg-gray-700 h-32 w-32 rounded flex items-center justify-center text-xs text-gray-400">Decrypting...</div>;

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
                className="underline text-blue-300 flex items-center gap-2"
            >
                📄 View PDF (Decrypted)
            </a>
        );
    } else {
        return (
            <a
                href={decryptedUrl}
                download
                className="underline text-blue-300"
            >
                📁 Download File (Decrypted)
            </a>
        );
    }
};

export default EncryptedAttachment;
