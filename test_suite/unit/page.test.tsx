/**
 * Settings Page Test Suite
 * 
 * This test file uses mocks for:
 * - MockRouter: Next.js navigation
 * - MockLocalStorage: Browser storage
 * - MockFetch: API responses
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './page'

// Mock user data
const mockUserProfile = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: '555-0123',
  location: 'San Francisco, CA',
  linkedin: 'https://linkedin.com/in/testuser',
  github: 'https://github.com/testuser',
  website: 'https://testuser.com',
  approved: true,
  subscription_status: 'active',
  search_active: false,
}

const mockSearchSettings = {
  job_titles: ['Software Engineer', 'Full Stack Developer'],
  locations: ['San Francisco, CA', 'Remote'],
  min_salary: 100000,
  remote_only: false,
  job_types: ['full-time'],
  email_frequency: 'daily',
  max_jobs_per_email: 20,
  include_resume: true,
  include_cover_letter: true,
}

describe('SettingsPage', () => {
  beforeEach(() => {
    // Setup localStorage
    localStorage.getItem.mockReturnValue('mock-token')
    
    // Setup fetch responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserProfile),
        })
      }
      if (url.includes('/api/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchSettings),
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  describe('Authentication', () => {
    it('redirects to login if no token', async () => {
      localStorage.getItem.mockReturnValue(null)
      const mockPush = jest.fn()
      require('next/navigation').useRouter.mockReturnValue({ push: mockPush })
      
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('loads user data when authenticated', async () => {
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer mock-token' },
        })
      )
    })
  })

  describe('Profile Management', () => {
    it('displays user profile information', async () => {
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
        expect(screen.getByDisplayValue('555-0123')).toBeInTheDocument()
        expect(screen.getByDisplayValue('San Francisco, CA')).toBeInTheDocument()
      })
    })

    it('updates profile information', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('Test User')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      
      const saveButton = screen.getByRole('button', { name: /save profile/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/profile',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token',
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('Updated Name'),
          })
        )
      })
      
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
    })
  })

  describe('Search Settings', () => {
    it('displays job titles and locations', async () => {
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
        expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
        expect(screen.getByText('Remote')).toBeInTheDocument()
      })
    })

    it('adds new job title', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      })
      
      const input = screen.getByPlaceholderText('e.g., Software Engineer')
      await user.type(input, 'Backend Developer')
      
      const addButton = screen.getAllByRole('button', { name: /add/i })[0]
      await user.click(addButton)
      
      expect(screen.getByText('Backend Developer')).toBeInTheDocument()
    })

    it('removes job title', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      })
      
      const removeButtons = screen.getAllByText('×')
      await user.click(removeButtons[0])
      
      expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
    })

    it('updates minimum salary', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('100000')).toBeInTheDocument()
      })
      
      const salaryInput = screen.getByDisplayValue('100000')
      await user.clear(salaryInput)
      await user.type(salaryInput, '120000')
      
      expect(salaryInput).toHaveValue(120000)
    })

    it('toggles remote only preference', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/remote positions only/i)).toBeInTheDocument()
      })
      
      const checkbox = screen.getByLabelText(/remote positions only/i)
      await user.click(checkbox)
      
      expect(checkbox).toBeChecked()
    })

    it('saves search settings', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      
      const saveButton = screen.getByRole('button', { name: /save search settings/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/settings',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token',
              'Content-Type': 'application/json',
            }),
          })
        )
      })
      
      expect(screen.getByText(/search settings updated successfully/i)).toBeInTheDocument()
    })
  })

  describe('Search Activation', () => {
    it('shows active search status for approved users', async () => {
      const activeProfile = { ...mockUserProfile, search_active: true }
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(activeProfile),
          })
        }
        if (url.includes('/api/settings')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSearchSettings),
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/actively searching for jobs/i)).toBeInTheDocument()
      })
    })

    it('toggles search activation', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /activate search/i })).toBeInTheDocument()
      })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ active: true }),
      })
      
      const toggleButton = screen.getByRole('button', { name: /activate search/i })
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/settings/toggle-search',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ active: true }),
          })
        )
      })
    })

    it('shows pending approval message for unapproved users', async () => {
      const unapprovedProfile = { ...mockUserProfile, approved: false }
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(unapprovedProfile),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchSettings),
        })
      })
      
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/account pending approval/i)).toBeInTheDocument()
      })
    })
  })

  describe('Email Preferences', () => {
    it('updates email frequency', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email frequency/i)).toBeInTheDocument()
      })
      
      const select = screen.getByLabelText(/email frequency/i)
      await user.selectOptions(select, 'weekly')
      
      expect(select).toHaveValue('weekly')
    })

    it('updates jobs per email count', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/jobs per email/i)).toBeInTheDocument()
      })
      
      const select = screen.getByLabelText(/jobs per email/i)
      await user.selectOptions(select, '30')
      
      expect(select).toHaveValue('30')
    })
  })

  describe('Error Handling', () => {
    it('displays error when profile fails to load', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument()
      })
    })

    it('displays error when save fails', async () => {
      const user = userEvent.setup()
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      })
      
      global.fetch.mockRejectedValueOnce(new Error('Save failed'))
      
      const saveButton = screen.getByRole('button', { name: /save profile/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument()
      })
    })
  })

  describe('Logout', () => {
    it('handles logout correctly', async () => {
      const user = userEvent.setup()
      const mockPush = jest.fn()
      require('next/navigation').useRouter.mockReturnValue({ push: mockPush })
      
      render(<SettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
      })
      
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockPush).toHaveBeenCalledWith('/landing')
    })
  })
})