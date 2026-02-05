import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const JWT_SECRET = process.env.JWT_SECRET || 'unichat-dev-secret-key'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key'

async function verifyAdmin(req: VercelRequest): Promise<boolean> {
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret === ADMIN_SECRET) {
    return true
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', decoded.email)
      .single()
    
    return !!admin
  } catch {
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, action, reason } = req.body

  if (!userId || !action) {
    return res.status(400).json({ error: 'userId and action are required' })
  }

  if (action === 'ban') {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_banned: true, 
        ban_reason: reason || 'Violation of community guidelines'
      })
      .eq('id', userId)

    if (error) {
      console.error('Error banning user:', error)
      return res.status(500).json({ error: 'Failed to ban user' })
    }

    return res.status(200).json({ message: 'User banned successfully' })

  } else if (action === 'unban') {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_banned: false, 
        ban_reason: null 
      })
      .eq('id', userId)

    if (error) {
      console.error('Error unbanning user:', error)
      return res.status(500).json({ error: 'Failed to unban user' })
    }

    return res.status(200).json({ message: 'User unbanned successfully' })

  } else {
    return res.status(400).json({ error: 'Invalid action. Use "ban" or "unban"' })
  }
}
