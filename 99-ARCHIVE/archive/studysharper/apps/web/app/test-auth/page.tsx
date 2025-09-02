"use client"

import { useState } from 'react'
import { createSupabaseClient, signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [email, setEmail] = useState('testuser@gmail.com')
  const [password, setPassword] = useState('password123')
  const [fullName, setFullName] = useState('Test User')
  const [result, setResult] = useState('')

  const testSupabaseClient = () => {
    const client = createSupabaseClient()
    console.log('🧪 Supabase client test:', client)
    setResult(`Supabase client created: ${!!client}`)
  }

  const testEmailSignUp = async () => {
    try {
      console.log('🧪 Testing email signup...')
      const result = await signUpWithEmail(email, password, fullName)
      console.log('🧪 Signup result:', result)
      setResult(`Signup successful: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      console.error('🧪 Signup error:', error)
      setResult(`Signup error: ${error.message}`)
    }
  }

  const testEmailSignIn = async () => {
    try {
      console.log('🧪 Testing email signin...')
      const result = await signInWithEmail(email, password)
      console.log('🧪 Signin result:', result)
      setResult(`Signin successful: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      console.error('🧪 Signin error:', error)
      setResult(`Signin error: ${error.message}`)
    }
  }

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 Testing Google auth...')
      const result = await signInWithGoogle()
      console.log('🧪 Google auth result:', result)
      setResult(`Google auth initiated: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      console.error('🧪 Google auth error:', error)
      setResult(`Google auth error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
          <CardDescription>
            Test authentication functions directly with debugging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Email:</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label>Password:</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label>Full Name:</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={testSupabaseClient}>Test Supabase Client</Button>
            <Button onClick={testGoogleAuth}>Test Google Auth</Button>
            <Button onClick={testEmailSignUp}>Test Email Signup</Button>
            <Button onClick={testEmailSignIn}>Test Email Signin</Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result || 'No tests run yet...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}