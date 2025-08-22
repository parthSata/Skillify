import React, { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Download,
    BookOpen
} from 'lucide-react';

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    thumbnailUrl: string;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    title,
    thumbnailUrl,
    onProgress,
    onComplete
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isReady, setIsReady] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use a ref to store the latest onProgress and onComplete functions
    const onProgressRef = useRef(onProgress);
    const onCompleteRef = useRef(onComplete);

    // Update the ref whenever the props change
    useEffect(() => {
        onProgressRef.current = onProgress;
        onCompleteRef.current = onComplete;
    }, [onProgress, onComplete]);

    // Effect to handle video events and state updates
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => {
            setTotalDuration(video.duration);
            setIsReady(true);
            setIsBuffering(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                // Use the ref to call the latest onProgress function
                onProgressRef.current?.(progress);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            // Use the ref to call the latest onComplete function
            onCompleteRef.current?.();
            setShowControls(true);
        };

        const handleWaiting = () => {
            setIsBuffering(true);
        };

        const handlePlaying = () => {
            setIsBuffering(false);
        };

        const handlePause = () => {
            setIsPlaying(false);
            setShowControls(true);
        };

        const handlePlay = () => {
            setIsPlaying(true);
            setShowControls(true);
        };

        // Reset state on video URL change
        setIsPlaying(false);
        setCurrentTime(0);
        setTotalDuration(0);
        setIsReady(false);
        setIsBuffering(false);
        setShowControls(true);

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('pause', handlePause);
        video.addEventListener('play', handlePlay);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('play', handlePlay);
        };
    }, [videoUrl]); // Only depend on videoUrl to prevent infinite loop

    // Effect to hide controls after a delay when playing
    useEffect(() => {
        if (isPlaying && !isBuffering && showControls) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying, isBuffering, showControls]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video || !isReady) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch(err => console.error("Video play failed:", err));
        }
        setShowControls(true);
    };

    const handleMouseActivity = () => {
        if (!showControls) {
            setShowControls(true);
        }
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video || totalDuration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * totalDuration;

        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.volume = volume;
            setIsMuted(false);
        } else {
            video.volume = 0;
            setIsMuted(true);
        }
    };

    const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, totalDuration));
    };

    const changePlaybackRate = (rate: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement;
        if (!container) return;

        if (!isFullscreen) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="relative bg-black rounded-xl overflow-hidden shadow-2xl group"
            onMouseMove={handleMouseActivity}
            onMouseLeave={() => {
                if (isPlaying) {
                    controlsTimeoutRef.current = setTimeout(() => {
                        setShowControls(false);
                    }, 500);
                }
            }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video object-cover"
                onClick={togglePlay}
                poster={thumbnailUrl}
            />

            {/* Loading Overlay */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center  bg-opacity-70">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            )}

            {isReady && isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center  bg-opacity-70">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            )}

            {/* Play Button Overlay */}
            {isReady && !isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center  bg-opacity-30 transition-opacity duration-300">
                    <button
                        onClick={togglePlay}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 transform hover:scale-110 transition-all duration-300 shadow-2xl"
                    >
                        <Play className="w-12 h-12 text-gray-900 ml-1" />
                    </button>
                </div>
            )}

            {/* Video Title Overlay */}
            <div className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className=" bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-white" />
                        <h3 className="text-white font-semibold truncate">{title}</h3>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isReady && (
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${showControls || isBuffering ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div
                            className="w-full h-2 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-blue-500 rounded-full relative transition-all duration-200"
                                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                            >
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>

                            {/* Skip Buttons */}
                            <button
                                onClick={() => skip(-10)}
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => skip(10)}
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-blue-400 transition-colors duration-200"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm font-medium">
                                {formatTime(currentTime)} / {formatTime(totalDuration)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Settings */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="text-white hover:text-blue-400 transition-colors duration-200"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                {showSettings && (
                                    <div className="absolute bottom-8 right-0 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-3 min-w-32">
                                        <div className="text-white text-sm font-medium mb-2">Playback Speed</div>
                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                            <button
                                                key={rate}
                                                onClick={() => changePlaybackRate(rate)}
                                                className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors duration-200 ${playbackRate === rate
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                                                    }`}
                                            >
                                                {rate}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Download */}
                            <button className="text-white hover:text-blue-400 transition-colors duration-200">
                                <Download className="w-5 h-5" />
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-blue-400 transition-colors duration-200"
                            >
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;