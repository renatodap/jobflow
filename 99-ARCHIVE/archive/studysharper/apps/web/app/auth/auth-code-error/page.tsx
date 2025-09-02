"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { Suspense } from 'react'

function AuthCodeErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Sorry, we couldn't sign you in. There was an error processing your authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700"><strong>Error:</strong> {error}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            This could be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Missing environment variables on Vercel</li>
              <li>Incorrect Google OAuth redirect URLs</li>
              <li>An expired or invalid authentication code</li>
              <li>A network connection issue</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-700">
              <strong>Quick Fix:</strong> If this is on production (vercel.app), check that environment variables are set in Vercel dashboard.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push('/auth')}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/debug')}>
              Debug Environment
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}