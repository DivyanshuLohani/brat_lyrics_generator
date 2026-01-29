
import { useState, useRef, useEffect } from "react";

interface BratVideoPlayerProps {
    src: string;
    className?: string;
}

export default function BratVideoPlayer({ src, className = "" }: BratVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Initial Play
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, [src]);

    // Sync volume
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
        if (videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        videoRef.current.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <div className={`relative group font-mono border-2 border-black inline-block bg-black ${className}`}>
            <video
                ref={videoRef}
                src={src}
                className="block max-h-[70vh] w-auto max-w-full cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 border-t border-white/20`}>

                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-500 rounded-none appearance-none cursor-pointer accent-[#8ace00]"
                />

                <div className="flex justify-between items-center text-white">
                    <div className="flex gap-4 items-center">
                        <button onClick={togglePlay} className="hover:text-[#8ace00] font-bold text-xl min-w-6">
                            {isPlaying ? "||" : "▶"}
                        </button>

                        <span className="text-xs">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1 group/vol">
                            <button onClick={() => {
                                if (!videoRef.current) return;
                                const newMuted = !isMuted;
                                setIsMuted(newMuted);
                                videoRef.current.muted = newMuted;
                            }} className="hover:text-[#8ace00] text-xs font-bold">
                                {isMuted ? "MUTE" : "VOL"}
                            </button>
                            <input
                                type="range" min="0" max="1" step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    if (!videoRef.current) return;
                                    const v = parseFloat(e.target.value);
                                    setVolume(v);
                                    videoRef.current.volume = v;
                                    setIsMuted(v === 0);
                                }}
                                className="w-16 h-1 accent-white"
                            />
                        </div>
                        <button onClick={toggleFullscreen} className="hover:text-[#8ace00] font-bold text-xs">
                            [FS]
                        </button>
                    </div>
                </div>
            </div>

            {/* Play/Pause Overlay Icon for better UX */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 p-4 rounded-full border-2 border-white backdrop-blur-sm">
                        <span className="text-white text-4xl">▶</span>
                    </div>
                </div>
            )}
        </div>
    );
}
