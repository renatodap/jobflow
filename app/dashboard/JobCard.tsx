'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, MapPin, DollarSign, Calendar, Trophy } from 'lucide-react'

interface JobCardProps {
  job: {
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
  application: {
    id: string
    status: string
  }
  onStatusChange: (applicationId: string, status: string) => void
}

export function JobCard({ job, application, onStatusChange }: JobCardProps) {
  const [downloading, setDownloading] = useState<'resume' | 'cover' | null>(null)
  const [currentStatus, setCurrentStatus] = useState(application.status)

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'applied', label: 'Applied', color: 'text-blue-600' },
    { value: 'interview', label: 'Interview', color: 'text-purple-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { value: 'accepted', label: 'Accepted', color: 'text-green-600' }
  ]

  const truncateDescription = (text: string | null, maxLength: number = 200) => {
    if (!text) return 'No description available'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
    }
    if (job.salary_min) {
      return `$${job.salary_min.toLocaleString()}+`
    }
    return `Up to $${job.salary_max?.toLocaleString()}`
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      setCurrentStatus(newStatus)
      onStatusChange(application.id, newStatus)
    }
  }

  const handleDownloadResume = async () => {
    setDownloading('resume')
    try {
      const response = await fetch('/api/generate/resume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ jobId: job.id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `resume_${job.company}_${job.title.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Failed to download resume')
      }
    } catch (error) {
      console.error('Error downloading resume:', error)
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadCoverLetter = async () => {
    setDownloading('cover')
    try {
      const response = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ jobId: job.id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `cover_letter_${job.company}_${job.title.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Failed to download cover letter')
      }
    } catch (error) {
      console.error('Error downloading cover letter:', error)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Job Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
        <p className="text-lg text-gray-700">{job.company}</p>
      </div>

      {/* Job Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        {job.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {job.location}
          </div>
        )}
        {formatSalary() && (
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {formatSalary()}
          </div>
        )}
        {job.days_old !== null && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {job.days_old === 0 ? 'Posted today' : `${job.days_old} days ago`}
          </div>
        )}
        <div className="flex items-center">
          <Trophy className="w-4 h-4 mr-1" />
          Score: {job.score}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4" data-testid="job-description">
        {truncateDescription(job.description)}
      </p>

      {/* Status Checkboxes */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Application Status:</p>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <label key={status.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`status-${application.id}`}
                value={status.value}
                checked={currentStatus === status.value}
                onChange={() => handleStatusChange(status.value)}
                className="mr-2"
                aria-label={status.label}
              />
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownloadResume}
          disabled={downloading === 'resume'}
          className="flex-1"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloading === 'resume' ? 'Generating...' : 'Download Resume'}
        </Button>
        <Button
          onClick={handleDownloadCoverLetter}
          disabled={downloading === 'cover'}
          className="flex-1"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloading === 'cover' ? 'Generating...' : 'Download Cover Letter'}
        </Button>
      </div>
    </Card>
  )
}