import type { VercelRequest, VercelResponse } from '@vercel/node'

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

function getUniversityFromEmail(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  
  for (const [uniDomain, uniName] of Object.entries(universityDomains)) {
    if (domain === uniDomain || domain.endsWith('.' + uniDomain)) {
      return uniName
    }
  }
  return null
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

  const university = getUniversityFromEmail(email.toLowerCase().trim())

  if (university) {
    return res.status(200).json({ university })
  } else {
    return res.status(200).json({ university: null })
  }
}
