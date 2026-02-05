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
  // Check admin secret header
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret === ADMIN_SECRET) {
    return true
  }

  // Or check if user is in admins table
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Verify admin access
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get query params
  const { page = '1', limit = '50', search, banned } = req.query

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filter by search
  if (search && typeof search === 'string') {
    query = query.or(`email.ilike.%${search}%,pseudonym.ilike.%${search}%,university.ilike.%${search}%`)
  }

  // Filter by banned status
  if (banned === 'true') {
    query = query.eq('is_banned', true)
  } else if (banned === 'false') {
    query = query.eq('is_banned', false)
  }

  // Pagination
  const pageNum = parseInt(page as string) || 1
  const limitNum = parseInt(limit as string) || 50
  const offset = (pageNum - 1) * limitNum

  query = query.range(offset, offset + limitNum - 1)

  const { data: users, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }

  return res.status(200).json({
    users: users || [],
    total: count || 0,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil((count || 0) / limitNum)
  })
}
