import React from 'react'

interface Peer {
  id: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

interface ParticipantsListProps {
  peers: Map<string, Peer>
  localStream: MediaStream | null
  onClose: () => void
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  peers,
  localStream,
  onClose
}) => {
  const peerArray = Array.from(peers.values())
  const totalParticipants = peerArray.length + 1 // +1 for local user
  const streamingCount = peerArray.filter(peer => peer.stream).length + (localStream ? 1 : 0)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-white">Participants</h3>
          <p className="text-sm text-gray-400">
            {totalParticipants} total • {streamingCount} streaming
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Local User */}
        <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {localStream && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-700"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">You</span>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Host
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`flex items-center space-x-1 text-xs ${
                localStream ? 'text-green-400' : 'text-gray-400'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{localStream ? 'Streaming' : 'Not streaming'}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              className="text-gray-400 hover:text-white transition-colors"
              title="Mute"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Remote Participants */}
        {peerArray.map((peer) => {
          const connectionState = peer.connection.connectionState
          const isConnected = connectionState === 'connected'
          const isStreaming = !!peer.stream
          
          return (
            <div key={peer.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {isStreaming && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-700"></div>
                )}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-gray-700 ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">
                    User {peer.id.substring(0, 8)}
                  </span>
                  {!isConnected && (
                    <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                      Connecting...
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`flex items-center space-x-1 text-xs ${
                    isStreaming ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{isStreaming ? 'Streaming' : 'Not streaming'}</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs ${
                    isConnected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span>{connectionState}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Mute user"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <button
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Block user"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-4.95-4.95m0 0L5.636 5.636M13.05 16.05L5.636 5.636" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {peerArray.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400 text-sm">No other participants yet</p>
            <p className="text-gray-500 text-xs mt-1">Share the room ID to invite others</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Room participants are updated in real-time
        </div>
      </div>
    </div>
  )
}

export default ParticipantsList