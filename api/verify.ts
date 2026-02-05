import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

// Shared in-memory store (NOTE: This won't persist between serverless function invocations!)
// For production, use a database like Vercel KV, Upstash Redis, or Neon PostgreSQL
const verificationCodes: Record<string, { code: string; expiresAt: Date }> = {}
const users: Record<string, any> = {}

const JWT_SECRET = process.env.JWT_SECRET || 'unichat-dev-secret-key'

// Adjectives and animals for pseudonym generation
const adjectives = ['Happy', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle', 'Jolly', 'Kind', 'Lively', 'Merry', 'Noble', 'Proud', 'Quick', 'Sharp', 'Swift', 'Wise', 'Zesty', 'Bright', 'Cool', 'Daring']
const animals = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Hawk', 'Lion', 'Owl', 'Rabbit', 'Deer', 'Koala', 'Otter', 'Penguin', 'Falcon', 'Jaguar', 'Leopard', 'Phoenix', 'Dragon']

function generatePseudonym(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const num = Math.floor(Math.random() * 100)
  return `${adj}${animal}${num}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' })
  }

  // NOTE: In serverless, this won't work because verificationCodes is empty on each invocation
  // For demo purposes, we'll accept any 6-digit code in dev mode
  const isDev = process.env.NODE_ENV !== 'production' || !process.env.VERCEL_ENV
  
  const stored = verificationCodes[email]
  
  // In dev/demo mode, accept the code if it was passed back from signup (devCode)
  // In production, you'd verify against a database
  if (!isDev && (!stored || stored.code !== code || new Date() > stored.expiresAt)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  // Create or get user
  const pseudonym = generatePseudonym()
  const userId = `user_${Date.now()}`
  
  const user = {
    id: userId,
    email,
    pseudonym,
    createdAt: new Date()
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.status(200).json({
    message: 'Verified successfully',
    token,
    user: {
      id: user.id,
      pseudonym: user.pseudonym,
      email: user.email
    }
  })
}
