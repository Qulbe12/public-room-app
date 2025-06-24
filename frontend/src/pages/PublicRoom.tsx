import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWebRTC } from '../contexts/WebRTCContext'
import { useSocket } from '../contexts/SocketContext'
import VideoPlayer from '../components/VideoPlayer'
import ParticipantsList from '../components/ParticipantsList'
import ControlPanel from '../components/ControlPanel'

const PublicRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { isConnected } = useSocket()
  const {
    localStream,
    peers,
    isStreaming,
    startStream,
    stopStream,
    joinRoom,
    leaveRoom
  } = useWebRTC()
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [roomInfo, setRoomInfo] = useState({
    participantCount: 0,
    streamingCount: 0
  })
  
  // New state for name input
  const [showNameModal, setShowNameModal] = useState(true)
  const [participantName, setParticipantName] = useState('')
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isConnected) {
      console.log('Socket not connected, waiting...')
      return
    }

    if (!roomId) {
      navigate('/')
      return
    }

    // Only join room after name is provided
    if (hasJoinedRoom && participantName.trim()) {
      joinRoom(roomId, participantName)
    }

    return () => {
      if (hasJoinedRoom) {
        leaveRoom()
        stopStream()
      }
    }
  }, [roomId, isConnected, hasJoinedRoom, participantName])

  useEffect(() => {
    // Update local video element
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    // Update room info
    const streamingPeers = Array.from(peers.values()).filter(peer => peer.stream)
    setRoomInfo({
      participantCount: peers.size + 1, // +1 for local user
      streamingCount: streamingPeers.length + (isStreaming ? 1 : 0)
    })
  }, [peers, isStreaming])

  const handleStartStream = async () => {
    try {
      await startStream()
    } catch (error) {
      console.error('Failed to start stream:', error)
      alert('Failed to access camera/microphone. Please check permissions.')
    }
  }

  const handleStopStream = () => {
    stopStream()
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const handleJoinWithName = () => {
    if (participantName.trim().length >= 2) {
      setShowNameModal(false)
      setHasJoinedRoom(true)
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    stopStream()
    navigate('/')
  }

  // Show name input modal
  if (showNameModal) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Room</h2>
            <p className="text-gray-600">Room ID: <span className="font-mono font-semibold">{roomId}</span></p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name
              </label>
              <input
                id="participantName"
                type="text"
                placeholder="Your display name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinWithName()}
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 2 characters, maximum 20 characters</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithName}
                disabled={participantName.trim().length < 2}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const peerStreams = Array.from(peers.values()).filter(peer => peer.stream)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Room: {roomId}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {roomInfo.participantCount} participants
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  {roomInfo.streamingCount} streaming
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="btn-secondary"
              >
                Participants
              </button>
              <button
                onClick={handleLeaveRoom}
                className="btn-danger"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {/* Local Video */}
            {localStream && (
              <div className="video-container">
                <VideoPlayer
                  ref={localVideoRef}
                  stream={localStream}
                  isLocal={true}
                  isMuted={true}
                  userName="You"
                  isVideoEnabled={isVideoEnabled}
                  isAudioEnabled={isAudioEnabled}
                />
              </div>
            )}
            
            {/* Remote Videos */}
            {peerStreams.map((peer) => (
              <div key={peer.id} className="video-container">
                <VideoPlayer
                  stream={peer.stream!}
                  isLocal={false}
                  isMuted={false}
                  userName={`User ${peer.id.substring(0, 8)}`}
                  isVideoEnabled={true}
                  isAudioEnabled={true}
                />
              </div>
            ))}
            
            {/* Empty State */}
            {!localStream && peerStreams.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No active streams</h3>
                  <p className="text-gray-400 mb-4">Start streaming to begin the conversation</p>
                  <button
                    onClick={handleStartStream}
                    className="btn-primary"
                  >
                    Start Streaming
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <ParticipantsList
              peers={peers}
              localStream={localStream}
              onClose={() => setShowParticipants(false)}
            />
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <ControlPanel
          isStreaming={isStreaming}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onStartStream={handleStartStream}
          onStopStream={handleStopStream}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    </div>
  )
}

export default PublicRoom