'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react'

export default function SignupPage() {
  const [step, setStep] = useState(1) // 1: Form, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Move to payment step
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment setup failed')
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkout_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">JobFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Job Search</h1>
          <p className="text-gray-600">
            Join JobFlow and apply to 10-20 jobs daily in 2 minutes each
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
            <div className={`h-px w-8 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className={`h-px w-8 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                {step >= 3 ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">Setup</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Step 1: Account Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="San Francisco, CA"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="text-center space-y-6">
              <div>
                <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h2>
                <p className="text-gray-600">
                  Start receiving 20 AI-generated job opportunities daily
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$15</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>20 jobs delivered daily</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>AI-generated application materials</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>LinkedIn outreach templates</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Manual approval & quality guarantee</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center justify-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                {loading ? 'Setting up payment...' : 'Continue to Payment'}
              </Button>

              <p className="text-xs text-gray-500">
                Secure payment powered by Stripe • Cancel anytime
              </p>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600">
                  Your account is pending approval. You'll receive an email when approved.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>1. Complete your profile setup</p>
                  <p>2. Wait for manual approval (usually within 24 hours)</p>
                  <p>3. Start receiving 20 job opportunities daily</p>
                </div>
              </div>

              <Link href="/profile/setup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg">
                  Complete Profile Setup
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-2">Trusted by ambitious job seekers</p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
            <span>🔒 Secure & Private</span>
            <span>⚡ Fast Setup</span>
            <span>💰 85% Profit Margin</span>
          </div>
        </div>
      </div>
    </div>
  )
}