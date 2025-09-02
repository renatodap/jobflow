'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  courseId: string
  onUploadComplete?: (result: any) => void
  className?: string
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  result?: any
}

export function FileUpload({ courseId, onUploadComplete, className }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [title, setTitle] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('courseId', courseId)
      if (title) formData.append('title', title)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'complete', progress: 100, result }
          : f
      ))

      onUploadComplete?.(result)

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ))
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadAll = () => {
    files
      .filter(f => f.status === 'pending')
      .forEach(uploadFile)
  }

  const retryFile = (file: UploadFile) => {
    uploadFile(file)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Upload Study Materials</CardTitle>
          <CardDescription>
            Upload PDFs, documents, or text files to add to your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your document a custom title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-primary">Drop your files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, TXT, MD, DOCX files up to 50MB
                </p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to upload ({files.length})</h4>
                <Button 
                  onClick={uploadAll}
                  disabled={!files.some(f => f.status === 'pending')}
                  size="sm"
                >
                  Upload All
                </Button>
              </div>

              {files.map((fileItem) => (
                <div key={fileItem.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {fileItem.status === 'complete' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {fileItem.status === 'error' && (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryFile(fileItem)}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                      {fileItem.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => uploadFile(fileItem)}
                        >
                          Upload
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {fileItem.status === 'uploading' && (
                    <Progress value={fileItem.progress} className="h-2" />
                  )}

                  {fileItem.status === 'error' && fileItem.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{fileItem.error}</AlertDescription>
                    </Alert>
                  )}

                  {fileItem.status === 'complete' && fileItem.result && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully processed! {fileItem.result.chunkCount} chunks created, 
                        ~{fileItem.result.estimatedReadingTime} min read time.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}