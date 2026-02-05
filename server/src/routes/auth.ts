import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/init.js'
import { getUniversityInfo, isValidUniversityEmail } from '../services/universityDomains.js'
import { generateVerificationCode, sendVerificationEmail } from '../services/email.js'
import { generatePseudonym } from '../services/pseudonymGenerator.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'unichat-dev-secret-change-in-production'

// Signup - send verification code
router.post('/signup', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Validate university email
    if (!isValidUniversityEmail(normalizedEmail)) {
      return res.status(400).json({ 
        error: 'Please use a valid university email (.edu, .ac.uk, etc.)' 
      })
    }
    
    const universityInfo = getUniversityInfo(normalizedEmail)
    if (!universityInfo) {
      return res.status(400).json({ error: 'Could not identify your university' })
    }
    
    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    // Store verification code (invalidate old ones)
    await query(
      'UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE',
      [normalizedEmail]
    )
    
    await query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [normalizedEmail, code, expiresAt]
    )
    
    // Send email
    const sent = await sendVerificationEmail(normalizedEmail, code)
    if (!sent) {
      // For development, still return success but log the code
      console.log(`DEV MODE - Verification code for ${normalizedEmail}: ${code}`)
    }
    
    res.json({ 
      message: 'Verification code sent',
      university: universityInfo.name,
      country: universityInfo.countryCode,
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Failed to send verification code' })
  }
})

// Verify code and create/login user
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' })
    }
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Find valid verification code
    const result = await query(
      `SELECT * FROM verification_codes 
       WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, code]
    )
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' })
    }
    
    // Mark code as used
    await query(
      'UPDATE verification_codes SET used = TRUE WHERE id = $1',
      [result.rows[0].id]
    )
    
    // Get university info
    const universityInfo = getUniversityInfo(normalizedEmail)
    if (!universityInfo) {
      return res.status(400).json({ error: 'Could not identify your university' })
    }
    
    const domain = normalizedEmail.split('@')[1]
    
    // Create or get user
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    )
    
    let user
    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await query(
        `INSERT INTO users (email, email_domain, university_name, country_code, verified_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [normalizedEmail, domain, universityInfo.name, universityInfo.countryCode]
      )
      user = insertResult.rows[0]
    } else {
      user = userResult.rows[0]
      // Update verified_at if not set
      if (!user.verified_at) {
        await query(
          'UPDATE users SET verified_at = NOW() WHERE id = $1',
          [user.id]
        )
      }
    }
    
    // Generate pseudonym for this session
    const pseudonym = generatePseudonym()
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        pseudonym,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        universityName: user.university_name,
        countryCode: user.country_code,
        pseudonym,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; pseudonym: string }
    
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const user = result.rows[0]
    res.json({
      id: user.id,
      email: user.email,
      universityName: user.university_name,
      countryCode: user.country_code,
      pseudonym: decoded.pseudonym,
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
})

export default router
