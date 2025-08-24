'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  Mail, 
  Users, 
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  approved: boolean
  subscription_status: 'trial' | 'active' | 'expired'
  searches_remaining?: number
  trial_ends_at?: string
}

interface Stats {
  totalJobs: number
  appliedToday: number
  responseRate: number
  topScore: number
  lastJobsReceived: string
  profileCompletion: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    appliedToday: 0,
    responseRate: 0,
    topScore: 0,
    lastJobsReceived: '',
    profileCompletion: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Get user profile
      const profileResponse = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to load profile')
      }

      const userData = await profileResponse.json()
      setUser(userData)

      // Get dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

    } catch (err) {
      console.error('Dashboard error:', err)
      if (err instanceof Error && err.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        setError('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/landing')
  }

  const getStatusDisplay = () => {
    if (!user) return null

    if (!user.approved) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Account Pending Approval</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is under review. You'll receive an email when approved. 
                This usually takes 24 hours or less.
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (user.subscription_status === 'trial') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Trial Account</h3>
                <p className="text-sm text-blue-700">
                  {user.searches_remaining || 0} searches remaining
                </p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </Button>
          </div>
        </div>
      )
    }

    if (user.subscription_status === 'expired') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Subscription Expired</h3>
                <p className="text-sm text-red-700">
                  Renew your subscription to continue receiving job opportunities
                </p>
              </div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              Renew Now
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Account Active</h3>
            <p className="text-sm text-green-700">
              You're receiving 20 job opportunities daily
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobFlow Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Display */}
        {getStatusDisplay()}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jobs Found</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applied Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appliedToday}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileCompletion}%</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/jobs">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Search and filter job opportunities</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/applications">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Applications</h3>
                  <p className="text-sm text-gray-600">Monitor your application status</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/outreach">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Outreach Center</h3>
                  <p className="text-sm text-gray-600">LinkedIn messages and networking</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        </div>

        {/* Last Jobs Received */}
        {stats.lastJobsReceived && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Last Jobs Received</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{stats.lastJobsReceived}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Your daily job opportunities were delivered this morning. 
              Check your email for the complete list with application kits.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Today's Jobs
            </Button>
          </div>
        )}

        {/* Pro Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 text-blue-600 mr-2" />
            Pro Tips for Success
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-gray-700">Apply to jobs with score 90+ first for best results</span>
            </div>
            <div className="flex items-start space-x-3">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-gray-700">Send LinkedIn messages within 24 hours of applying</span>
            </div>
            <div className="flex items-start space-x-3">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-gray-700">Follow up after 3, 7, and 14 days for best response rates</span>
            </div>
            <div className="flex items-start space-x-3">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-gray-700">Complete your profile setup to improve job matching accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}