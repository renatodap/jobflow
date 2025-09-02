"use client"

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const [envCheck, setEnvCheck] = useState<any>({})
  const [supabaseTest, setSupabaseTest] = useState<any>({})

  useEffect(() => {
    // Check environment variables (client-side)
    setEnvCheck({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      nodeEnv: process.env.NODE_ENV,
    })

    // Test Supabase client
    testSupabaseClient()
  }, [])

  const testSupabaseClient = async () => {
    try {
      const supabase = createSupabaseClient()
      
      if (!supabase) {
        setSupabaseTest({ error: 'Supabase client could not be created' })
        return
      }

      // Test basic connectivity
      const { data, error } = await supabase.auth.getSession()
      
      setSupabaseTest({
        clientCreated: true,
        sessionCheck: !error,
        error: error?.message,
        hasSession: !!data.session,
        userEmail: data.session?.user?.email
      })
    } catch (error: any) {
      setSupabaseTest({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
            <CardDescription>
              Verify that required environment variables are available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                  <Badge variant={envCheck.supabaseUrl ? "default" : "destructive"}>
                    {envCheck.supabaseUrl ? "✅ Set" : "❌ Missing"}
                  </Badge>
                </p>
                <p className="flex items-center gap-2">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <Badge variant={envCheck.supabaseAnonKey ? "default" : "destructive"}>
                    {envCheck.supabaseAnonKey ? "✅ Set" : "❌ Missing"}
                  </Badge>
                </p>
                <p className="flex items-center gap-2">
                  <span>NEXT_PUBLIC_SITE_URL:</span>
                  <Badge variant="outline">{envCheck.siteUrl}</Badge>
                </p>
                <p className="flex items-center gap-2">
                  <span>NODE_ENV:</span>
                  <Badge variant="outline">{envCheck.nodeEnv}</Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
            <CardDescription>
              Test if Supabase client can connect and authenticate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span>Client Created:</span>
                <Badge variant={supabaseTest.clientCreated ? "default" : "destructive"}>
                  {supabaseTest.clientCreated ? "✅ Yes" : "❌ No"}
                </Badge>
              </p>
              <p className="flex items-center gap-2">
                <span>Session Check:</span>
                <Badge variant={supabaseTest.sessionCheck ? "default" : "destructive"}>
                  {supabaseTest.sessionCheck ? "✅ Success" : "❌ Failed"}
                </Badge>
              </p>
              {supabaseTest.hasSession && (
                <p className="flex items-center gap-2">
                  <span>Current User:</span>
                  <Badge variant="default">{supabaseTest.userEmail}</Badge>
                </p>
              )}
              {supabaseTest.error && (
                <p className="text-red-600 text-sm">Error: {supabaseTest.error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {!envCheck.supabaseUrl && (
                <p className="text-red-600">❌ Add NEXT_PUBLIC_SUPABASE_URL to Vercel environment variables</p>
              )}
              {!envCheck.supabaseAnonKey && (
                <p className="text-red-600">❌ Add NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables</p>
              )}
              {supabaseTest.error && (
                <p className="text-red-600">❌ Supabase connection failed: {supabaseTest.error}</p>
              )}
              {envCheck.supabaseUrl && envCheck.supabaseAnonKey && supabaseTest.clientCreated && (
                <p className="text-green-600">✅ All environment variables are set correctly!</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}