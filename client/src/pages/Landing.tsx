import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef } from 'react'

// Malaysian university data for the marquee
const universities = [
  { name: "Taylor's", color: '#8B0000' },
  { name: 'Sunway', color: '#FF6B00' },
  { name: 'Monash', color: '#006DAE' },
  { name: 'Nottingham', color: '#0D5257' },
  { name: 'APU', color: '#E31937' },
  { name: 'MMU', color: '#003366' },
  { name: 'Heriot-Watt', color: '#00247D' },
  { name: 'UOW', color: '#0033A0' },
  { name: 'UCSI', color: '#1E3A8A' },
  { name: 'HELP', color: '#DC2626' },
  { name: 'INTI', color: '#7C3AED' },
  { name: 'SEGi', color: '#059669' },
  { name: 'UiTM', color: '#7C2D12' },
  { name: 'UM', color: '#1D4ED8' },
  { name: 'USM', color: '#BE185D' },
  { name: 'UTM', color: '#B91C1C' },
]

export default function Landing() {
  const howItWorksRef = useRef<HTMLElement>(null)

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-midnight-950">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] animate-pulse-slow delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <span className="text-xl font-bold">UniChat</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-neon-cyan border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan/10 transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-mono text-neon-green bg-neon-green/10 border border-neon-green/30 rounded-full">
                🇲🇾 For Malaysian uni students only
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Bored in class?
              <br />
              <span className="gradient-text">Meet someone new.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Randomly match with students from Taylor's, Sunway, Monash, Nottingham, APU, MMU & more. 
              Chat anonymously, make friends, survive the lecture together.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <button 
                onClick={scrollToHowItWorks}
                className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5 transition-colors"
              >
                How it works
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: '500+', label: 'Universities' },
                { value: '50k+', label: 'Students' },
                { value: '1M+', label: 'Chats' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </main>

        {/* University Marquee */}
        <section className="py-12 overflow-hidden border-y border-white/5">
          <p className="text-center text-sm text-gray-500 mb-6">Connecting students from</p>
          <div className="relative">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-midnight-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-midnight-950 to-transparent z-10" />
            
            {/* Scrolling container */}
            <div className="flex animate-marquee">
              {[...universities, ...universities].map((uni, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 mx-6 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span 
                    className="font-bold text-lg"
                    style={{ color: uni.color }}
                  >
                    {uni.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={howItWorksRef} className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400">Three simple steps to start chatting</p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Verify Your Uni Email',
                  description: 'Sign up with your .edu.my email. We send a 6-digit code to verify you\'re a real student.',
                  icon: '📧',
                },
                {
                  step: '02',
                  title: 'Get a Random Name',
                  description: 'You\'ll get a fun pseudonym like "SleepyPanda" or "BoldTiger". Your identity stays hidden!',
                  icon: '🎭',
                },
                {
                  step: '03',
                  title: 'Match & Chat',
                  description: 'Hit "Find Match" and get connected with another Malaysian uni student instantly. Don\'t vibe? Hit "Next"!',
                  icon: '💬',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="absolute -top-4 left-6 px-3 py-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-sm font-mono font-bold">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Verified Students Only',
                description: 'Sign up with your uni email (.edu.my). No fakers allowed.'
              },
              {
                icon: '🎭',
                title: 'Stay Anonymous',
                description: 'Get a random pseudonym each session. Your identity stays hidden.'
              },
              {
                icon: '⚡',
                title: 'Instant Matching',
                description: 'Hit "Next" to skip and find someone new in seconds.'
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-colors"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-500 text-sm">
          <p>© 2026 UniChat. Made for students, by students.</p>
        </footer>
      </div>
    </div>
  )
}
