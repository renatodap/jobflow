"use client"

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestGooglePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')

  const testGoogleAuth = async () => {
    try {
      setIsLoading(true)
      console.log('🧪 Testing Google OAuth directly...')
      
      const result = await signInWithGoogle()
      console.log('🧪 Google OAuth result:', result)
      
      setResult(`Google OAuth initiated successfully. Check if redirect happened.`)
      
    } catch (error: any) {
      console.error('🧪 Google OAuth error:', error)
      setResult(`Google OAuth error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Google OAuth Test</CardTitle>
          <CardDescription>
            Test Google OAuth directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testGoogleAuth} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : null}
            Test Google Sign In
          </Button>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result || 'No tests run yet...'}
            </pre>
          </div>

          <div className="text-sm text-gray-600">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p>Expected callback: {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}