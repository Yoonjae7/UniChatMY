import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const JWT_SECRET = process.env.JWT_SECRET || 'unichat-dev-secret-key'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify user is logged in
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  let reporterId: string
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    reporterId = decoded.userId
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { reportedUserId, reason, chatContext } = req.body

  if (!reportedUserId || !reason) {
    return res.status(400).json({ error: 'reportedUserId and reason are required' })
  }

  // Don't allow self-reporting
  if (reporterId === reportedUserId) {
    return res.status(400).json({ error: 'You cannot report yourself' })
  }

  // Check if user exists
  const { data: reportedUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', reportedUserId)
    .single()

  if (!reportedUser) {
    return res.status(404).json({ error: 'Reported user not found' })
  }

  // Create report
  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      chat_context: chatContext || null,
      status: 'pending'
    })

  if (error) {
    console.error('Error creating report:', error)
    return res.status(500).json({ error: 'Failed to submit report' })
  }

  return res.status(200).json({ 
    message: 'Report submitted successfully. Our team will review it shortly.' 
  })
}
