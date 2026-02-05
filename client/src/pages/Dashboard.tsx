import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

export default function Dashboard() {
  const { user, logout, updatePseudonym } = useAuth()
  const { socket, isConnected } = useSocket()
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [queueCount, setQueueCount] = useState(0)

  useEffect(() => {
    if (!socket) return

    socket.on('online_count', (count: number) => {
      setOnlineCount(count)
    })

    socket.on('queue_count', (count: number) => {
      setQueueCount(count)
    })

    socket.on('new_pseudonym', (pseudonym: string) => {
      updatePseudonym(pseudonym)
    })

    socket.on('match_found', (data: { roomId: string; partner: { pseudonym: string; university: string } }) => {
      sessionStorage.setItem('chat_room', JSON.stringify(data))
      navigate('/chat')
    })

    // Get initial counts
    socket.emit('get_stats')

    return () => {
      socket.off('online_count')
      socket.off('queue_count')
      socket.off('new_pseudonym')
      socket.off('match_found')
    }
  }, [socket, navigate, updatePseudonym])

  const handleStartChat = () => {
    if (!socket || !isConnected) return
    
    setIsSearching(true)
    socket.emit('join_queue')

    // Listen for queue events
    socket.once('queue_joined', () => {
      console.log('Joined queue')
    })

    socket.once('queue_left', () => {
      setIsSearching(false)
    })
  }

  const handleCancelSearch = () => {
    if (!socket) return
    socket.emit('leave_queue')
    setIsSearching(false)
  }

  const handleLogout = () => {
    if (socket) {
      socket.emit('leave_queue')
    }
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight-950">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] animate-pulse-slow delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <span className="text-xl font-bold">UniChat</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-red-500'}`} />
            <span className="text-gray-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* User info */}
          <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-pink/30 to-neon-purple/30 flex items-center justify-center text-2xl">
                🎭
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-neon-cyan">{user?.pseudonym}</p>
                <p className="text-sm text-gray-400">{user?.universityName}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 rounded bg-white/5">{user?.countryCode}</span>
              <span>•</span>
              <span className="font-mono">{user?.email}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-neon-green">{onlineCount}</div>
              <div className="text-sm text-gray-400">Online now</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-neon-cyan">{queueCount}</div>
              <div className="text-sm text-gray-400">Looking for chat</div>
            </div>
          </div>

          {/* Start button */}
          {!isSearching ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartChat}
              disabled={!isConnected}
              className="w-full py-5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-2xl font-bold text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎲 Find Random Match
            </motion.button>
          ) : (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-neon-cyan/30">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold">Searching...</p>
                    <p className="text-sm text-gray-400">Looking for students in {user?.countryCode}</p>
                  </div>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                </div>
              </div>
              <button
                onClick={handleCancelSearch}
                className="w-full py-3 border border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            You'll be matched with a random student from a university in your country
          </p>
        </motion.div>
      </main>
    </div>
  )
}
