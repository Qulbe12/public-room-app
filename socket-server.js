const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.20:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enable CORS for Express
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.20:3000"],
  credentials: true
}));

app.use(express.json());

// Store room information
const rooms = new Map();
const participants = new Map();
const roomAdmins = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, participantId, participantName } = data;
    
    console.log(`${participantName} (${participantId}) joining room ${roomId}`);
    
    // Leave any existing rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    // Join the new room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist and set first user as admin
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      roomAdmins.set(roomId, socket.id);
    }
    
    // Store participant info with admin status
    const isAdmin = roomAdmins.get(roomId) === socket.id;
    participants.set(socket.id, {
      participantId,
      participantName,
      roomId,
      socketId: socket.id,
      isAdmin
    });
    
    // Add participant to room
    rooms.get(roomId).add(socket.id);
    
    // Notify others in the room that a new user joined
    socket.to(roomId).emit('user-joined', socket.id);
    
    // Send current participants to the new user
    const currentParticipants = [];
    rooms.get(roomId).forEach(socketId => {
      if (socketId !== socket.id && participants.has(socketId)) {
        const participant = participants.get(socketId);
        currentParticipants.push({
          participantId: participant.participantId,
          participantName: participant.participantName,
          socketId: socketId,
          isAdmin: participant.isAdmin
        });
      }
    });
    
    socket.emit('room-participants', {
      participants: currentParticipants,
      isAdmin
    });
    
    console.log(`Room ${roomId} now has ${rooms.get(roomId).size} participants`);
  });

  // Leave room
  socket.on('leave-room', () => {
    handleLeaveRoom(socket);
  });

  // WebRTC signaling - Updated to match frontend event names
  socket.on('offer', (data) => {
    const { to, offer, room } = data;
    const sender = participants.get(socket.id);
    
    if (sender) {
      socket.to(to).emit('offer', {
        offer,
        from: socket.id
      });
    }
  });

  socket.on('answer', (data) => {
    const { to, answer, room } = data;
    const sender = participants.get(socket.id);
    
    if (sender) {
      socket.to(to).emit('answer', {
        answer,
        from: socket.id
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const { to, candidate, room } = data;
    const sender = participants.get(socket.id);
    
    if (sender) {
      socket.to(to).emit('ice-candidate', {
        candidate,
        from: socket.id
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    handleLeaveRoom(socket);
  });

  function handleLeaveRoom(socket) {
    const participant = participants.get(socket.id);
    
    if (participant) {
      const { roomId, participantId, participantName } = participant;
      
      // Remove from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        
        // If admin leaves and room still has participants, assign new admin
        if (roomAdmins.get(roomId) === socket.id && rooms.get(roomId).size > 0) {
          const newAdminSocketId = Array.from(rooms.get(roomId))[0];
          roomAdmins.set(roomId, newAdminSocketId);
          
          // Update new admin's participant info
          if (participants.has(newAdminSocketId)) {
            const newAdmin = participants.get(newAdminSocketId);
            newAdmin.isAdmin = true;
            participants.set(newAdminSocketId, newAdmin);
            
            // Notify the new admin
            socket.to(newAdminSocketId).emit('admin-promoted');
          }
        }
        
        // Clean up empty rooms
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
          roomAdmins.delete(roomId);
        }
      }
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', socket.id);
      
      // Remove participant
      participants.delete(socket.id);
      
      console.log(`${participantName} left room ${roomId}`);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    participants: participants.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const participantsList = [];
  room.forEach(socketId => {
    if (participants.has(socketId)) {
      const participant = participants.get(socketId);
      participantsList.push({
        participantId: participant.participantId,
        participantName: participant.participantName
      });
    }
  });
  
  res.json({
    roomId,
    participantCount: room.size,
    participants: participantsList
  });
});

const PORT = process.env.PORT || 8001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});