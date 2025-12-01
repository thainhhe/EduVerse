import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { getStreamUrl } from "@services/minio";

const VideoPlayer = ({ file, onClose, canClose = true }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            // Optional: Auto-play when switching videos if desired, or keep paused.
            // video.play().catch(() => {});
            // setPlaying(true);
        };
        const handleEnded = () => setPlaying(false);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("ended", handleEnded);

        // Reset only track-specific state
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        // Do NOT reset volume/muted here to persist user preference

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("ended", handleEnded);
        };
    }, [file]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (playing) {
            video.pause();
        } else {
            video.play();
        }
        setPlaying(!playing);
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * duration;
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const toggleMute = () => {
        videoRef.current.muted = !muted;
        setMuted(!muted);
    };

    const toggleFullscreen = () => {
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="relative w-full h-full bg-black group">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={getStreamUrl(file._id)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
            />

            {/* Center Play Button Overlay */}
            {!playing && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all transform hover:scale-110">
                        <Play size={48} className="text-white fill-white" />
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div
                    className="relative w-full h-1.5 bg-gray-600 rounded-full cursor-pointer mb-4 group/progress"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-indigo-400 transition">
                            {playing ? (
                                <Pause size={24} className="fill-current" />
                            ) : (
                                <Play size={24} className="fill-current" />
                            )}
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="hover:text-indigo-400 transition">
                                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-24 h-1 accent-indigo-600 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {canClose && (
                            <button
                                onClick={onClose}
                                className="hover:text-red-400 transition"
                                title="Close Player"
                            >
                                <X size={20} />
                            </button>
                        )}
                        <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
