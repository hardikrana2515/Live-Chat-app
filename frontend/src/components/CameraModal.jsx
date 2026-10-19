import { useRef, useEffect, useState } from 'react';
import { IoClose, IoCamera, IoSend, IoRefresh } from 'react-icons/io5';
import { toast } from 'react-toastify';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

    // Manage Camera Stream
    useEffect(() => {
        if (isOpen && !image) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, image]);

    const startCamera = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" } // Default to front/user, can add flip later if needed
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video stream
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            // Check for mirroring if using user facing mode if needed, but standard is fine for now
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/png');
            setImage(dataUrl);
            stopCamera(); // Stop stream after capture to save battery/resource
        }
    };

    const retake = () => {
        setImage(null);
        // Effect will restart camera
    };

    const handleSend = () => {
        if (image) {
            // Convert Base64 using fetch for better blob handling
            fetch(image)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `camera_${Date.now()}.png`, { type: "image/png" });
                    onCapture(file);
                });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-[var(--c-surface)]/50 rounded-full text-[var(--c-text)] hover:bg-[var(--c-raised)]/80 transition-colors z-10"
            >
                <IoClose className="text-2xl" />
            </button>

            <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col justify-center">
                {error ? (
                    <div className="text-center text-[var(--c-danger)] p-6">
                        <p>{error}</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-[var(--c-surface)] rounded-lg text-[var(--c-text)]">Close</button>
                    </div>
                ) : !image ? (
                    // Live Preview
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100" // Mirror effect for selfie feel
                        />
                        {/* Capture Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                            <button
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-[var(--c-surface)]/20 hover:bg-[var(--c-surface)]/40 transition-all active:scale-95"
                            >
                                <div className="w-12 h-12 bg-[var(--c-surface)] rounded-full"></div>
                            </button>
                        </div>
                    </>
                ) : (
                    // Captured Image Preview
                    <>
                        <img src={image} alt="Captured" className="w-full h-full object-contain" />

                        {/* Action Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                            <button
                                onClick={retake}
                                className="flex flex-col items-center gap-1 text-[var(--c-text)] hover:text-[var(--c-text)] transition-colors"
                            >
                                <div className="p-3 bg-[var(--c-raised)]/50 rounded-full backdrop-blur-sm">
                                    <IoRefresh className="text-2xl" />
                                </div>
                                <span className="text-xs font-medium">Retake</span>
                            </button>

                            <button
                                onClick={handleSend}
                                className="flex flex-col items-center gap-1 text-[var(--c-link)] hover:text-[var(--c-link)] transition-colors"
                            >
                                <div className="p-4 bg-[var(--c-primary)] rounded-full shadow-lg  backdrop-blur-sm transform hover:scale-105 transition-all">
                                    <IoSend className="text-2xl text-[var(--c-text)] ml-1" />
                                </div>
                                <span className="text-xs font-medium text-[var(--c-text)]">Send</span>
                            </button>
                        </div>
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default CameraModal;
