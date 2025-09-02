'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Trash2
} from 'lucide-react'
import { PDFUpload } from './pdf-upload'
import { ProcessingStatus } from './processing-status'
import { useAcademic } from '@/hooks/use-academic'
import type { ContentSource, ProcessingJob } from '@/types/content'

interface ContentSourceWithJobs extends ContentSource {
  processing_jobs: ProcessingJob[]
  chunk_count: number
  subjects?: {
    id: string
    name: string
    courses: {
      id: string
      name: string
      terms: {
        id: string
        name: string
        schools: {
          id: string
          name: string
        }
      }
    }
  }
}

export function ContentIngestion() {
  const { subjects } = useAcademic()
  const [sources, setSources] = useState<ContentSourceWithJobs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showProcessing, setShowProcessing] = useState<string | null>(null)

  const loadSources = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/content/upload')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load content sources')
      }

      setSources(data.sources || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (sourceId: string) => {
    setShowUpload(false)
    setShowProcessing(sourceId)
    loadSources()
  }

  const handleProcessingComplete = () => {
    setShowProcessing(null)
    loadSources()
  }

  const deleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/content/sources?id=${sourceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete content')
      }

      setSources(prev => prev.filter(s => s.id !== sourceId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete content')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'failed': return XCircle
      case 'processing': return Clock
      default: return FileText
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProcessingProgress = (jobs: ProcessingJob[]) => {
    if (jobs.length === 0) return 0
    
    const totalJobs = jobs.length
    const completedJobs = jobs.filter(job => job.status === 'completed').length
    const processingJobs = jobs.filter(job => job.status === 'processing')
    
    let totalProgress = 0
    jobs.forEach(job => {
      if (job.status === 'completed') {
        totalProgress += 100
      } else if (job.status === 'processing') {
        totalProgress += job.progress
      }
    })
    
    return Math.round(totalProgress / totalJobs)
  }

  useEffect(() => {
    loadSources()
  }, [])

  if (showUpload) {
    return (
      <PDFUpload
        subjects={subjects}
        onUploadComplete={handleUploadComplete}
        onCancel={() => setShowUpload(false)}
      />
    )
  }

  if (showProcessing) {
    return (
      <ProcessingStatus
        sourceId={showProcessing}
        onComplete={handleProcessingComplete}
        onCancel={() => setShowProcessing(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Your Content Library</h2>
          <p className="text-sm text-muted-foreground">
            {sources.length} document{sources.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sources.filter(s => s.status === 'processing').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Search</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sources.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Content Uploaded</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Upload your first PDF document to start building your AI-powered study library.
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Your First PDF
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => {
            const StatusIcon = getStatusIcon(source.status)
            const progress = getProcessingProgress(source.processing_jobs)
            
            return (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <CardTitle className="text-base">{source.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>{formatDate(source.created_at)}</span>
                          {source.subjects && (
                            <>
                              <span>•</span>
                              <span>{source.subjects.name}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(source.status)}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {source.status}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Processing Progress for ongoing jobs */}
                    {source.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Processing Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProcessing(source.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                    
                    {/* Success info */}
                    {source.status === 'completed' && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Successfully processed into {source.chunk_count} searchable chunks
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to search/chat with this document
                            console.log('Navigate to chat with document:', source.id)
                          }}
                        >
                          Ask Questions
                        </Button>
                      </div>
                    )}
                    
                    {/* Error info */}
                    {source.status === 'failed' && (
                      <div className="space-y-2">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Processing failed. Check the details or try uploading again.
                          </AlertDescription>
                        </Alert>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProcessing(source.id)}
                        >
                          View Error Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}