import React, { useEffect, useRef, forwardRef } from 'react'

// Add participant name prop and display it
interface VideoPlayerProps {
  stream: MediaStream
  isLocal?: boolean
  participantName?: string
  isMuted: boolean
  userName: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>((
  { stream, isLocal, isMuted, userName, isVideoEnabled, isAudioEnabled },
  ref
) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const finalRef = ref || videoRef

  useEffect(() => {
    const videoElement = (finalRef as React.RefObject<HTMLVideoElement>).current
    if (videoElement && stream) {
      videoElement.srcObject = stream
    }
  }, [stream, finalRef])

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={finalRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover ${
          !isVideoEnabled ? 'opacity-0' : ''
        }`}
      />
      
      {/* Video Disabled Overlay */}
      {!isVideoEnabled && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">{userName}</p>
          </div>
        </div>
      )}
      
      {/* User Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium">{userName}</span>
            {isLocal && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                You
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Audio Status */}
            <div className={`p-1 rounded ${
              isAudioEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <svg 
                className={`w-4 h-4 ${
                  isAudioEnabled ? 'text-green-400' : 'text-red-400'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isAudioEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
            </div>
            
            {/* Video Status */}
            <div className={`p-1 rounded ${
              isVideoEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <svg 
                className={`w-4 h-4 ${
                  isVideoEnabled ? 'text-green-400' : 'text-red-400'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isVideoEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-4.95-4.95m0 0L5.636 5.636M13.05 16.05L5.636 5.636" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Status */}
      {!isLocal && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer