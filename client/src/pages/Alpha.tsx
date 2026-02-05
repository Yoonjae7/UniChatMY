import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

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

export default function Alpha() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [universityName, setUniversityName] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setError('')
    
    const uni = getUniversityFromEmail(newEmail)
    setUniversityName(uni)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/alpha-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to join alpha')
        setIsLoading(false)
        return
      }

      // Login with the token
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-midnight-950">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Alpha Badge */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full mb-4"
          >
            <span className="text-2xl">🧪</span>
            <span className="text-amber-400 font-semibold">Alpha Test Mode</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">Quick Access</h1>
          <p className="text-gray-400">
            Skip verification for testing. Just enter your uni email!
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@university.edu.my"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors"
                required
              />
              
              {/* University detection */}
              {universityName && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-gray-400 flex items-center gap-2"
                >
                  <span className="text-neon-green">✅</span> Detected: {universityName}
                </motion.p>
              )}
              
              {email && !universityName && email.includes('@') && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-amber-400 flex items-center gap-2"
                >
                  <span>⚠️</span> Use your Malaysian university email (.edu.my)
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || !universityName}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-lg text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                '🚀 Join Alpha Test'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
        >
          <p className="text-amber-400 text-sm text-center">
            <strong>⚡ Alpha Mode:</strong> No email verification needed. 
            You'll get a random pseudonym and can start chatting immediately!
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
