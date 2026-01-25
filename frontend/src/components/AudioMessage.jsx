import React, { useState, useRef, useEffect } from 'react';
import { IoPlay, IoPause } from 'react-icons/io5';

const AudioMessage = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            const current = audio.currentTime;
            const total = audio.duration;
            setProgress((current / total) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/40 min-w-[200px]">
            <button
                onClick={togglePlay}
                className="p-2 bg-fuchsia-600 rounded-full hover:bg-fuchsia-700 transition"
            >
                {isPlaying ? <IoPause className="text-white" /> : <IoPlay className="text-white pl-0.5" />}
            </button>

            <div className="flex flex-col flex-1 gap-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => {
                        const time = (e.target.value / 100) * audioRef.current.duration;
                        audioRef.current.currentTime = time;
                        setProgress(e.target.value);
                    }}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
                <div className="flex justify-between text-[10px] text-gray-300">
                    <span>{formatTime(audioRef.current?.currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <audio ref={audioRef} src={src} className="hidden" />
        </div>
    );
};

export default AudioMessage;
