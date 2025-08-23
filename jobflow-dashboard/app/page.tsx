'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Clock, Target, TrendingUp, Zap, Mail, Users, ChevronRight } from 'lucide-react'
import JobList from '@/components/jobs/JobList'
import QuickStats from '@/components/dashboard/QuickStats'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedToday: 0,
    responseRate: 0,
    topScore: 0
  })

  useEffect(() => {
    // Load jobs from CSV data
    loadJobsFromCSV()
  }, [])

  const loadJobsFromCSV = async () => {
    try {
      // For now, use mock data - will connect to Python API later
      const mockJobs = [
        {
          id: '1',
          job_hash: '54f17196d017',
          score: 100,
          title: 'Software Engineer, 2025 New Grad',
          company: 'Whatnot',
          location: 'San Francisco, CA',
          salary_min: 130000,
          salary_max: 140000,
          days_old: 0,
          url: 'https://www.adzuna.com/details/5362965053',
          description: 'Join the Future of Commerce with Whatnot!',
          discovered_at: new Date().toISOString(),
          applied: false
        },
        {
          id: '2',
          job_hash: 'c12b77f1f470',
          score: 100,
          title: 'Machine Learning Engineer Graduate',
          company: 'TikTok',
          location: 'San Jose, CA',
          salary_min: 108315,
          salary_max: 108315,
          days_old: 1,
          url: 'https://www.adzuna.com/details/5361501315',
          description: 'Machine Learning Engineer Graduate (E-Commerce)',
          discovered_at: new Date().toISOString(),
          applied: false
        },
        {
          id: '3',
          job_hash: '7c5e563b5821',
          score: 100,
          title: 'Entry-level Software Engineer',
          company: 'Cognizant',
          location: 'Tampa, FL',
          salary_min: 61197,
          salary_max: 75000,
          days_old: 0,
          url: 'https://www.adzuna.com/details/5363658645',
          description: 'Entry-level Software Engineer Position',
          discovered_at: new Date().toISOString(),
          applied: false
        }
      ]

      setJobs(mockJobs)
      setStats({
        totalJobs: mockJobs.length,
        appliedToday: 0,
        responseRate: 0,
        topScore: 100
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading jobs:', error)
      setLoading(false)
    }
  }

  const handleGenerateKit = async (jobId: string) => {
    console.log('Generating application kit for job:', jobId)
    // TODO: Call API to generate resume, cover letter, and outreach messages
  }

  const handleQuickApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      window.open(job.url, '_blank')
      // TODO: Mark as applied and track in system
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">JobFlow Dashboard</h1>
        <p className="text-gray-600">Apply to jobs in 2 minutes with AI-powered automation</p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Button 
          onClick={() => window.location.href = '/jobs'}
          className="flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Browse All Jobs
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/outreach'}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Outreach Center
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/applications'}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Track Applications
        </Button>
      </div>

      {/* Today's Top Jobs */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Today&apos;s Top Jobs</h2>
            <p className="text-gray-600 mt-1">Perfect matches found today - apply now!</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updated 5 minutes ago</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span>Loading jobs...</span>
            </div>
          </div>
        ) : (
          <JobList 
            jobs={jobs}
            onGenerateKit={handleGenerateKit}
            onQuickApply={handleQuickApply}
          />
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Pro Tips for Success
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Generate application kits for all score 100 jobs first</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Send LinkedIn messages within 24 hours of application</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Follow up after 3, 7, and 14 days for best response rates</span>
          </li>
        </ul>
      </div>
    </div>
  )
}