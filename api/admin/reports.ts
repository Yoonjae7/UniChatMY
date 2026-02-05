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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' })
  }

  if (req.method === 'GET') {
    // Get all reports with user info
    const { status, page = '1', limit = '50' } = req.query

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id(id, email, pseudonym, university),
        reported:reported_user_id(id, email, pseudonym, university, is_banned)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1
    const limitNum = parseInt(limit as string) || 50
    const offset = (pageNum - 1) * limitNum

    query = query.range(offset, offset + limitNum - 1)

    const { data: reports, error, count } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return res.status(500).json({ error: 'Failed to fetch reports' })
    }

    return res.status(200).json({
      reports: reports || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum
    })

  } else if (req.method === 'POST') {
    // Update report status
    const { reportId, status, adminNotes } = req.body

    if (!reportId || !status) {
      return res.status(400).json({ error: 'reportId and status are required' })
    }

    const validStatuses = ['pending', 'reviewed', 'actioned', 'dismissed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { error } = await supabase
      .from('reports')
      .update({ 
        status,
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error updating report:', error)
      return res.status(500).json({ error: 'Failed to update report' })
    }

    return res.status(200).json({ message: 'Report updated successfully' })

  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
