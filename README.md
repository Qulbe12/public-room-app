# Video Streaming Application

A real-time video streaming application built with React, TypeScript, Node.js, Laravel, and WebRTC technology.

## Features

- Real-time video streaming using WebRTC
- Multiple participants in video rooms
- Socket.IO for signaling
- React frontend with TypeScript
- Laravel backend API
- Node.js Socket.IO server

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.IO Client
- WebRTC API

### Backend
- Laravel (PHP)
- Node.js Socket.IO Server
- SQLite Database

## Project Structure

```
test-video-stream/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Socket, WebRTC)
│   │   ├── pages/           # Page components
│   │   └── ...
│   └── ...
├── backend/                 # Laravel PHP application
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Events/          # Broadcasting events
│   │   └── ...
│   └── ...
├── socket-server.js         # Socket.IO server
├── socket-package.json      # Socket server dependencies
└── package.json            # Monorepo configuration
```

## Prerequisites

- Node.js (v18 or higher)
- PHP (v8.1 or higher)
- Composer
- Redis server (optional, for production)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
composer install
cd ..

# Install Socket.IO server dependencies
npm install --prefix . --package-lock-only
cp socket-package.json package-temp.json
npm install express socket.io cors nodemon
```

### 2. Environment Setup

```bash
# Copy Laravel environment file
cp backend/.env.example backend/.env

# Generate Laravel application key
cd backend
php artisan key:generate
cd ..
```

### 3. Configure Environment Variables

Edit `backend/.env` and update the following:

```env
APP_NAME="Video Stream Platform"
APP_URL=http://localhost:8000

# Database (SQLite for development)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite

# Broadcasting (for production, use Pusher or Redis)
BROADCAST_DRIVER=log

# Cache and Sessions
CACHE_DRIVER=file
SESSION_DRIVER=file

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Socket.IO Server
SOCKET_SERVER_URL=http://localhost:8000
```

### 4. Database Setup

```bash
# Create SQLite database file
cd backend
touch database/database.sqlite

# Run migrations (when available)
# php artisan migrate
cd ..
```

## Running the Application

### Development Mode

You need to run three servers simultaneously:

#### Terminal 1: Socket.IO Server
```bash
node socket-server.js
# Server will run on http://localhost:8000
```

#### Terminal 2: Laravel Backend
```bash
cd backend
php artisan serve --port=8001
# API will be available on http://localhost:8001
```

#### Terminal 3: React Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

### Using NPM Scripts (Alternative)

```bash
# Start all services (if you have concurrently installed)
npm run dev

# Or start individually:
npm run dev:frontend
npm run dev:backend
npm run dev:socket
```

## Usage

1. **Access the Application**: Open http://localhost:3000 in your browser

2. **Create a Room**: 
   - Click "Create New Room" to generate a random room ID
   - Or enter a specific room ID to join an existing room

3. **Start Streaming**:
   - Allow camera and microphone permissions
   - Click "Start Stream" to begin broadcasting
   - Share the room ID with others to join

4. **Join a Room**:
   - Enter the room ID provided by another user
   - Click "Join Room" to enter the video call

## API Endpoints

### Room Management
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{roomId}` - Get room information
- `POST /api/rooms/{roomId}/join` - Join a room
- `POST /api/rooms/{roomId}/leave` - Leave a room
- `GET /api/rooms/{roomId}/participants` - Get room participants

### WebRTC Signaling
- `POST /api/streams/offer` - Send WebRTC offer
- `POST /api/streams/answer` - Send WebRTC answer
- `POST /api/streams/ice-candidate` - Exchange ICE candidates

### Socket.IO Events
- `join-room` - Join a video room
- `leave-room` - Leave a video room
- `webrtc-offer` - WebRTC offer signaling
- `webrtc-answer` - WebRTC answer signaling
- `webrtc-ice-candidate` - ICE candidate exchange
- `participant-joined` - New participant notification
- `participant-left` - Participant left notification

## Development

### Frontend Development
- Hot reload enabled with Vite
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

### Backend Development
- Laravel Artisan commands available
- API routes in `backend/routes/api.php`
- Controllers in `backend/app/Http/Controllers/`
- Events in `backend/app/Events/`

### Socket Server Development
- Nodemon for auto-restart during development
- CORS configured for frontend communication
- Room and participant management
- WebRTC signaling relay

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure all origins are properly configured in both Laravel and Socket.IO server

2. **WebRTC Connection Issues**: 
   - Check browser permissions for camera/microphone
   - Ensure HTTPS in production (WebRTC requires secure context)
   - Verify STUN/TURN server configuration for production

3. **Socket Connection Failed**:
   - Verify Socket.IO server is running on port 8000
   - Check firewall settings
   - Ensure CORS is properly configured

4. **Laravel API Issues**:
   - Run `php artisan config:clear` to clear config cache
   - Check `.env` file configuration
   - Verify database connection

### Health Checks

- Socket.IO Server: http://localhost:8000/health
- Laravel API: http://localhost:8001/api (should return Laravel version)
- Frontend: http://localhost:3000 (should load the homepage)

## Production Deployment

### Environment Considerations

1. **HTTPS Required**: WebRTC requires HTTPS in production
2. **STUN/TURN Servers**: Configure for NAT traversal
3. **Database**: Switch from SQLite to PostgreSQL/MySQL
4. **Broadcasting**: Use Redis or Pusher for real-time events
5. **Caching**: Configure Redis for better performance

### Security

- Enable authentication for room creation
- Implement rate limiting
- Configure proper CORS origins
- Use environment variables for sensitive data
- Enable CSRF protection where needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).