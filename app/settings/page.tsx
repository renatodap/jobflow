'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Search,
  Bell,
  Check,
  LogOut,
  Save,
  AlertCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  location: string
  linkedin: string
  github: string
  website: string
  approved: boolean
  subscription_status: 'trial' | 'active' | 'expired'
  search_active: boolean
}

interface SearchSettings {
  job_titles: string[]
  locations: string[]
  min_salary: number
  remote_only: boolean
  job_types: string[]
  email_frequency: 'daily' | 'twice_daily' | 'weekly'
  max_jobs_per_email: number
  include_resume: boolean
  include_cover_letter: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    approved: false,
    subscription_status: 'trial',
    search_active: false
  })

  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    job_titles: [],
    locations: [],
    min_salary: 0,
    remote_only: false,
    job_types: ['full-time'],
    email_frequency: 'daily',
    max_jobs_per_email: 20,
    include_resume: true,
    include_cover_letter: true
  })

  const [newJobTitle, setNewJobTitle] = useState('')
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Load profile
      const profileResponse = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to load profile')
      }

      const profileData = await profileResponse.json()
      setProfile(profileData)

      // Load search settings
      const settingsResponse = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSearchSettings(settingsData)
      }

    } catch (error) {
      console.error('Settings error:', error)
      setMessage('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          github: profile.github,
          website: profile.website
        })
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setMessage('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchSettings)
      })

      if (response.ok) {
        setMessage('Search settings updated successfully!')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleSearchActive = async () => {
    if (!profile.approved || profile.subscription_status !== 'active') {
      setMessage('Active subscription required to enable job search')
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/settings/toggle-search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !profile.search_active })
      })

      if (response.ok) {
        setProfile({ ...profile, search_active: !profile.search_active })
        setMessage(profile.search_active ? 'Job search paused' : 'Job search activated!')
      }
    } catch (error) {
      setMessage('Failed to toggle search status')
    }
  }

  const addJobTitle = () => {
    if (newJobTitle && !searchSettings.job_titles.includes(newJobTitle)) {
      setSearchSettings({
        ...searchSettings,
        job_titles: [...searchSettings.job_titles, newJobTitle]
      })
      setNewJobTitle('')
    }
  }

  const removeJobTitle = (title: string) => {
    setSearchSettings({
      ...searchSettings,
      job_titles: searchSettings.job_titles.filter(t => t !== title)
    })
  }

  const addLocation = () => {
    if (newLocation && !searchSettings.locations.includes(newLocation)) {
      setSearchSettings({
        ...searchSettings,
        locations: [...searchSettings.locations, newLocation]
      })
      setNewLocation('')
    }
  }

  const removeLocation = (location: string) => {
    setSearchSettings({
      ...searchSettings,
      locations: searchSettings.locations.filter(l => l !== location)
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/landing')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobFlow Settings</h1>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Banner */}
        {!profile.approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Account Pending Approval</h3>
                <p className="text-sm text-yellow-700">Your account is under review. Job search will begin once approved.</p>
              </div>
            </div>
          </div>
        )}

        {profile.approved && profile.subscription_status === 'active' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile.search_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Search className={`w-6 h-6 ${
                    profile.search_active ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Job Search Status</h3>
                  <p className="text-sm text-gray-600">
                    {profile.search_active ? 'Actively searching for jobs' : 'Job search paused'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={toggleSearchActive}
                className={profile.search_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {profile.search_active ? 'Pause Search' : 'Activate Search'}
              </Button>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, State"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
              <input
                type="url"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Search Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Preferences
          </h2>
          
          {/* Job Titles */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Titles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addJobTitle()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer"
              />
              <Button onClick={addJobTitle} className="bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchSettings.job_titles.map((title) => (
                <span key={title} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {title}
                  <button onClick={() => removeJobTitle(title)} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
              <Button onClick={addLocation} className="bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchSettings.locations.map((location) => (
                <span key={location} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {location}
                  <button onClick={() => removeLocation(location)} className="ml-2 text-green-600 hover:text-green-800">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
              <input
                type="number"
                value={searchSettings.min_salary}
                onChange={(e) => setSearchSettings({ ...searchSettings, min_salary: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jobs per Email</label>
              <select
                value={searchSettings.max_jobs_per_email}
                onChange={(e) => setSearchSettings({ ...searchSettings, max_jobs_per_email: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 jobs</option>
                <option value={20}>20 jobs</option>
                <option value={30}>30 jobs</option>
                <option value={50}>50 jobs</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={searchSettings.remote_only}
                onChange={(e) => setSearchSettings({ ...searchSettings, remote_only: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Remote positions only</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={searchSettings.include_resume}
                onChange={(e) => setSearchSettings({ ...searchSettings, include_resume: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Include tailored resume in email</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={searchSettings.include_cover_letter}
                onChange={(e) => setSearchSettings({ ...searchSettings, include_cover_letter: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">Include cover letter in email</span>
            </label>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Search Settings'}
          </Button>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Email Preferences
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Frequency</label>
            <select
              value={searchSettings.email_frequency}
              onChange={(e) => setSearchSettings({ ...searchSettings, email_frequency: e.target.value as 'daily' | 'twice_daily' | 'weekly' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily (9 AM)</option>
              <option value="twice_daily">Twice Daily (9 AM & 5 PM)</option>
              <option value="weekly">Weekly (Mondays 9 AM)</option>
            </select>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}