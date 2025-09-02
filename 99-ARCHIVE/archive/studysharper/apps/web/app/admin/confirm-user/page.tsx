"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmUserPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const confirmUser = async () => {
    if (!email) {
      setResult('Please enter an email address')
      return
    }

    try {
      setIsLoading(true)
      
      // Use the service role key to manually confirm users
      const response = await fetch('/api/admin/confirm-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`User ${email} confirmed successfully!`)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const listUsers = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin/list-users')
      const data = await response.json()
      
      if (response.ok) {
        setResult(`Users:\n${JSON.stringify(data.users, null, 2)}`)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin: Confirm Users</CardTitle>
          <CardDescription>
            Manually confirm users for development (bypasses email confirmation)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Email to confirm:</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={confirmUser} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Confirm User'}
            </Button>
            <Button 
              onClick={listUsers} 
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'List All Users'}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result || 'No actions performed yet...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}