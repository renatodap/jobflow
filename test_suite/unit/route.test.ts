/**
 * Settings API Route Tests
 * 
 * This test file uses mocks for:
 * - MockRequest: Next.js request object
 * - MockResponse: Next.js response object
 */

import { NextRequest } from 'next/server'
import { GET, PUT } from './route'

describe('/api/settings', () => {
  describe('GET', () => {
    it('returns 401 when no authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('Authorization header required')
    })

    it('returns default settings when authorized', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        headers: {
          'authorization': 'Bearer test-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('job_titles')
      expect(data).toHaveProperty('locations')
      expect(data).toHaveProperty('min_salary')
      expect(data).toHaveProperty('remote_only')
      expect(data).toHaveProperty('email_frequency')
      expect(data.email_frequency).toBe('daily')
      expect(data.max_jobs_per_email).toBe(20)
    })

    it('handles errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        headers: {
          'authorization': 'Bearer test-token'
        }
      })
      
      // Mock console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Force an error by mocking JSON parsing
      jest.spyOn(global, 'JSON', 'get').mockImplementation(() => {
        throw new Error('Parse error')
      })
      
      const response = await GET(request)
      
      expect(consoleSpy).toHaveBeenCalled()
      
      // Restore mocks
      consoleSpy.mockRestore()
      jest.restoreAllMocks()
    })
  })

  describe('PUT', () => {
    it('returns 401 when no authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ job_titles: ['Engineer'] })
      })
      
      const response = await PUT(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('Authorization header required')
    })

    it('saves settings successfully', async () => {
      const settingsData = {
        job_titles: ['Software Engineer', 'Developer'],
        locations: ['San Francisco', 'Remote'],
        min_salary: 120000,
        remote_only: true,
        email_frequency: 'daily'
      }
      
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: {
          'authorization': 'Bearer test-token'
        },
        body: JSON.stringify(settingsData)
      })
      
      // Mock request.json()
      request.json = jest.fn().mockResolvedValue(settingsData)
      
      const response = await PUT(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Settings saved successfully')
    })

    it('logs settings data', async () => {
      const settingsData = {
        job_titles: ['Engineer'],
        min_salary: 100000
      }
      
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: {
          'authorization': 'Bearer test-token'
        }
      })
      
      request.json = jest.fn().mockResolvedValue(settingsData)
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      await PUT(request)
      
      expect(consoleSpy).toHaveBeenCalledWith('Saving settings:', settingsData)
      
      consoleSpy.mockRestore()
    })

    it('handles errors during save', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: {
          'authorization': 'Bearer test-token'
        }
      })
      
      // Mock request.json() to throw error
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const response = await PUT(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(consoleSpy).toHaveBeenCalledWith('Settings update error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })
})