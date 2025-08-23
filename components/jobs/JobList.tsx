import { MapPin, DollarSign, Calendar, ExternalLink, FileText, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatSalary, daysAgoText, getScoreColor } from '@/lib/utils'

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

interface JobListProps {
  jobs: Job[]
  onGenerateKit: (jobId: string) => void
  onQuickApply: (jobId: string) => void
}

export default function JobList({ jobs, onGenerateKit, onQuickApply }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs found. Run a new search to discover opportunities!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div 
          key={job.id} 
          className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreColor(job.score)}`}>
                  Score: {job.score}
                </span>
                {job.days_old === 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    NEW
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 font-medium mb-3">{job.company}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {daysAgoText(job.days_old)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {job.description}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => onQuickApply(job.id)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Quick Apply
                </Button>
                <Button 
                  onClick={() => onGenerateKit(job.id)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate Kit
                </Button>
                <Button 
                  onClick={() => window.location.href = `/outreach?job=${job.id}`}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Find Contacts
                </Button>
              </div>
            </div>
            
            {job.applied && (
              <div className="ml-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  Applied ✓
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}