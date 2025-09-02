'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react'
import type { Subject } from '@/types/academic'

interface PDFUploadProps {
  subjects: Subject[]
  subjectId?: string
  onUploadComplete: (sourceId: string) => void
  onCancel?: () => void
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  sourceId?: string
}

export function PDFUpload({ subjects, subjectId, onUploadComplete, onCancel }: PDFUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSubject, setSelectedSubject] = useState(subjectId || '')
  const [title, setTitle] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setTitle(file.name.replace('.pdf', ''))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploadState.status === 'uploading'
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadState({ status: 'uploading', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      if (selectedSubject) {
        formData.append('subject_id', selectedSubject)
      }

      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total)
          setUploadState(prev => ({ ...prev, progress }))
        }
      })

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setUploadState({ 
            status: 'success', 
            progress: 100, 
            sourceId: response.source_id 
          })
          onUploadComplete(response.source_id)
        } else {
          const error = JSON.parse(xhr.responseText)
          setUploadState({ 
            status: 'error', 
            progress: 0, 
            error: error.error || 'Upload failed' 
          })
        }
      })

      xhr.addEventListener('error', () => {
        setUploadState({ 
          status: 'error', 
          progress: 0, 
          error: 'Network error during upload' 
        })
      })

      xhr.open('POST', '/api/content/upload')
      xhr.send(formData)

    } catch (error) {
      setUploadState({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setTitle('')
    setUploadState({ status: 'idle', progress: 0 })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (uploadState.status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="font-medium">Upload Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your PDF has been uploaded and processing has started.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetUpload} variant="outline">
                Upload Another
              </Button>
              {onCancel && (
                <Button onClick={onCancel}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload PDF Document
        </CardTitle>
        <CardDescription>
          Upload course materials, textbooks, or study documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Subject Selection */}
        {subjects.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
              disabled={uploadState.status === 'uploading'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No subject</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* File Upload Area */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop the PDF file here...</p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">
                  Drag & drop a PDF file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: 50MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {uploadState.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for this document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadState.status === 'uploading'}
              />
            </div>

            {/* Upload Progress */}
            {uploadState.status === 'uploading' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} />
              </div>
            )}

            {/* Error Display */}
            {uploadState.status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={uploadState.status === 'uploading'}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleUpload}
                disabled={!title.trim() || uploadState.status === 'uploading'}
                className="flex-1"
              >
                {uploadState.status === 'uploading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}