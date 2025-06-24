import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useSocket } from './SocketContext'

interface Peer {
  id: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

interface WebRTCContextType {
  localStream: MediaStream | null
  peers: Map<string, Peer>
  isStreaming: boolean
  startStream: () => Promise<void>
  stopStream: () => void
  joinRoom: (roomId: string, participantName?: string) => void
  leaveRoom: () => void
}

const WebRTCContext = createContext<WebRTCContextType | null>(null)

export const useWebRTC = () => {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider')
  }
  return context
}

interface WebRTCProviderProps {
  children: React.ReactNode
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

export const WebRTCProvider: React.FC<WebRTCProviderProps> = ({ children }) => {
  const { socket } = useSocket()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map())
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const currentParticipant = useRef<{ id: string; name: string } | null>(null)

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS)

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', peerId)
      setPeers(prev => {
        const newPeers = new Map(prev)
        const peer = newPeers.get(peerId)
        if (peer) {
          peer.stream = event.streams[0]
          newPeers.set(peerId, peer)
        }
        return newPeers
      })
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && currentRoom) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: peerId,
          room: currentRoom
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state:`, peerConnection.connectionState)
      if (peerConnection.connectionState === 'failed') {
        console.log(`Peer ${peerId} connection failed, attempting restart`)
        peerConnection.restartIce()
      }
    }

    return peerConnection
  }, [socket, currentRoom])

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      setIsStreaming(true)
      console.log('Local stream started')
    } catch (error) {
      console.error('Failed to start stream:', error)
      throw error
    }
  }, [])

  const stopStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    setIsStreaming(false)
    console.log('Local stream stopped')
  }, [localStream])

  // Setup socket event listeners in a separate useEffect
  useEffect(() => {
    if (!socket || !currentRoom) return

    const handleUserJoined = async (userId: string) => {
      try {
        console.log('User joined:', userId)
        const peerConnection = createPeerConnection(userId)
        
        // Add local stream if available
        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
          })
        }
        
        setPeers(prev => new Map(prev).set(userId, {
          id: userId,
          connection: peerConnection
        }))
        
        // Create and send offer
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        socket.emit('offer', {
          offer,
          to: userId,
          room: currentRoom
        })
      } catch (error) {
        console.error('Error handling user joined:', error)
      }
    }

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit, from: string }) => {
      try {
        console.log('Received offer from:', data.from)
        const peerConnection = createPeerConnection(data.from)
        
        // Add local stream if available
        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
          })
        }
        
        setPeers(prev => new Map(prev).set(data.from, {
          id: data.from,
          connection: peerConnection
        }))
        
        await peerConnection.setRemoteDescription(data.offer)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        socket.emit('answer', {
          answer,
          to: data.from,
          room: currentRoom
        })
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    }

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit, from: string }) => {
      try {
        console.log('Received answer from:', data.from)
        setPeers(prev => {
          const peer = prev.get(data.from)
          if (peer) {
            peer.connection.setRemoteDescription(data.answer)
          }
          return prev
        })
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    }

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit, from: string }) => {
      try {
        setPeers(prev => {
          const peer = prev.get(data.from)
          if (peer) {
            peer.connection.addIceCandidate(data.candidate)
          }
          return prev
        })
      } catch (error) {
        console.error('Error handling ICE candidate:', error)
      }
    }

    const handleUserLeft = (userId: string) => {
      console.log('User left:', userId)
      setPeers(prev => {
        const peer = prev.get(userId)
        if (peer) {
          peer.connection.close()
          const newPeers = new Map(prev)
          newPeers.delete(userId)
          return newPeers
        }
        return prev
      })
    }

    // Add event listeners
    socket.on('user-joined', handleUserJoined)
    socket.on('offer', handleOffer)
    socket.on('answer', handleAnswer)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('user-left', handleUserLeft)

    // Cleanup function
    return () => {
      socket.off('user-joined', handleUserJoined)
      socket.off('offer', handleOffer)
      socket.off('answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('user-left', handleUserLeft)
    }
  }, [socket, currentRoom, localStream, createPeerConnection])

  const joinRoom = useCallback((roomId: string, participantName?: string) => {
    if (!socket || currentRoom === roomId) return

    // Generate participant ID and use provided name or generate one
    const participantId = socket.id || `user_${Date.now()}`
    const finalParticipantName = participantName && participantName.trim() 
      ? participantName.trim() 
      : `User ${participantId.slice(-4)}`

    // Store current participant info
    currentParticipant.current = {
      id: participantId,
      name: finalParticipantName
    }

    setCurrentRoom(roomId)

    // Join the room with participant info
    socket.emit('join-room', {
      roomId,
      participantId,
      participantName: finalParticipantName
    })

    console.log(`Joining room ${roomId} as ${finalParticipantName}`)
  }, [socket, currentRoom])

  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoom || !currentParticipant.current) return
    
    // Send proper leave-room event with participant info
    socket.emit('leave-room', {
      roomId: currentRoom,
      participantId: currentParticipant.current.id,
      participantName: currentParticipant.current.name
    })
    
    // Close all peer connections
    peers.forEach((peer) => {
      peer.connection.close()
    })
    setPeers(new Map())
    
    // Reset state
    setCurrentRoom(null)
    currentParticipant.current = null
    
    console.log('Left room')
  }, [socket, currentRoom, peers])

  return (
    <WebRTCContext.Provider value={{
      localStream,
      peers,
      isStreaming,
      startStream,
      stopStream,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </WebRTCContext.Provider>
  )
}