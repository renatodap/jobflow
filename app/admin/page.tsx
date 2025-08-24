'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface PendingUser {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  created_at: string
  subscription_status: string
}

interface AdminStats {
  totalUsers: number
  pendingApprovals: number
  monthlyRevenue: number
  approvedThisMonth: number
}

export default function AdminPage() {
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    approvedThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Load pending approvals
      const response = await fetch('/api/admin/pending-approvals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 403) {
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load admin data')
      }

      const data = await response.json()
      setPendingUsers(data.pending_users || [])
      setStats({
        totalUsers: data.total_users || 0,
        pendingApprovals: data.pending_users?.length || 0,
        monthlyRevenue: data.monthly_revenue || 0,
        approvedThisMonth: data.approved_this_month || 0
      })

    } catch (err) {
      console.error('Admin error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        approvedThisMonth: prev.approvedThisMonth + 1,
        monthlyRevenue: prev.monthlyRevenue + 15
      }))

    } catch (err) {
      console.error('Approve error:', err)
      alert('Failed to approve user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }))

    } catch (err) {
      console.error('Reject error:', err)
      alert('Failed to reject user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobFlow Admin Panel</h1>
                <p className="text-sm text-gray-600">User management and revenue tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={checkAdminAccess}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedThisMonth}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              Pending User Approvals ({pendingUsers.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve new user signups. Each approval generates $15 MRR.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending approvals at this time.</p>
              </div>
            ) : (
              pendingUsers.map((user) => (
                <div key={user.id} className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                          <p className="text-sm text-gray-600">
                            Signed up {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{user.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.subscription_status === 'active' ? 'Paid Subscriber' : 'Trial User'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve (+$15 MRR)
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Tracking */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            Revenue Tracking
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Month</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Users:</span>
                  <span className="font-medium">{stats.approvedThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue:</span>
                  <span className="font-medium text-green-600">${stats.monthlyRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Revenue:</span>
                  <span className="font-medium text-blue-600">${pendingUsers.length * 15}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Projections</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">If all approved:</span>
                  <span className="font-medium">${stats.monthlyRevenue + (pendingUsers.length * 15)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit margin (85%):</span>
                  <span className="font-medium text-green-600">
                    ${Math.round((stats.monthlyRevenue + (pendingUsers.length * 15)) * 0.85)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}