import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// University detection
const knownUniversities: Record<string, { name: string; emoji: string }> = {
  'nottingham.edu.my': { name: 'UoN Malaysia', emoji: '🏛️' },
  'taylors.edu.my': { name: "Taylor's University", emoji: '🎓' },
  'sd.taylors.edu.my': { name: "Taylor's University", emoji: '🎓' },
  'sunway.edu.my': { name: 'Sunway University', emoji: '☀️' },
  'imail.sunway.edu.my': { name: 'Sunway University', emoji: '☀️' },
  'monash.edu.my': { name: 'Monash Malaysia', emoji: '👨🏿' },
  'student.monash.edu.my': { name: 'Monash Malaysia', emoji: '👨🏿' },
  'apu.edu.my': { name: 'APU', emoji: '💻' },
  'apiit.edu.my': { name: 'APU', emoji: '💻' },
  'mmu.edu.my': { name: 'MMU', emoji: '🎬' },
  'student.mmu.edu.my': { name: 'MMU', emoji: '🎬' },
  'hw.edu.my': { name: 'Heriot-Watt Malaysia', emoji: '⚙️' },
  'uow.edu.my': { name: 'UOW Malaysia KDU', emoji: '🌊' },
  'help.edu.my': { name: 'HELP University', emoji: '📚' },
  'ucsi.edu.my': { name: 'UCSI University', emoji: '🏥' },
  'inti.edu.my': { name: 'INTI University', emoji: '🎯' },
  'segi.edu.my': { name: 'SEGi University', emoji: '🌟' },
  'uitm.edu.my': { name: 'UiTM', emoji: '🦅' },
  'student.uitm.edu.my': { name: 'UiTM', emoji: '🦅' },
  'um.edu.my': { name: 'University of Malaya', emoji: '🏆' },
  'siswa.um.edu.my': { name: 'University of Malaya', emoji: '🏆' },
  'usm.edu.my': { name: 'USM', emoji: '🔭' },
  'ukm.edu.my': { name: 'UKM', emoji: '📖' },
  'upm.edu.my': { name: 'UPM', emoji: '🌿' },
  'utm.edu.my': { name: 'UTM', emoji: '🚀' },
  'imu.edu.my': { name: 'IMU', emoji: '🩺' },
}

function detectUniversity(email: string): { name: string; emoji: string } | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  
  // Check exact match
  if (knownUniversities[domain]) {
    return knownUniversities[domain]
  }
  
  // Check subdomain match
  for (const [uniDomain, info] of Object.entries(knownUniversities)) {
    if (domain.endsWith('.' + uniDomain) || domain === uniDomain) {
      return info
    }
  }
  
  // Check if it's a .edu.my domain
  if (domain.endsWith('.edu.my')) {
    const parts = domain.replace('.edu.my', '').split('.')
    const name = (parts[parts.length - 1] || 'Unknown').toUpperCase()
    return { name, emoji: '🎓' }
  }
  
  return null
}

export default function Signup() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const detectedUni = useMemo(() => detectUniversity(email), [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Store email for verification page
      sessionStorage.setItem('verify_email', email)
      navigate('/verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 bg-midnight-950">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <span className="text-xl font-bold">UniChat</span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h1 className="text-2xl font-bold mb-2">Join the chat</h1>
          <p className="text-gray-400 mb-6">
            Enter your university email to get started
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.my"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-neon-cyan/50 transition-colors"
                required
              />
              
              {/* Detected University */}
              <AnimatePresence>
                {detectedUni && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mt-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center gap-3"
                  >
                    <span className="text-2xl">{detectedUni.emoji}</span>
                    <div>
                      <p className="text-neon-green font-medium">{detectedUni.name}</p>
                      <p className="text-xs text-gray-400">University detected ✓</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!detectedUni && email.includes('@') && (
                <p className="mt-2 text-xs text-amber-400">
                  ⚠️ Please use a Malaysian university email (.edu.my)
                </p>
              )}
              
              {!email.includes('@') && (
                <p className="mt-2 text-xs text-gray-500">
                  We'll send a verification code to this email
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>By signing up, you agree to our Terms of Service</p>
          </div>
        </div>

        {/* Supported domains hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Taylor's, Sunway, Monash, Nottingham, APU, MMU, Heriot-Watt, UOW & more
          </p>
        </div>
      </motion.div>
    </div>
  )
}
