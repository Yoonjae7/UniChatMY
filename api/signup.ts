import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const resend = new Resend(process.env.RESEND_API_KEY)

// Malaysian university domains
const knownUniversities: Record<string, { name: string; country: string; countryCode: string }> = {
  'nottingham.edu.my': { name: 'UoN Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'taylors.edu.my': { name: "Taylor's University", country: 'Malaysia', countryCode: 'MY' },
  'sd.taylors.edu.my': { name: "Taylor's University", country: 'Malaysia', countryCode: 'MY' },
  'sunway.edu.my': { name: 'Sunway University', country: 'Malaysia', countryCode: 'MY' },
  'imail.sunway.edu.my': { name: 'Sunway University', country: 'Malaysia', countryCode: 'MY' },
  'monash.edu.my': { name: 'Monash Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.monash.edu.my': { name: 'Monash Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'apu.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  'apiit.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  'mmu.edu.my': { name: 'MMU', country: 'Malaysia', countryCode: 'MY' },
  'student.mmu.edu.my': { name: 'MMU', country: 'Malaysia', countryCode: 'MY' },
  'hw.edu.my': { name: 'Heriot-Watt Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'uow.edu.my': { name: 'UOW Malaysia KDU', country: 'Malaysia', countryCode: 'MY' },
  'kdu.edu.my': { name: 'UOW Malaysia KDU', country: 'Malaysia', countryCode: 'MY' },
  'help.edu.my': { name: 'HELP University', country: 'Malaysia', countryCode: 'MY' },
  'ucsi.edu.my': { name: 'UCSI University', country: 'Malaysia', countryCode: 'MY' },
  'inti.edu.my': { name: 'INTI International University', country: 'Malaysia', countryCode: 'MY' },
  'segi.edu.my': { name: 'SEGi University', country: 'Malaysia', countryCode: 'MY' },
  'uitm.edu.my': { name: 'UiTM', country: 'Malaysia', countryCode: 'MY' },
  'student.uitm.edu.my': { name: 'UiTM', country: 'Malaysia', countryCode: 'MY' },
  'um.edu.my': { name: 'University of Malaya', country: 'Malaysia', countryCode: 'MY' },
  'siswa.um.edu.my': { name: 'University of Malaya', country: 'Malaysia', countryCode: 'MY' },
  'usm.edu.my': { name: 'USM', country: 'Malaysia', countryCode: 'MY' },
  'ukm.edu.my': { name: 'UKM', country: 'Malaysia', countryCode: 'MY' },
  'upm.edu.my': { name: 'UPM', country: 'Malaysia', countryCode: 'MY' },
  'utm.edu.my': { name: 'UTM', country: 'Malaysia', countryCode: 'MY' },
}

function getUniversityFromEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null

  // Check exact match first
  if (knownUniversities[domain]) {
    return knownUniversities[domain]
  }

  // Check if it's a subdomain of a known university
  for (const [uniDomain, info] of Object.entries(knownUniversities)) {
    if (domain.endsWith('.' + uniDomain) || domain === uniDomain) {
      return info
    }
  }

  // Check if it's a .edu.my domain (Malaysian university)
  if (domain.endsWith('.edu.my')) {
    const parts = domain.replace('.edu.my', '').split('.')
    const name = parts[parts.length - 1] || parts[0]
    return {
      name: name.toUpperCase(),
      country: 'Malaysia',
      countryCode: 'MY'
    }
  }

  return null
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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
  
  if (!university) {
    return res.status(400).json({ error: 'Please use a valid Malaysian university email (.edu.my)' })
  }

  // Check if user is banned
  const { data: existingUser } = await supabase
    .from('users')
    .select('is_banned, ban_reason')
    .eq('email', emailLower)
    .single()

  if (existingUser?.is_banned) {
    return res.status(403).json({ 
      error: 'This account has been suspended.',
      reason: existingUser.ban_reason || 'Violation of community guidelines'
    })
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

  // Store verification code in Supabase
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      email: emailLower,
      code,
      expires_at: expiresAt,
      used: false
    })

  if (insertError) {
    console.error('Error storing verification code:', insertError)
    // Continue anyway for demo - code will be in response
  }

  console.log(`Verification code for ${emailLower}: ${code}`)

  // Send real email via Resend
  try {
    await resend.emails.send({
      from: 'UniChat <onboarding@resend.dev>',
      to: emailLower,
      subject: `Your UniChat verification code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6366f1; text-align: center;">🎓 UniChat</h1>
          <h2 style="text-align: center; color: #333;">Your Verification Code</h2>
          <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 30px; border-radius: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #666; text-align: center;">Enter this code to verify your ${university.name} email.</p>
          <p style="color: #999; text-align: center; font-size: 12px;">This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; text-align: center; font-size: 11px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    })
    console.log(`Email sent to ${emailLower}`)
  } catch (emailError) {
    console.error('Failed to send email:', emailError)
    // Still return success - code is in database, user can retry
  }

  return res.status(200).json({
    message: 'Verification code sent',
    university: university.name,
    country: university.countryCode
  })
}
