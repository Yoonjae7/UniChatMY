import { v4 as uuidv4 } from 'uuid'

// In-memory matching queue (use Redis in production for scalability)
// Maps country code -> array of waiting users
const matchingQueues: Map<string, WaitingUser[]> = new Map()

// Active chat rooms
const activeRooms: Map<string, ChatRoom> = new Map()

// User socket mapping
const userSockets: Map<string, string> = new Map() // socketId -> oderId

interface WaitingUser {
  oderId: string
  socketId: string
  pseudonym: string
  university: string
  countryCode: string
  joinedAt: Date
}

interface ChatRoom {
  roomId: string
  users: [WaitingUser, WaitingUser]
  createdAt: Date
}

export function addToQueue(user: WaitingUser): void {
  const queue = matchingQueues.get(user.countryCode) || []
  
  // Remove any existing entry for this user
  const filtered = queue.filter(u => u.oderId !== user.oderId)
  filtered.push(user)
  
  matchingQueues.set(user.countryCode, filtered)
  userSockets.set(user.socketId, user.oderId)
}

export function removeFromQueue(socketId: string): WaitingUser | null {
  const userId = userSockets.get(socketId)
  if (!userId) return null
  
  for (const [countryCode, queue] of matchingQueues.entries()) {
    const index = queue.findIndex(u => u.socketId === socketId)
    if (index !== -1) {
      const [removed] = queue.splice(index, 1)
      matchingQueues.set(countryCode, queue)
      userSockets.delete(socketId)
      return removed
    }
  }
  
  return null
}

export function findMatch(user: WaitingUser): WaitingUser | null {
  const queue = matchingQueues.get(user.countryCode) || []
  
  // Find someone else in the queue (not self)
  const match = queue.find(u => u.oderId !== user.oderId)
  
  if (match) {
    // Remove match from queue
    const filtered = queue.filter(u => u.oderId !== match.oderId)
    matchingQueues.set(user.countryCode, filtered)
    userSockets.delete(match.socketId)
    
    // Also remove the current user from queue
    removeFromQueue(user.socketId)
    
    return match
  }
  
  return null
}

export function createRoom(user1: WaitingUser, user2: WaitingUser): ChatRoom {
  const roomId = uuidv4()
  const room: ChatRoom = {
    roomId,
    users: [user1, user2],
    createdAt: new Date(),
  }
  
  activeRooms.set(roomId, room)
  return room
}

export function getRoom(roomId: string): ChatRoom | undefined {
  return activeRooms.get(roomId)
}

export function leaveRoom(roomId: string, socketId: string): WaitingUser | null {
  const room = activeRooms.get(roomId)
  if (!room) return null
  
  const otherUser = room.users.find(u => u.socketId !== socketId)
  activeRooms.delete(roomId)
  
  return otherUser || null
}

export function getQueueCount(countryCode?: string): number {
  if (countryCode) {
    return matchingQueues.get(countryCode)?.length || 0
  }
  
  let total = 0
  for (const queue of matchingQueues.values()) {
    total += queue.length
  }
  return total
}

export function getTotalQueueCount(): number {
  let total = 0
  for (const queue of matchingQueues.values()) {
    total += queue.length
  }
  return total
}

export function getActiveRoomCount(): number {
  return activeRooms.size
}

export function isUserInQueue(socketId: string): boolean {
  return userSockets.has(socketId)
}

export function getUserFromQueue(socketId: string): WaitingUser | null {
  for (const queue of matchingQueues.values()) {
    const user = queue.find(u => u.socketId === socketId)
    if (user) return user
  }
  return null
}
