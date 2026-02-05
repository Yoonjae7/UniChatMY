import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  university: string
  pseudonym: string
  is_banned: boolean
  ban_reason?: string
  created_at: string
  last_active?: string
}

interface Report {
  id: string
  reason: string
  chat_context?: string
  status: string
  created_at: string
  admin_notes?: string
  reporter: { email: string; pseudonym: string; university: string }
  reported: { id: string; email: string; pseudonym: string; university: string; is_banned: boolean }
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBanned, setShowBanned] = useState<boolean | null>(null)
  const [adminSecret, setAdminSecret] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const { token } = useAuth()
  const navigate = useNavigate()

  const authenticate = () => {
    if (adminSecret) {
      localStorage.setItem('adminSecret', adminSecret)
      setIsAuthenticated(true)
    }
  }

  useEffect(() => {
    const savedSecret = localStorage.getItem('adminSecret')
    if (savedSecret) {
      setAdminSecret(savedSecret)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [activeTab, isAuthenticated, showBanned])

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Secret': adminSecret,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  })

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      if (activeTab === 'users') {
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (showBanned !== null) params.set('banned', showBanned.toString())
        
        const res = await fetch(`/api/admin/users?${params}`, {
          headers: getHeaders()
        })
        
        if (!res.ok) {
          if (res.status === 401) {
            setIsAuthenticated(false)
            localStorage.removeItem('adminSecret')
            throw new Error('Invalid admin credentials')
          }
          throw new Error('Failed to fetch users')
        }
        
        const data = await res.json()
        setUsers(data.users)
      } else {
        const res = await fetch('/api/admin/reports', {
          headers: getHeaders()
        })
        
        if (!res.ok) {
          if (res.status === 401) {
            setIsAuthenticated(false)
            localStorage.removeItem('adminSecret')
            throw new Error('Invalid admin credentials')
          }
          throw new Error('Failed to fetch reports')
        }
        
        const data = await res.json()
        setReports(data.reports)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async (userId: string, action: 'ban' | 'unban', reason?: string) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, action, reason })
      })

      if (!res.ok) throw new Error('Failed to update user')

      // Refresh data
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleReportAction = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reportId, status, adminNotes })
      })

      if (!res.ok) throw new Error('Failed to update report')

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-midnight-900 rounded-2xl p-8 border border-white/10"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Admin Access</h1>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Enter admin secret key"
            className="w-full px-4 py-3 bg-midnight-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan mb-4"
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
          />
          <button
            onClick={authenticate}
            className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Access Admin Panel
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 mt-3 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <header className="bg-midnight-900 border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛡️ UniChat Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminSecret')
              setIsAuthenticated(false)
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-neon-cyan text-black'
                : 'bg-midnight-800 text-gray-400 hover:text-white'
            }`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-neon-purple text-white'
                : 'bg-midnight-800 text-gray-400 hover:text-white'
            }`}
          >
            🚨 Reports ({reports.filter(r => r.status === 'pending').length} pending)
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search by email, name, or university..."
                className="flex-1 min-w-[200px] px-4 py-3 bg-midnight-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
              />
              <select
                value={showBanned === null ? 'all' : showBanned.toString()}
                onChange={(e) => setShowBanned(e.target.value === 'all' ? null : e.target.value === 'true')}
                className="px-4 py-3 bg-midnight-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="all">All Users</option>
                <option value="false">Active Only</option>
                <option value="true">Banned Only</option>
              </select>
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-neon-cyan text-black rounded-xl font-semibold hover:opacity-90"
              >
                Search
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-midnight-900 rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-midnight-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">University</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                        <td className="px-4 py-4">
                          <div className="font-medium">{user.pseudonym}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-400">{user.university}</td>
                        <td className="px-4 py-4">
                          {user.is_banned ? (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                              Banned
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {user.is_banned ? (
                            <button
                              onClick={() => handleBan(user.id, 'unban')}
                              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const reason = prompt('Ban reason (optional):')
                                handleBan(user.id, 'ban', reason || undefined)
                              }}
                              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                            >
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="text-center text-gray-500 py-8 bg-midnight-900 rounded-2xl border border-white/10">
                No reports yet 🎉
              </div>
            ) : (
              reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-midnight-900 rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        report.status === 'actioned' ? 'bg-red-500/20 text-red-400' :
                        report.status === 'dismissed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-midnight-800 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Reporter</div>
                      <div className="font-medium">{report.reporter?.pseudonym || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{report.reporter?.email}</div>
                      <div className="text-sm text-gray-500">{report.reporter?.university}</div>
                    </div>
                    <div className="p-4 bg-midnight-800 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Reported User</div>
                      <div className="font-medium flex items-center gap-2">
                        {report.reported?.pseudonym || 'Unknown'}
                        {report.reported?.is_banned && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">BANNED</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{report.reported?.email}</div>
                      <div className="text-sm text-gray-500">{report.reported?.university}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-midnight-800 rounded-xl mb-4">
                    <div className="text-sm text-gray-500 mb-1">Reason</div>
                    <div className="text-white">{report.reason}</div>
                    {report.chat_context && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-sm text-gray-500 mb-1">Chat Context</div>
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">{report.chat_context}</div>
                      </div>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const notes = prompt('Admin notes (optional):')
                          handleReportAction(report.id, 'actioned', notes || undefined)
                          if (report.reported?.id && !report.reported?.is_banned) {
                            if (confirm('Ban this user?')) {
                              handleBan(report.reported.id, 'ban', report.reason)
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Take Action
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'dismissed')}
                        className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'reviewed')}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
