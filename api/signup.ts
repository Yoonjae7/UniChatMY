import type { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory store (resets on cold start - use a database for production)
const users: Record<string, any> = {}
const verificationCodes: Record<string, { code: string; expiresAt: Date }> = {}

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

  const university = getUniversityFromEmail(email)
  if (!university) {
    return res.status(400).json({ error: 'Please use a valid Malaysian university email (.edu.my)' })
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Store verification code (in production, use a database)
  verificationCodes[email] = { code, expiresAt }

  console.log(`DEV MODE - Verification code for ${email}: ${code}`)

  // For now, just return success (email sending would need SMTP config)
  return res.status(200).json({
    message: 'Verification code sent',
    university: university.name,
    country: university.countryCode,
    // DEV ONLY - remove in production!
    devCode: code
  })
}

// Export for verify endpoint to access
export { verificationCodes, users, knownUniversities, getUniversityFromEmail }
