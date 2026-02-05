// University domain to country/name mapping
// Currently focused on Malaysian universities

interface UniversityInfo {
  name: string
  country: string
  countryCode: string
}

// Malaysian university email domains
const knownUniversities: Record<string, UniversityInfo> = {
  // ============================================
  // MALAYSIAN UNIVERSITIES
  // ============================================
  
  // University of Nottingham Malaysia
  'nottingham.edu.my': { name: 'UoN Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.nottingham.edu.my': { name: 'UoN Malaysia', country: 'Malaysia', countryCode: 'MY' },
  
  // Taylor's University
  'taylors.edu.my': { name: "Taylor's University", country: 'Malaysia', countryCode: 'MY' },
  'sd.taylors.edu.my': { name: "Taylor's University", country: 'Malaysia', countryCode: 'MY' },
  'student.taylors.edu.my': { name: "Taylor's University", country: 'Malaysia', countryCode: 'MY' },
  
  // Sunway University
  'sunway.edu.my': { name: 'Sunway University', country: 'Malaysia', countryCode: 'MY' },
  'imail.sunway.edu.my': { name: 'Sunway University', country: 'Malaysia', countryCode: 'MY' },
  'student.sunway.edu.my': { name: 'Sunway University', country: 'Malaysia', countryCode: 'MY' },
  
  // Monash University Malaysia
  'monash.edu.my': { name: 'Monash Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.monash.edu.my': { name: 'Monash Malaysia', country: 'Malaysia', countryCode: 'MY' },
  
  // Asia Pacific University (APU)
  'apu.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  'mail.apu.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  'student.apu.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  'apiit.edu.my': { name: 'APU', country: 'Malaysia', countryCode: 'MY' },
  
  // Multimedia University (MMU)
  'mmu.edu.my': { name: 'MMU', country: 'Malaysia', countryCode: 'MY' },
  'student.mmu.edu.my': { name: 'MMU', country: 'Malaysia', countryCode: 'MY' },
  'live.mmu.edu.my': { name: 'MMU', country: 'Malaysia', countryCode: 'MY' },
  
  // Heriot-Watt University Malaysia
  'hw.edu.my': { name: 'Heriot-Watt Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.hw.edu.my': { name: 'Heriot-Watt Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'live.hw.ac.uk': { name: 'Heriot-Watt Malaysia', country: 'Malaysia', countryCode: 'MY' }, // Some use UK domain
  
  // University of Wollongong Malaysia (UOW Malaysia KDU)
  'uow.edu.my': { name: 'UOW Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'kdu.edu.my': { name: 'UOW Malaysia KDU', country: 'Malaysia', countryCode: 'MY' },
  'student.kdu.edu.my': { name: 'UOW Malaysia KDU', country: 'Malaysia', countryCode: 'MY' },
  
  // HELP University
  'help.edu.my': { name: 'HELP University', country: 'Malaysia', countryCode: 'MY' },
  'student.help.edu.my': { name: 'HELP University', country: 'Malaysia', countryCode: 'MY' },
  
  // UCSI University
  'ucsi.edu.my': { name: 'UCSI University', country: 'Malaysia', countryCode: 'MY' },
  'student.ucsi.edu.my': { name: 'UCSI University', country: 'Malaysia', countryCode: 'MY' },
  'ucsiuniversity.edu.my': { name: 'UCSI University', country: 'Malaysia', countryCode: 'MY' },
  
  // INTI International University
  'inti.edu.my': { name: 'INTI University', country: 'Malaysia', countryCode: 'MY' },
  'student.inti.edu.my': { name: 'INTI University', country: 'Malaysia', countryCode: 'MY' },
  'newinti.edu.my': { name: 'INTI University', country: 'Malaysia', countryCode: 'MY' },
  
  // SEGi University
  'segi.edu.my': { name: 'SEGi University', country: 'Malaysia', countryCode: 'MY' },
  'student.segi.edu.my': { name: 'SEGi University', country: 'Malaysia', countryCode: 'MY' },
  
  // UITM (Universiti Teknologi MARA)
  'uitm.edu.my': { name: 'UiTM', country: 'Malaysia', countryCode: 'MY' },
  'student.uitm.edu.my': { name: 'UiTM', country: 'Malaysia', countryCode: 'MY' },
  
  // UM (Universiti Malaya)
  'um.edu.my': { name: 'Universiti Malaya', country: 'Malaysia', countryCode: 'MY' },
  'siswa.um.edu.my': { name: 'Universiti Malaya', country: 'Malaysia', countryCode: 'MY' },
  'student.um.edu.my': { name: 'Universiti Malaya', country: 'Malaysia', countryCode: 'MY' },
  
  // USM (Universiti Sains Malaysia)
  'usm.my': { name: 'USM', country: 'Malaysia', countryCode: 'MY' },
  'student.usm.my': { name: 'USM', country: 'Malaysia', countryCode: 'MY' },
  
  // UKM (Universiti Kebangsaan Malaysia)
  'ukm.edu.my': { name: 'UKM', country: 'Malaysia', countryCode: 'MY' },
  'siswa.ukm.edu.my': { name: 'UKM', country: 'Malaysia', countryCode: 'MY' },
  
  // UPM (Universiti Putra Malaysia)
  'upm.edu.my': { name: 'UPM', country: 'Malaysia', countryCode: 'MY' },
  'student.upm.edu.my': { name: 'UPM', country: 'Malaysia', countryCode: 'MY' },
  
  // UTM (Universiti Teknologi Malaysia)
  'utm.my': { name: 'UTM', country: 'Malaysia', countryCode: 'MY' },
  'graduate.utm.my': { name: 'UTM', country: 'Malaysia', countryCode: 'MY' },
  'live.utm.my': { name: 'UTM', country: 'Malaysia', countryCode: 'MY' },
  
  // Curtin Malaysia
  'curtin.edu.my': { name: 'Curtin Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.curtin.edu.my': { name: 'Curtin Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'postgrad.curtin.edu.my': { name: 'Curtin Malaysia', country: 'Malaysia', countryCode: 'MY' },
  
  // Swinburne Sarawak
  'swinburne.edu.my': { name: 'Swinburne Sarawak', country: 'Malaysia', countryCode: 'MY' },
  'student.swinburne.edu.my': { name: 'Swinburne Sarawak', country: 'Malaysia', countryCode: 'MY' },
  
  // UNITEN
  'uniten.edu.my': { name: 'UNITEN', country: 'Malaysia', countryCode: 'MY' },
  'student.uniten.edu.my': { name: 'UNITEN', country: 'Malaysia', countryCode: 'MY' },
  
  // Xiamen University Malaysia
  'xmu.edu.my': { name: 'Xiamen University Malaysia', country: 'Malaysia', countryCode: 'MY' },
  'student.xmu.edu.my': { name: 'Xiamen University Malaysia', country: 'Malaysia', countryCode: 'MY' },
  
  // Limkokwing
  'limkokwing.edu.my': { name: 'Limkokwing', country: 'Malaysia', countryCode: 'MY' },
  'student.limkokwing.edu.my': { name: 'Limkokwing', country: 'Malaysia', countryCode: 'MY' },
  
  // The One Academy
  'toa.edu.my': { name: 'The One Academy', country: 'Malaysia', countryCode: 'MY' },
}

// Fallback: Any .edu.my domain is considered a Malaysian university
const domainSuffixMap: Record<string, { country: string; countryCode: string }> = {
  '.edu.my': { country: 'Malaysia', countryCode: 'MY' },
}

export function getUniversityInfo(email: string): UniversityInfo | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  
  // Check known universities first (exact match)
  if (knownUniversities[domain]) {
    return knownUniversities[domain]
  }
  
  // Check if it's a subdomain of a known university
  for (const [knownDomain, info] of Object.entries(knownUniversities)) {
    if (domain.endsWith('.' + knownDomain) || domain === knownDomain) {
      return info
    }
  }
  
  // Fallback: Check domain suffix (.edu.my)
  for (const [suffix, info] of Object.entries(domainSuffixMap)) {
    if (domain.endsWith(suffix)) {
      const name = generateUniversityName(domain, suffix)
      return {
        name,
        ...info,
      }
    }
  }
  
  return null
}

function generateUniversityName(domain: string, suffix: string): string {
  let name = domain.replace(suffix, '')
  
  // Remove common subdomains
  name = name.replace(/^(mail|student|students|email|my|live|imail)\./i, '')
  
  // Split by dots and take the main part
  const parts = name.split('.')
  name = parts[parts.length - 1] || parts[0]
  
  // Capitalize and format
  name = name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
  
  return name
}

export function isValidUniversityEmail(email: string): boolean {
  return getUniversityInfo(email) !== null
}

// Get list of supported universities for display
export function getSupportedUniversities(): string[] {
  const unis = new Set<string>()
  for (const info of Object.values(knownUniversities)) {
    unis.add(info.name)
  }
  return Array.from(unis).sort()
}
