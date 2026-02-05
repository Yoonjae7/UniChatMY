import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Verify() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('verify_email')
    if (!savedEmail) {
      navigate('/signup')
      return
    }
    setEmail(savedEmail)
    inputRefs.current[0]?.focus()
  }, [navigate])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newCode.every(c => c) && newCode.join('').length === 6) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setCode(newCode)

    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (verificationCode: string) => {
    setError('')
    setIsLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_SERVER_URL || ''
      const res = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      login(data.token, data.user)
      sessionStorage.removeItem('verify_email')
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setIsLoading(true)

    try {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setError('New code sent!')
    } catch (err) {
      setError('Failed to resend code')
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
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-gray-400">
              We sent a 6-digit code to
              <br />
              <span className="text-neon-cyan font-mono">{email}</span>
            </p>
          </div>

          {/* Code inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-mono bg-white/5 border border-white/10 rounded-xl text-white focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
                maxLength={1}
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg text-sm text-center ${
                error === 'New code sent!' 
                  ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {error}
            </motion.div>
          )}

          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-neon-cyan hover:underline disabled:opacity-50"
              >
                Resend
              </button>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/signup" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Use a different email
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
