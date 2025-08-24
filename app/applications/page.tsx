'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, ExternalLink, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedDate: string
  status: 'applied' | 'reviewed' | 'interview' | 'rejected' | 'offer'
  lastUpdate: string
  jobUrl: string
  notes: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    // For demo purposes, show mock applications
    // In real implementation, this would load from tracking CSV or database
    const mockApplications: Application[] = [
      {
        id: '1',
        jobTitle: 'Software Engineer, 2025 New Grad',
        company: 'Whatnot',
        appliedDate: '2025-08-22',
        status: 'applied',
        lastUpdate: '2025-08-22',
        jobUrl: 'https://www.adzuna.com/details/5362965053',
        notes: 'Applied through company website. Generated custom cover letter.'
      },
      {
        id: '2',
        jobTitle: 'Machine Learning Engineer Graduate',
        company: 'TikTok',
        appliedDate: '2025-08-21',
        status: 'reviewed',
        lastUpdate: '2025-08-23',
        jobUrl: 'https://www.adzuna.com/details/5361501315',
        notes: 'HR confirmed receipt. Waiting for technical screening.'
      }
    ]
    
    setApplications(mockApplications)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'interview':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'offer':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4" />
      case 'reviewed':
        return <MessageSquare className="w-4 h-4" />
      case 'interview':
        return <Calendar className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'offer':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const daysSince = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['applied', 'reviewed'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-600">Monitor your job applications and their progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
          <div className="text-sm text-gray-600">Interviews</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.offers}</div>
          <div className="text-sm text-gray-600">Offers</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Applications</h2>
          <p className="text-gray-600 mt-1">Track the progress of your job applications</p>
        </div>
        
        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No applications tracked yet</p>
            <Button 
              onClick={() => window.location.href = '/jobs'}
              className="flex items-center gap-2 mx-auto"
            >
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{app.jobTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 font-medium mb-2">{app.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {formatDate(app.appliedDate)}
                      </span>
                      <span>
                        Last update: {daysSince(app.lastUpdate)}
                      </span>
                    </div>
                    
                    {app.notes && (
                      <p className="text-sm text-gray-600 mb-3 italic">{app.notes}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(app.jobUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Job
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newNotes = prompt('Add notes:', app.notes)
                          if (newNotes !== null) {
                            setApplications(prev => 
                              prev.map(a => 
                                a.id === app.id 
                                  ? { ...a, notes: newNotes, lastUpdate: new Date().toISOString().split('T')[0] }
                                  : a
                              )
                            )
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Add Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>• Follow up on applications older than 5 days</p>
          <p>• Send LinkedIn messages to hiring managers</p>
          <p>• Apply to 3-5 new jobs daily</p>
          <p>• Update application status after each interaction</p>
        </div>
      </div>
    </div>
  )
}