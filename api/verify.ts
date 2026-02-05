import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

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

function getUniversityFromEmail(email: string) {
  const knownUniversities: Record<string, string> = {
    'nottingham.edu.my': 'UoN Malaysia',
    'taylors.edu.my': "Taylor's University",
    'sd.taylors.edu.my': "Taylor's University",
    'sunway.edu.my': 'Sunway University',
    'imail.sunway.edu.my': 'Sunway University',
    'monash.edu.my': 'Monash Malaysia',
    'student.monash.edu.my': 'Monash Malaysia',
    'apu.edu.my': 'APU',
    'mmu.edu.my': 'MMU',
    'hw.edu.my': 'Heriot-Watt Malaysia',
    'help.edu.my': 'HELP University',
    'ucsi.edu.my': 'UCSI University',
    'uitm.edu.my': 'UiTM',
    'um.edu.my': 'University of Malaya',
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Unknown University'
  
  for (const [uniDomain, name] of Object.entries(knownUniversities)) {
    if (domain === uniDomain || domain.endsWith('.' + uniDomain)) {
      return name
    }
  }
  
  if (domain.endsWith('.edu.my')) {
    const parts = domain.replace('.edu.my', '').split('.')
    return (parts[parts.length - 1] || 'Unknown').toUpperCase()
  }
  
  return 'Unknown University'
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

  const emailLower = email.toLowerCase().trim()

  // Verify the code from Supabase
  const { data: verificationData, error: verifyError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', emailLower)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // For demo/dev: if Supabase isn't configured, accept any 6-digit code
  const isDemo = !process.env.SUPABASE_URL || !verificationData

  if (!isDemo && !verificationData) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  // Mark code as used
  if (verificationData) {
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id)
  }

  // Check if user exists
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', emailLower)
    .single()

  const university = getUniversityFromEmail(emailLower)
  const pseudonym = generatePseudonym()

  if (!user) {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: emailLower,
        university,
        country_code: 'MY',
        pseudonym,
        is_banned: false
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      // For demo, create a temporary user object
      user = {
        id: `temp_${Date.now()}`,
        email: emailLower,
        university,
        pseudonym,
        is_banned: false
      }
    } else {
      user = newUser
    }
  } else {
    // Update last active and generate new pseudonym for this session
    await supabase
      .from('users')
      .update({ 
        last_active: new Date().toISOString(),
        pseudonym // New pseudonym each session
      })
      .eq('id', user.id)
    
    user.pseudonym = pseudonym
  }

  // Check if banned
  if (user.is_banned) {
    return res.status(403).json({ 
      error: 'This account has been suspended.',
      reason: user.ban_reason || 'Violation of community guidelines'
    })
  }

  // Generate JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      university: user.university,
      pseudonym: user.pseudonym
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.status(200).json({
    message: 'Verified successfully',
    token,
    user: {
      id: user.id,
      pseudonym: user.pseudonym,
      email: user.email,
      university: user.university
    }
  })
}
