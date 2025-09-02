"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createSupabaseClient } from '@/lib/supabase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function ConfirmPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const supabase = createSupabaseClient()
        if (!supabase) {
          throw new Error('Supabase client not available')
        }

        // Get the token from URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const urlParams = searchParams
        
        const token = hashParams.get('token') || urlParams.get('token')
        const type = hashParams.get('type') || urlParams.get('type')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (type === 'signup' && token) {
          // Email confirmation flow
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          })

          if (error) {
            throw error
          }

          if (data.user) {
            setStatus('success')
            setMessage('Your email has been confirmed! You can now sign in.')
            
            // Redirect to dashboard after successful confirmation
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else if (accessToken && refreshToken) {
          // Direct token-based authentication (fallback)
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            throw error
          }

          if (data.user) {
            setStatus('success')
            setMessage('Successfully authenticated! Redirecting to your dashboard.')
            
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          throw new Error('Invalid confirmation link or missing parameters')
        }

      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        
        if (error.message?.includes('expired')) {
          setMessage('This confirmation link has expired. Please request a new one.')
        } else if (error.message?.includes('invalid')) {
          setMessage('Invalid confirmation link. Please try signing up again.')
        } else {
          setMessage('Failed to confirm your email. Please try again or contact support.')
        }
      }
    }

    confirmEmail()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Confirming Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Email Confirmed!</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Confirmation Failed</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Back to Home
          </Button>
          <Button onClick={() => router.push('/auth')} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  )
}