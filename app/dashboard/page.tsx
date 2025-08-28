'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { JobCard } from './JobCard'
import { Loader2, Briefcase } from 'lucide-react'

interface Job {
  id: string
  job_id: string
  title: string
  company: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  description: string | null
  score: number
  days_old: number | null
  source: string
}

interface Application {
  id: string
  job_id: string
  status: string
  job?: Job
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchApplications()
  }, [router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      setApplications(data.applications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )
    } catch (err) {
      console.error('Error updating status:', err)
      // Optionally show error to user
    }
  }

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your job applications and download tailored materials
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your opportunities...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No job opportunities yet
            </h3>
            <p className="text-gray-600">
              Your personalized job matches will appear here once our system finds them.
              <br />
              Make sure to complete your profile in the Account section.
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && applications.length > 0 && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {applications.map((application) => {
              if (!application.job) return null
              return (
                <JobCard
                  key={application.id}
                  job={application.job}
                  application={application}
                  onStatusChange={handleStatusChange}
                />
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && applications.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(a => a.status === 'applied').length}
                </p>
                <p className="text-sm text-gray-600">Applied</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {applications.filter(a => a.status === 'interview').length}
                </p>
                <p className="text-sm text-gray-600">Interviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'accepted').length}
                </p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}