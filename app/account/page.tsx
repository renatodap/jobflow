'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { InlineEdit } from './InlineEdit'
import { Card } from '@/components/ui/card'
import { Loader2, User, Briefcase, GraduationCap, Code, Settings, Mail, Bell } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  current_title: string | null
  years_experience: number | null
  education: string | null
  work_experience: string | null
  projects: string | null
  skills: string | null
  certifications: string | null
  ai_notes: string | null
}

interface SearchSettings {
  job_titles: string[]
  locations: string[]
  min_salary: number
  max_salary: number | null
  remote_only: boolean
  job_types: string[]
  email_frequency: string
  max_jobs_per_email: number
  include_resume: boolean
  include_cover_letter: boolean
  exclude_companies: string[]
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<SearchSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [router])

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const profileData = await profileResponse.json()
      setProfile(profileData.profile)

      // Fetch settings
      const settingsResponse = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async (fieldName: string, value: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [fieldName]: value })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, [fieldName]: value } : null)
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      return false
    }
  }

  const handleSettingSave = async (fieldName: string, value: string): Promise<boolean> => {
    try {
      // Parse value based on field type
      let parsedValue: any = value
      if (fieldName === 'job_titles' || fieldName === 'locations' || fieldName === 'exclude_companies') {
        parsedValue = value.split(',').map(s => s.trim()).filter(Boolean)
      } else if (fieldName === 'remote_only' || fieldName === 'include_resume' || fieldName === 'include_cover_letter') {
        parsedValue = value === 'true'
      } else if (fieldName === 'min_salary' || fieldName === 'max_salary' || fieldName === 'max_jobs_per_email') {
        parsedValue = parseInt(value)
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [fieldName]: parsedValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      // Update local state
      setSettings(prev => prev ? { ...prev, [fieldName]: parsedValue } : null)
      return true
    } catch (err) {
      console.error('Error updating settings:', err)
      return false
    }
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading your profile...</span>
        </div>
      </PrivateLayout>
    )
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </PrivateLayout>
    )
  }

  if (!profile) {
    return (
      <PrivateLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No profile found</p>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account & Preferences</h1>
          <p className="mt-2 text-gray-600">
            Configure your profile and job search preferences
          </p>
        </div>

        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <InlineEdit
              label="Full Name"
              value={profile.full_name}
              fieldName="full_name"
              onSave={handleProfileSave}
              placeholder="Enter your full name"
              required
            />
            <InlineEdit
              label="Email"
              value={profile.email}
              fieldName="email"
              onSave={handleProfileSave}
              type="email"
              readOnly
            />
            <InlineEdit
              label="Phone"
              value={profile.phone}
              fieldName="phone"
              onSave={handleProfileSave}
              placeholder="Enter your phone number"
            />
            <InlineEdit
              label="Location"
              value={profile.location}
              fieldName="location"
              onSave={handleProfileSave}
              placeholder="City, State or Country"
            />
            <InlineEdit
              label="LinkedIn URL"
              value={profile.linkedin}
              fieldName="linkedin"
              onSave={handleProfileSave}
              placeholder="https://linkedin.com/in/yourprofile"
              type="url"
            />
            <InlineEdit
              label="GitHub URL"
              value={profile.github}
              fieldName="github"
              onSave={handleProfileSave}
              placeholder="https://github.com/yourusername"
              type="url"
            />
            <InlineEdit
              label="Personal Website"
              value={profile.website}
              fieldName="website"
              onSave={handleProfileSave}
              placeholder="https://yourwebsite.com"
              type="url"
            />
          </div>
        </Card>

        {/* Professional Background */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">Professional Background</h2>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InlineEdit
                label="Current Title"
                value={profile.current_title}
                fieldName="current_title"
                onSave={handleProfileSave}
                placeholder="e.g., Software Engineer"
              />
              <InlineEdit
                label="Years of Experience"
                value={profile.years_experience}
                fieldName="years_experience"
                onSave={handleProfileSave}
                placeholder="0"
                type="number"
              />
            </div>
            <InlineEdit
              label="Work Experience"
              value={profile.work_experience}
              fieldName="work_experience"
              onSave={handleProfileSave}
              placeholder="List your work experience (Company, Role, Duration, Key achievements)"
              type="textarea"
            />
            <InlineEdit
              label="Projects"
              value={profile.projects}
              fieldName="projects"
              onSave={handleProfileSave}
              placeholder="Describe your key projects (Name, Technologies, Description, Link)"
              type="textarea"
            />
          </div>
        </Card>

        {/* Education & Skills */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">Education & Skills</h2>
          </div>
          <div className="space-y-4">
            <InlineEdit
              label="Education"
              value={profile.education}
              fieldName="education"
              onSave={handleProfileSave}
              placeholder="List your education (University, Degree, Year)"
              type="textarea"
            />
            <InlineEdit
              label="Technical Skills"
              value={profile.skills}
              fieldName="skills"
              onSave={handleProfileSave}
              placeholder="List your skills (Languages, Frameworks, Tools, etc.)"
              type="textarea"
            />
            <InlineEdit
              label="Certifications"
              value={profile.certifications}
              fieldName="certifications"
              onSave={handleProfileSave}
              placeholder="List your certifications"
              type="textarea"
            />
          </div>
        </Card>

        {/* AI Customization */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Code className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">AI Customization</h2>
          </div>
          <InlineEdit
            label="Special Instructions / Notes"
            value={profile.ai_notes}
            fieldName="ai_notes"
            onSave={handleProfileSave}
            placeholder="Add any special requirements or preferences (e.g., 'Only music-related software jobs', 'Prefer startups', 'No consulting firms')"
            type="textarea"
          />
          <p className="text-sm text-gray-500 mt-2">
            These notes help our AI better understand your preferences and filter jobs accordingly.
          </p>
        </Card>

        {/* Search Preferences */}
        {settings && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Job Search Preferences</h2>
            </div>
            <div className="space-y-4">
              <InlineEdit
                label="Target Job Titles"
                value={settings.job_titles.join(', ')}
                fieldName="job_titles"
                onSave={handleSettingSave}
                placeholder="e.g., Software Engineer, Full Stack Developer, Frontend Engineer"
                type="textarea"
              />
              <InlineEdit
                label="Preferred Locations"
                value={settings.locations.join(', ')}
                fieldName="locations"
                onSave={handleSettingSave}
                placeholder="e.g., San Francisco, Remote, New York"
                type="textarea"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <InlineEdit
                  label="Minimum Salary ($)"
                  value={settings.min_salary}
                  fieldName="min_salary"
                  onSave={handleSettingSave}
                  placeholder="0"
                  type="number"
                />
                <InlineEdit
                  label="Maximum Salary ($)"
                  value={settings.max_salary}
                  fieldName="max_salary"
                  onSave={handleSettingSave}
                  placeholder="No limit"
                  type="number"
                />
              </div>
              <InlineEdit
                label="Companies to Exclude"
                value={settings.exclude_companies.join(', ')}
                fieldName="exclude_companies"
                onSave={handleSettingSave}
                placeholder="e.g., Company A, Company B"
                type="textarea"
              />
            </div>
          </Card>
        )}

        {/* Delivery Preferences */}
        {settings && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Delivery Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Frequency
                  </label>
                  <select
                    value={settings.email_frequency}
                    onChange={(e) => handleSettingSave('email_frequency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <InlineEdit
                  label="Max Jobs per Email"
                  value={settings.max_jobs_per_email}
                  fieldName="max_jobs_per_email"
                  onSave={handleSettingSave}
                  placeholder="20"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.remote_only}
                    onChange={(e) => handleSettingSave('remote_only', e.target.checked.toString())}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Remote positions only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.include_resume}
                    onChange={(e) => handleSettingSave('include_resume', e.target.checked.toString())}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Include tailored resume with each job</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.include_cover_letter}
                    onChange={(e) => handleSettingSave('include_cover_letter', e.target.checked.toString())}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Include tailored cover letter with each job</span>
                </label>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PrivateLayout>
  )
}