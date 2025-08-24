'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import JobList from '@/components/jobs/JobList'

interface Job {
  id: string
  job_hash: string
  score: number
  title: string
  company: string
  location: string
  salary_min: number
  salary_max?: number
  days_old: number
  url: string
  description: string
  applied: boolean
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [minScore, setMinScore] = useState(80)
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'salary'>('score')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      
      if (data.jobs) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateKit = async (jobId: string) => {
    try {
      const response = await fetch('/api/generate-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem(`kit-${jobId}`, JSON.stringify(data.kit))
        window.location.href = `/job/${jobId}?kit=generated`
      } else {
        alert('Failed to generate application kit')
      }
    } catch (error) {
      console.error('Error generating kit:', error)
      alert('Failed to generate application kit')
    }
  }

  const handleQuickApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      window.open(job.url, '_blank')
    }
  }

  const filteredJobs = jobs
    .filter(job => 
      job.score >= minScore &&
      (searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'date':
          return a.days_old - b.days_old
        case 'salary':
          return b.salary_min - a.salary_min
        default:
          return 0
      }
    })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
          <h1 className="text-3xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-gray-600">Browse and apply to available positions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium">Min Score:</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value={50}>50+</option>
              <option value={70}>70+</option>
              <option value={80}>80+</option>
              <option value={90}>90+</option>
              <option value={95}>95+</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'salary')}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="score">Score</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span>Loading jobs...</span>
            </div>
          </div>
        ) : (
          <JobList 
            jobs={filteredJobs}
            onGenerateKit={handleGenerateKit}
            onQuickApply={handleQuickApply}
          />
        )}
      </div>
    </div>
  )
}