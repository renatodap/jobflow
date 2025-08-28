'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, DollarSign, Users, Star, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">JobFlow</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Job Search from
            <span className="text-blue-600 block mt-2">30 Minutes to 2 Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Set your preferences once and receive perfectly matched job opportunities 
            with tailored resumes and cover letters delivered to your inbox daily. 
            No dashboards, no complexity - just opportunities.
          </p>
          
          {/* Pricing Highlight */}
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg mb-8">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-gray-900">Only $15/month</span>
            <span className="text-gray-600 ml-2">• 85% profit margin verified</span>
          </div>

          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save 93% of Your Time</h3>
              <p className="text-gray-600">
                From 30 minutes per application to just 2 minutes with AI automation
              </p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">20+ Jobs Daily</h3>
              <p className="text-gray-600">
                Receive perfectly matched opportunities with complete application kits
              </p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Generated Materials</h3>
              <p className="text-gray-600">
                Tailored resumes, cover letters, and LinkedIn messages for each job
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">AI Resume Generation</h3>
                    <p className="text-gray-600">11 specialized resume types tailored to each job</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Personalized Cover Letters</h3>
                    <p className="text-gray-600">Company-specific letters highlighting relevant experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">LinkedIn Outreach</h3>
                    <p className="text-gray-600">Connect with hiring managers and recruiters</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Daily Job Delivery</h3>
                    <p className="text-gray-600">20 best opportunities delivered via email</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Application Tracking</h3>
                    <p className="text-gray-600">Monitor status and manage your pipeline</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Success Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time per application</span>
                  <span className="font-semibold">2 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications per day</span>
                  <span className="font-semibold">10-20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response rate increase</span>
                  <span className="font-semibold text-green-600">+300%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interview rate</span>
                  <span className="font-semibold text-green-600">&gt;10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Simple, Transparent Pricing</h2>
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">JobFlow Pro</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                $15<span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Everything you need to accelerate your job search</p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">20 AI-generated job opportunities daily</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Unlimited resume & cover letter generation</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">LinkedIn outreach templates</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Application tracking & analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Manual approval & quality guarantee</span>
              </div>
            </div>
            
            <Link href="/signup">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg">
                Start Your Search Today
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              * Manual approval required • No free trial • Pay to get started
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold text-white">JobFlow</span>
          </div>
          <p className="text-gray-400 mb-6">
            AI-powered job search automation for ambitious professionals
          </p>
          <div className="space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
          </div>
          <p className="text-gray-500 mt-6 text-sm">
            © 2025 JobFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}