'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Zap, 
  Database,
  AlertCircle,
  RotateCcw,
  X
} from 'lucide-react'
import type { ProcessingJob } from '@/types/content'

interface ProcessingStatusProps {
  sourceId: string
  onComplete?: () => void
  onCancel?: () => void
  autoRefresh?: boolean
}

interface ProcessingState {
  loading: boolean
  error?: string
  overallStatus: 'processing' | 'completed' | 'failed'
  overallProgress: number
  currentJob?: ProcessingJob
  jobs: ProcessingJob[]
  chunkCount?: number
  estimatedCompletion?: string
}

const jobTypeLabels = {
  text_extraction: 'Extracting Text',
  chunking: 'Creating Chunks',
  embedding: 'Generating Embeddings'
}

const jobTypeIcons = {
  text_extraction: FileText,
  chunking: Zap,
  embedding: Database
}

export function ProcessingStatus({ 
  sourceId, 
  onComplete, 
  onCancel, 
  autoRefresh = true 
}: ProcessingStatusProps) {
  const [state, setState] = useState<ProcessingState>({
    loading: true,
    overallStatus: 'processing',
    overallProgress: 0,
    jobs: []
  })

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/content/status?source_id=${sourceId}`)
      const data = await response.json()

      if (!response.ok) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Failed to fetch status' 
        }))
        return
      }

      const status = data.status
      setState({
        loading: false,
        overallStatus: status.overall_status,
        overallProgress: status.overall_progress,
        currentJob: status.current_job,
        jobs: status.jobs,
        chunkCount: status.chunk_count,
        estimatedCompletion: status.estimated_completion
      })

      // Call completion callback if processing is done
      if (status.overall_status === 'completed' && onComplete) {
        onComplete()
      }

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      }))
    }
  }

  const handleAction = async (action: 'retry' | 'cancel') => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const response = await fetch('/api/content/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: sourceId, action })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action} processing`)
      }

      // Refresh status after action
      await fetchStatus()

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : `Failed to ${action}` 
      }))
    }
  }

  useEffect(() => {
    fetchStatus()

    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (state.overallStatus === 'processing') {
        fetchStatus()
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [sourceId, autoRefresh, state.overallStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'processing': return 'text-blue-600'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'failed': return XCircle
      case 'processing': return Loader2
      default: return Clock
    }
  }

  const formatTimeEstimate = (isoString?: string) => {
    if (!isoString) return null
    
    const estimate = new Date(isoString)
    const now = new Date()
    const diffMs = estimate.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Almost done'
    
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    if (diffMinutes < 1) return 'Less than a minute'
    if (diffMinutes === 1) return '1 minute remaining'
    return `${diffMinutes} minutes remaining`
  }

  if (state.loading && state.jobs.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {state.overallStatus === 'processing' && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            )}
            {state.overallStatus === 'completed' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {state.overallStatus === 'failed' && (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Processing Status
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {state.overallStatus === 'processing' && 'Processing your document...'}
          {state.overallStatus === 'completed' && 'Document processed successfully!'}
          {state.overallStatus === 'failed' && 'Processing encountered errors'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{state.overallProgress}%</span>
          </div>
          <Progress value={state.overallProgress} />
          {state.estimatedCompletion && (
            <p className="text-xs text-muted-foreground">
              {formatTimeEstimate(state.estimatedCompletion)}
            </p>
          )}
        </div>

        {/* Job Steps */}
        <div className="space-y-3">
          {state.jobs.map((job, index) => {
            const Icon = jobTypeIcons[job.job_type]
            const StatusIcon = getStatusIcon(job.status)
            
            return (
              <div key={job.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {jobTypeLabels[job.job_type]}
                    </p>
                    <div className="flex items-center space-x-2">
                      {job.status === 'processing' && (
                        <span className="text-xs text-muted-foreground">
                          {job.progress}%
                        </span>
                      )}
                      <StatusIcon 
                        className={`h-4 w-4 ${
                          job.status === 'processing' ? 'animate-spin' : ''
                        } ${getStatusColor(job.status)}`} 
                      />
                    </div>
                  </div>
                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="mt-1" />
                  )}
                  {job.error_message && (
                    <p className="text-xs text-red-600 mt-1">
                      {job.error_message}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Success Info */}
        {state.overallStatus === 'completed' && state.chunkCount && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully processed into {state.chunkCount} searchable chunks
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {state.overallStatus === 'failed' && (
            <Button 
              variant="outline" 
              onClick={() => handleAction('retry')}
              disabled={state.loading}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          
          {state.overallStatus === 'processing' && (
            <Button 
              variant="outline" 
              onClick={() => handleAction('cancel')}
              disabled={state.loading}
              className="flex-1"
            >
              Cancel Processing
            </Button>
          )}

          {state.overallStatus === 'completed' && onCancel && (
            <Button onClick={onCancel} className="flex-1">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}