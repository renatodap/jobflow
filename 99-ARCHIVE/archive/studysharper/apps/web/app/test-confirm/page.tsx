"use client"

import { useState } from 'react'
import { signInWithEmail } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestConfirmPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testSignIn = async () => {
    try {
      setIsLoading(true)
      setResult('Testing sign in...')
      
      const result = await signInWithEmail(email, password)
      
      setResult(`Sign in successful! User: ${result.user?.email}`)
      
    } catch (error: any) {
      setResult(`Sign in failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmUserManually = async () => {
    try {
      setIsLoading(true)
      setResult('Confirming user...')
      
      const response = await fetch('/api/admin/confirm-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`User confirmed! Now try signing in.`)
      } else {
        setResult(`Confirmation failed: ${data.error}`)
      }
    } catch (error) {
      setResult(`Confirmation error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test User Confirmation</CardTitle>
          <CardDescription>
            Confirm users manually and test sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Email:</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label>Password:</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={confirmUserManually}
              disabled={isLoading || !email}
              className="w-full"
            >
              1. Confirm User Email
            </Button>
            
            <Button 
              onClick={testSignIn}
              disabled={isLoading || !email || !password}
              className="w-full"
              variant="outline"
            >
              2. Test Sign In
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result || 'No actions performed yet...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}