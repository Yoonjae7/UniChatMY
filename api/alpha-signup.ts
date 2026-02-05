import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const JWT_SECRET = process.env.JWT_SECRET || 'unichat-secret-2026'

// Pseudonym generation
const adjectives = [
  'Swift', 'Brave', 'Clever', 'Witty', 'Bold', 'Calm', 'Eager', 'Fierce',
  'Gentle', 'Happy', 'Jolly', 'Kind', 'Lucky', 'Merry', 'Noble', 'Proud',
  'Quick', 'Sharp', 'Smart', 'Wise', 'Zesty', 'Chill', 'Cosmic', 'Daring',
  'Epic', 'Funky', 'Groovy', 'Hyper', 'Icy', 'Jazzy', 'Keen', 'Lively',
  'Mighty', 'Nimble', 'Peppy', 'Quirky', 'Radiant', 'Snappy', 'Trendy', 'Vibrant',
  'Sleepy', 'Hungry', 'Bored', 'Chaotic', 'Clueless', 'Caffeinated'
]

const animals = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Owl', 'Bear',
  'Hawk', 'Lion', 'Shark', 'Falcon', 'Raven', 'Phoenix', 'Dragon', 'Lynx',
  'Cobra', 'Jaguar', 'Panther', 'Viper', 'Koala', 'Otter', 'Penguin', 'Sloth',
  'Raccoon', 'Hedgehog', 'Capybara', 'Axolotl', 'Quokka', 'RedPanda', 'Wombat', 'Platypus',
  'Meerkat', 'Lemur', 'Gecko', 'Corgi', 'Shiba', 'Cat', 'Hamster', 'Bunny'
]

function generatePseudonym(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj}${animal}`
}

// University domain mapping
const universityDomains: Record<string, string> = {
  'nottingham.edu.my': 'University of Nottingham Malaysia',
  'student.monash.edu.my': 'Monash University Malaysia',
  'monash.edu.my': 'Monash University Malaysia',
  'taylors.edu.my': "Taylor's University",
  'sd.taylors.edu.my': "Taylor's University",
  'sunway.edu.my': 'Sunway University',
  'imail.sunway.edu.my': 'Sunway University',
  'apu.edu.my': 'Asia Pacific University',
  'apiit.edu.my': 'Asia Pacific University',
  'mmu.edu.my': 'Multimedia University',
  'student.mmu.edu.my': 'Multimedia University',
  'hw.edu.my': 'Heriot-Watt University Malaysia',
  'uow.edu.my': 'University of Wollongong Malaysia',
  'ucsiuniversity.edu.my': 'UCSI University',
  'help.edu.my': 'HELP University',
  'newinti.edu.my': 'INTI University',
  'segi.edu.my': 'SEGi University',
  'uitm.edu.my': 'UiTM',
  'um.edu.my': 'University of Malaya',
  'usm.my': 'Universiti Sains Malaysia',
  'utm.my': 'Universiti Teknologi Malaysia',
  'imu.edu.my': 'International Medical University',
}

function getUniversityFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Unknown University'
  
  for (const [uniDomain, uniName] of Object.entries(universityDomains)) {
    if (domain === uniDomain || domain.endsWith('.' + uniDomain)) {
      return uniName
    }
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

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const emailLower = email.toLowerCase().trim()
  const university = getUniversityFromEmail(emailLower)

  if (university === 'Unknown University') {
    return res.status(400).json({ error: 'Please use a Malaysian university email (.edu.my)' })
  }

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .single()

    let user

    if (existingUser) {
      // Check if banned
      if (existingUser.is_banned) {
        return res.status(403).json({ error: 'This account has been suspended' })
      }

      // Generate new pseudonym for this session
      const newPseudonym = generatePseudonym()
      
      // Just use existing user with new pseudonym (don't update DB to avoid column issues)
      user = {
        ...existingUser,
        pseudonym: newPseudonym
      }
    } else {
      // Create new user
      const pseudonym = generatePseudonym()
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: emailLower,
          university,
          pseudonym,
          is_verified: true, // Alpha mode - skip verification
          is_banned: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Create error:', createError)
        return res.status(500).json({ error: 'Failed to create user' })
      }
      user = newUser
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
      message: 'Alpha access granted!',
      token,
      user: {
        id: user.id,
        pseudonym: user.pseudonym,
        email: user.email,
        university: user.university
      }
    })

  } catch (error) {
    console.error('Alpha signup error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
