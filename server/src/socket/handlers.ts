import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { query } from '../db/init.js'
import { generatePseudonym } from '../services/pseudonymGenerator.js'
import {
  addToQueue,
  removeFromQueue,
  findMatch,
  createRoom,
  leaveRoom,
  getQueueCount,
  getTotalQueueCount,
  getActiveRoomCount,
} from '../services/matching.js'

const JWT_SECRET = process.env.JWT_SECRET || 'unichat-dev-secret-change-in-production'

interface AuthenticatedSocket extends Socket {
  userId?: string
  email?: string
  pseudonym?: string
  universityName?: string
  countryCode?: string
}

// Track connected users
const connectedUsers = new Set<string>()

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication required'))
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string
        email: string
        pseudonym: string
      }
      
      // Get user from database
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      )
      
      if (result.rows.length === 0) {
        return next(new Error('User not found'))
      }
      
      const user = result.rows[0]
      socket.userId = user.id
      socket.email = user.email
      socket.pseudonym = decoded.pseudonym || generatePseudonym()
      socket.universityName = user.university_name
      socket.countryCode = user.country_code
      
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.pseudonym} (${socket.id})`)
    connectedUsers.add(socket.id)
    
    // Broadcast updated counts
    broadcastStats(io)
    
    // Send pseudonym to client
    socket.emit('new_pseudonym', socket.pseudonym)

    // Get stats
    socket.on('get_stats', () => {
      socket.emit('online_count', connectedUsers.size)
      socket.emit('queue_count', getTotalQueueCount())
    })

    // Join matching queue
    socket.on('join_queue', () => {
      if (!socket.userId || !socket.pseudonym || !socket.universityName || !socket.countryCode) {
        socket.emit('error', { message: 'Not authenticated' })
        return
      }
      
      console.log(`${socket.pseudonym} joining queue for ${socket.countryCode}`)
      
      const user = {
        oderId: socket.userId,
        socketId: socket.id,
        pseudonym: socket.pseudonym,
        university: socket.universityName,
        countryCode: socket.countryCode,
        joinedAt: new Date(),
      }
      
      // Try to find a match first
      addToQueue(user)
      const match = findMatch(user)
      
      if (match) {
        // Found a match!
        const room = createRoom(user, match)
        console.log(`Match found! ${user.pseudonym} <-> ${match.pseudonym} in room ${room.roomId}`)
        
        // Join both users to the room
        socket.join(room.roomId)
        const matchSocket = io.sockets.sockets.get(match.socketId)
        if (matchSocket) {
          matchSocket.join(room.roomId)
        }
        
        // Notify both users
        socket.emit('match_found', {
          roomId: room.roomId,
          partner: {
            pseudonym: match.pseudonym,
            university: match.university,
          },
        })
        
        if (matchSocket) {
          matchSocket.emit('match_found', {
            roomId: room.roomId,
            partner: {
              pseudonym: user.pseudonym,
              university: user.university,
            },
          })
        }
      } else {
        // Added to queue, waiting for match
        socket.emit('queue_joined')
      }
      
      broadcastStats(io)
    })

    // Leave queue
    socket.on('leave_queue', () => {
      removeFromQueue(socket.id)
      socket.emit('queue_left')
      broadcastStats(io)
    })

    // Send message
    socket.on('send_message', ({ roomId, text, id }) => {
      if (!roomId || !text) return
      
      // Broadcast to room (excluding sender)
      socket.to(roomId).emit('receive_message', {
        id,
        text,
        senderId: socket.userId,
        senderPseudonym: socket.pseudonym,
      })
    })

    // Typing indicators
    socket.on('typing', ({ roomId }) => {
      if (!roomId) return
      socket.to(roomId).emit('partner_typing')
    })

    socket.on('stopped_typing', ({ roomId }) => {
      if (!roomId) return
      socket.to(roomId).emit('partner_stopped_typing')
    })

    // Leave chat
    socket.on('leave_chat', ({ roomId }) => {
      if (!roomId) return
      
      const otherUser = leaveRoom(roomId, socket.id)
      socket.leave(roomId)
      
      if (otherUser) {
        const otherSocket = io.sockets.sockets.get(otherUser.socketId)
        if (otherSocket) {
          otherSocket.emit('partner_left')
          otherSocket.leave(roomId)
        }
      }
      
      broadcastStats(io)
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.pseudonym} (${socket.id})`)
      connectedUsers.delete(socket.id)
      removeFromQueue(socket.id)
      
      // Notify any active chat partners
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit('partner_left')
        }
      }
      
      broadcastStats(io)
    })
  })
}

function broadcastStats(io: Server) {
  io.emit('online_count', connectedUsers.size)
  io.emit('queue_count', getTotalQueueCount())
}
