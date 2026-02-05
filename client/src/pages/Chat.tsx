import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

interface Message {
  id: string
  text: string
  sender: 'me' | 'partner'
  timestamp: Date
}

interface PartnerInfo {
  id?: string
  pseudonym: string
  university: string
}

export default function Chat() {
  const { user, token } = useAuth()
  const { socket, isConnected } = useSocket()
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [partner, setPartner] = useState<PartnerInfo | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [partnerLeft, setPartnerLeft] = useState(false)
  const [isSearchingNext, setIsSearchingNext] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const chatData = sessionStorage.getItem('chat_room')
    if (!chatData) {
      navigate('/dashboard')
      return
    }

    const { roomId: savedRoomId, partner: savedPartner } = JSON.parse(chatData)
    setRoomId(savedRoomId)
    setPartner(savedPartner)

    // Welcome message
    setMessages([{
      id: 'welcome',
      text: `You're now chatting with ${savedPartner.pseudonym} from ${savedPartner.university}`,
      sender: 'partner',
      timestamp: new Date(),
    }])
  }, [navigate])

  useEffect(() => {
    if (!socket || !roomId) return

    socket.on('receive_message', (data: { id: string; text: string }) => {
      setMessages(prev => [...prev, {
        id: data.id,
        text: data.text,
        sender: 'partner',
        timestamp: new Date(),
      }])
      setIsPartnerTyping(false)
    })

    socket.on('partner_typing', () => {
      setIsPartnerTyping(true)
    })

    socket.on('partner_stopped_typing', () => {
      setIsPartnerTyping(false)
    })

    socket.on('partner_left', () => {
      setPartnerLeft(true)
      setIsPartnerTyping(false)
    })

    socket.on('match_found', (data: { roomId: string; partner: PartnerInfo }) => {
      sessionStorage.setItem('chat_room', JSON.stringify(data))
      setRoomId(data.roomId)
      setPartner(data.partner)
      setMessages([{
        id: 'welcome',
        text: `You're now chatting with ${data.partner.pseudonym} from ${data.partner.university}`,
        sender: 'partner',
        timestamp: new Date(),
      }])
      setPartnerLeft(false)
      setIsSearchingNext(false)
    })

    return () => {
      socket.off('receive_message')
      socket.off('partner_typing')
      socket.off('partner_stopped_typing')
      socket.off('partner_left')
      socket.off('match_found')
    }
  }, [socket, roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPartnerTyping])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !socket || !roomId || partnerLeft) return

    const messageId = Date.now().toString()
    socket.emit('send_message', { roomId, text: inputValue.trim(), id: messageId })
    
    setMessages(prev => [...prev, {
      id: messageId,
      text: inputValue.trim(),
      sender: 'me',
      timestamp: new Date(),
    }])
    
    setInputValue('')
    socket.emit('stopped_typing', { roomId })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    
    if (!socket || !roomId) return

    socket.emit('typing', { roomId })
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopped_typing', { roomId })
    }, 1000)
  }

  const handleNext = () => {
    if (!socket) return
    
    // Leave current chat and join queue for new match
    socket.emit('leave_chat', { roomId })
    socket.emit('join_queue')
    setIsSearchingNext(true)
    setPartnerLeft(false)
    setMessages([])
  }

  const handleBackToDashboard = () => {
    if (socket && roomId) {
      socket.emit('leave_chat', { roomId })
    }
    sessionStorage.removeItem('chat_room')
    navigate('/dashboard')
  }

  const handleReport = async () => {
    if (!reportReason.trim() || !partner?.id || !token) return
    
    setReportSubmitting(true)
    try {
      // Get last few messages as context
      const chatContext = messages
        .slice(-10)
        .map(m => `${m.sender === 'me' ? 'You' : partner.pseudonym}: ${m.text}`)
        .join('\n')
      
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportedUserId: partner.id,
          reason: reportReason,
          chatContext
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit report')
      }
      
      setReportSuccess(true)
      setTimeout(() => {
        setShowReportModal(false)
        setReportReason('')
        setReportSuccess(false)
      }, 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950">
      {/* Header */}
      <header className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {partner && !isSearchingNext && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink/30 to-neon-purple/30 flex items-center justify-center">
                  🎭
                </div>
                <div>
                  <p className="font-semibold text-neon-pink">{partner.pseudonym}</p>
                  <p className="text-xs text-gray-400">{partner.university}</p>
                </div>
              </div>
            )}
            
            {isSearchingNext && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
                <span className="text-gray-400">Finding new match...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isSearchingNext && partner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Report user"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            )}
            {!isSearchingNext && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => !reportSubmitting && setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-midnight-900 border border-white/10 rounded-2xl p-6"
            >
              {reportSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
                  <p className="text-gray-400">Thank you. Our team will review this shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-xl font-semibold">Report {partner?.pseudonym}</h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    Please describe why you're reporting this user. Include specific details about the violation.
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    {['Harassment or bullying', 'Hate speech', 'Sharing personal info', 'Spam or scam', 'Other'].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason === 'Other' ? '' : reason)}
                        className={`w-full p-3 rounded-xl text-left transition-colors ${
                          reportReason === reason
                            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-red-500/50 transition-colors resize-none h-24 mb-4"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      disabled={reportSubmitting}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={!reportReason.trim() || reportSubmitting}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30'
                      : message.id === 'welcome'
                      ? 'bg-white/5 border border-white/10 text-gray-400 text-sm text-center'
                      : 'bg-white/10 border border-white/10'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Partner typing indicator */}
          {isPartnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Partner left message */}
          {partnerLeft && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <div className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {partner?.pseudonym} has left the chat
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={partnerLeft ? 'Partner left. Click "Next" to find someone new...' : 'Type a message...'}
                disabled={partnerLeft || isSearchingNext || !isConnected}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || partnerLeft || isSearchingNext || !isConnected}
              className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>You: <span className="text-neon-cyan">{user?.pseudonym}</span></span>
            <span>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</span>
          </div>
        </form>
      </div>
    </div>
  )
}
