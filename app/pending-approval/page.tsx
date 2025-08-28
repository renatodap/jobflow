'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PendingApprovalPage() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get user email from localStorage or session
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      setEmail(userEmail)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-gray-600">
            Your account is being reviewed by our team
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            {/* Status Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                  <span>We'll review your application within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                  <span>You'll receive an email once approved</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                  <span>Then you can set up your job preferences and start receiving opportunities</span>
                </li>
              </ul>
            </div>

            {/* Email Reminder */}
            {email && (
              <div className="text-center text-sm text-gray-600">
                <Mail className="w-4 h-4 inline mr-2" />
                We'll notify you at: <span className="font-medium">{email}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Log Out
              </Button>
              <Link href="/landing" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-gray-600"
                >
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Have questions? Contact us at{' '}
                <a href="mailto:support@jobflow.ai" className="text-blue-600 hover:underline">
                  support@jobflow.ai
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Why Manual Approval */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 We manually review each account to ensure quality and prevent abuse
          </p>
        </div>
      </div>
    </div>
  )
}