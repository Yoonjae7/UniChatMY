import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import { setupSocketHandlers } from './socket/handlers.js'
import { initDatabase } from './db/init.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://uni-chat-my.vercel.app',
  'https://unichatmy.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'UniChat Server',
    status: 'running',
    socketio: 'enabled'
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Setup socket handlers
setupSocketHandlers(io)

// Initialize database and start server
const PORT = process.env.PORT || 3001

async function start() {
  try {
    await initDatabase()
    console.log('✅ Database initialized')
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
