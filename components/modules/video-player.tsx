'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  onProgressUpdate?: (percentage: number) => void
  initialProgress?: number
  className?: string
}

export function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  onProgressUpdate, 
  initialProgress = 0,
  className 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(initialProgress)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Prevent SSR issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial time from progress
    if (initialProgress > 0 && duration > 0) {
      video.currentTime = (initialProgress / 100) * duration
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const newProgress = (video.currentTime / video.duration) * 100
      setProgress(newProgress)

      // Save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        onProgressUpdate?.(newProgress)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onProgressUpdate?.(100)
    }

    const handleError = () => {
      const error = video.error
      console.error('Video error:', error)
      console.log('Video URL:', videoUrl)
      setHasError(true)
      
      if (error) {
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            setErrorMessage('Video loading was aborted')
            break
          case 2: // MEDIA_ERR_NETWORK
            setErrorMessage('Network error while loading video')
            break
          case 3: // MEDIA_ERR_DECODE
            setErrorMessage('Video format not supported')
            break
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            setErrorMessage('Video source not supported. Check the URL or format.')
            break
          default:
            setErrorMessage('Unknown video error')
        }
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [duration, onProgressUpdate, videoUrl])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration
    videoRef.current.currentTime = newTime
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't render until mounted (prevent SSR issues)
  if (!isMounted) {
    return (
      <div className={cn('relative bg-black rounded-lg overflow-hidden shadow-2xl aspect-video flex items-center justify-center', className)}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/50">Loading video player...</div>
        )}
      </div>
    )
  }

  // Validate video URL
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <div className={cn('relative bg-rogue-slate/10 rounded-lg overflow-hidden aspect-video flex items-center justify-center', className)}>
        <p className="text-rogue-slate">No video URL provided</p>
      </div>
    )
  }

  // Show error if video failed to load
  if (hasError) {
    return (
      <div className={cn('relative bg-rogue-terracotta/10 border-2 border-rogue-terracotta/30 rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center p-8', className)}>
        <p className="text-rogue-terracotta font-semibold mb-2">⚠️ Video Error</p>
        <p className="text-rogue-slate text-sm mb-4">{errorMessage}</p>
        <p className="text-xs text-rogue-slate/70 font-mono bg-rogue-cream px-3 py-1 rounded">
          {videoUrl}
        </p>
        <button
          onClick={() => {
            setHasError(false)
            setErrorMessage('')
          }}
          className="mt-4 text-sm text-rogue-forest hover:text-rogue-pine underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div 
      className={cn('relative group bg-black rounded-lg overflow-hidden shadow-2xl', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full aspect-video object-contain"
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Play Overlay (when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-rogue-gold rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="h-10 w-10 text-rogue-forest ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div 
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group/progress relative"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-rogue-forest to-rogue-gold rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rogue-gold rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-rogue-gold transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Skip buttons */}
          <button
            onClick={() => skip(-10)}
            className="text-white hover:text-rogue-gold transition-colors"
            title="Back 10s"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => skip(10)}
            className="text-white hover:text-rogue-gold transition-colors"
            title="Forward 10s"
          >
            <SkipForward size={20} />
          </button>

          {/* Time */}
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={toggleMute}
              className="text-white hover:text-rogue-gold transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rogue-gold"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-rogue-gold transition-colors"
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {/* Progress Ring (top right) */}
      {progress > 0 && progress < 100 && (
        <div className="absolute top-4 right-4 bg-rogue-forest/90 rounded-full p-2 backdrop-blur-sm">
          <div className="relative w-8 h-8">
            <svg className="transform -rotate-90" width="32" height="32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-rogue-gold">
              {Math.round(progress)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

