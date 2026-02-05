import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'

// Malaysian university data for the marquee
const universities = [
  { name: "Taylor's", color: '#DC2626', emoji: '🎓' },
  { name: 'Sunway', color: '#F97316', emoji: '☀️' },
  { name: 'Monash', color: '#3B82F6', emoji: '👨🏿' },
  { name: 'Nottingham', color: '#10B981', emoji: '🏛️' },
  { name: 'APU', color: '#EF4444', emoji: '💻' },
  { name: 'MMU', color: '#6366F1', emoji: '🎬' },
  { name: 'IMU', color: '#059669', emoji: '🩺' },
  { name: 'Heriot-Watt', color: '#8B5CF6', emoji: '⚙️' },
  { name: 'UOW', color: '#0EA5E9', emoji: '🌊' },
  { name: 'UCSI', color: '#14B8A6', emoji: '🏥' },
  { name: 'HELP', color: '#F43F5E', emoji: '📚' },
  { name: 'INTI', color: '#A855F7', emoji: '🎯' },
  { name: 'SEGi', color: '#22C55E', emoji: '🌟' },
  { name: 'UiTM', color: '#EAB308', emoji: '🦅' },
  { name: 'UM', color: '#3B82F6', emoji: '🏆' },
  { name: 'USM', color: '#EC4899', emoji: '🔭' },
  { name: 'UTM', color: '#EF4444', emoji: '🚀' },
]

export default function Landing() {
  const howItWorksRef = useRef<HTMLElement>(null)
  const [showPolicy, setShowPolicy] = useState(false)
  const navigate = useNavigate()

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGetStarted = () => {
    setShowPolicy(true)
  }

  const handleAgreePolicy = () => {
    setShowPolicy(false)
    navigate('/signup')
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
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
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
                { value: '20+', label: 'Universities' },
                { value: '5k+', label: 'Students' },
                { value: '10k+', label: 'Chats' },
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
          <div className="marquee-container relative">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-midnight-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-midnight-950 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container - two identical tracks for seamless loop */}
            <div className="marquee-track">
              {[...universities, ...universities, ...universities].map((uni, i) => (
                <div
                  key={i}
                  className="uni-card flex-shrink-0 mx-4 px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3"
                  style={{ 
                    '--uni-color': uni.color,
                    '--uni-color-glow': `${uni.color}40`
                  } as React.CSSProperties}
                >
                  <span className="text-2xl">{uni.emoji}</span>
                  <span 
                    className="font-bold text-lg tracking-wide"
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

      {/* Policy Modal */}
      <AnimatePresence>
        {showPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPolicy(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-midnight-950 border border-white/10 rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-midnight-950 p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🤝</span>
                  <h2 className="text-2xl font-bold">Community Guidelines</h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Let's keep UniChat a safe & fun space for everyone
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Safe Space */}
                <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💚</span>
                    <div>
                      <h3 className="font-semibold text-neon-green mb-1">This is YOUR safe space</h3>
                      <p className="text-sm text-gray-300">
                        UniChat is built for Malaysian uni students to connect, make friends, and have fun conversations. 
                        Your identity is protected with random pseudonyms - be yourself!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span>📋</span> What we don't tolerate
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        icon: '🚫',
                        title: 'Bullying & Harassment',
                        desc: 'No intimidation, threats, or targeting other students',
                      },
                      {
                        icon: '🚫',
                        title: 'Defamation & Rumours',
                        desc: 'No spreading false information about individuals or universities',
                      },
                      {
                        icon: '🚫',
                        title: 'Sharing Private Info',
                        desc: "Don't share others' personal details, screenshots, or private conversations",
                      },
                      {
                        icon: '🚫',
                        title: 'Hate Speech',
                        desc: 'No discrimination based on race, religion, gender, or background',
                      },
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <span className="text-lg">{rule.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{rule.title}</h4>
                          <p className="text-xs text-gray-400">{rule.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report & Investigation */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-amber-400 mb-1">Reports & Investigations</h3>
                      <p className="text-sm text-gray-300">
                        If we receive reports of violations, we may investigate and take action including 
                        account suspension. Serious cases may be escalated to university authorities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Positive note */}
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">
                    99% of students are here to have genuine conversations. <br/>
                    <span className="text-neon-cyan">Be one of them! 🎉</span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-midnight-950 p-6 border-t border-white/10 space-y-3">
                <button
                  onClick={handleAgreePolicy}
                  className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  I Agree - Let's Go! 🚀
                </button>
                <button
                  onClick={() => setShowPolicy(false)}
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
