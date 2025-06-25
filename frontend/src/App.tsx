import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

import { SocketProvider } from './contexts/SocketContext'
import { WebRTCProvider } from './contexts/WebRTCContext'
import PublicRoom from './pages/PublicRoom'


function App() {
  return (
    <SocketProvider>
      <WebRTCProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:roomId" element={<PublicRoom />} />
            </Routes>
          </div>
        </Router>
      </WebRTCProvider>
    </SocketProvider>
  )
}

export default App