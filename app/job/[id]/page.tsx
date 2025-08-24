'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Copy, ExternalLink, CheckCircle, FileText, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface ApplicationKit {
  jobId: string
  resume: {
    version: string
    content: string
    downloadUrl: string
  }
  coverLetter: {
    content: string
  }
  outreach: {
    linkedinMessage: string
    email: string
  }
  checklist: string[]
  generatedAt: string
}

export default function JobDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobId = params.id as string
  const hasKit = searchParams.get('kit') === 'generated'
  
  const [job, setJob] = useState<Job | null>(null)
  const [kit, setKit] = useState<ApplicationKit | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)

  useEffect(() => {
    loadJobDetails()
    if (hasKit) {
      loadApplicationKit()
    }
  }, [jobId, hasKit])

  const loadJobDetails = async () => {
    try {
      // Load all jobs and find the specific one
      const response = await fetch('/api/jobs')
      const data = await response.json()
      
      const foundJob = data.jobs?.find((j: Job) => j.id === jobId)
      if (foundJob) {
        setJob(foundJob)
      }
    } catch (error) {
      console.error('Error loading job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadApplicationKit = () => {
    try {
      const savedKit = localStorage.getItem(`kit-${jobId}`)
      if (savedKit) {
        setKit(JSON.parse(savedKit))
      }
    } catch (error) {
      console.error('Error loading application kit:', error)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span>Loading job details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
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
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-600">{job.company} • {job.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Job Details</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Score:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {job.score}/100
                </span>
              </div>
              <div>
                <span className="font-medium">Salary:</span>
                <span className="ml-2">${job.salary_min?.toLocaleString()}{job.salary_max && job.salary_max !== job.salary_min ? ` - $${job.salary_max.toLocaleString()}` : ''}</span>
              </div>
              <div>
                <span className="font-medium">Posted:</span>
                <span className="ml-2">{job.days_old === 0 ? 'Today' : `${job.days_old} days ago`}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={() => window.open(job.url, '_blank')}
                className="w-full flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Original Job
              </Button>
            </div>

            {!kit && (
              <div className="mt-4">
                <Button 
                  onClick={async () => {
                    const response = await fetch('/api/generate-kit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ jobId })
                    })
                    const data = await response.json()
                    if (data.success) {
                      setKit(data.kit)
                      localStorage.setItem(`kit-${jobId}`, JSON.stringify(data.kit))
                    }
                  }}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate Application Kit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Application Kit */}
        {kit && (
          <div className="lg:col-span-2 space-y-6">
            {/* Resume */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Resume</h3>
                <Button
                  onClick={() => copyToClipboard(kit.resume.content, 'resume')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedText === 'resume' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-md p-4 text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {kit.resume.content}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cover Letter</h3>
                <Button
                  onClick={() => copyToClipboard(kit.coverLetter.content, 'cover-letter')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedText === 'cover-letter' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap">
                {kit.coverLetter.content}
              </div>
            </div>

            {/* Outreach Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    LinkedIn Message
                  </h3>
                  <Button
                    onClick={() => copyToClipboard(kit.outreach.linkedinMessage, 'linkedin')}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === 'linkedin' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap">
                  {kit.outreach.linkedinMessage}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Follow-up
                  </h3>
                  <Button
                    onClick={() => copyToClipboard(kit.outreach.email, 'email')}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === 'email' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap">
                  {kit.outreach.email}
                </div>
              </div>
            </div>

            {/* Application Checklist */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Application Checklist</h3>
              <div className="space-y-2">
                {kit.checklist.map((task, index) => (
                  <label key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={completedTasks.includes(index)}
                      onChange={() => toggleTask(index)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`text-sm ${completedTasks.includes(index) ? 'line-through text-gray-500' : ''}`}>
                      {task}
                    </span>
                    {completedTasks.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Progress: {completedTasks.length}/{kit.checklist.length} tasks completed
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}