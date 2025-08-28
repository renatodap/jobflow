/**
 * JobCard Component Tests
 * This test file uses mocks prefixed with "Mock" as required by TDD rules
 * Tests the job card display and interaction functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JobCard } from '../JobCard'
import { MockJob, MockApplication } from '@/__mocks__/jobData'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('JobCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders job information correctly', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText(/\$100,000 - \$150,000/)).toBeInTheDocument()
    expect(screen.getByText(/Score: 85/)).toBeInTheDocument()
  })

  it('shows truncated description', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    const description = screen.getByTestId('job-description')
    expect(description.textContent?.length).toBeLessThanOrEqual(200)
  })

  it('renders all status checkboxes', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    expect(screen.getByLabelText('Pending')).toBeInTheDocument()
    expect(screen.getByLabelText('Applied')).toBeInTheDocument()
    expect(screen.getByLabelText('Interview')).toBeInTheDocument()
    expect(screen.getByLabelText('Rejected')).toBeInTheDocument()
    expect(screen.getByLabelText('Accepted')).toBeInTheDocument()
  })

  it('has pending status checked by default', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={{ ...MockApplication, status: 'pending' }}
        onStatusChange={jest.fn()}
      />
    )

    const pendingCheckbox = screen.getByLabelText('Pending') as HTMLInputElement
    expect(pendingCheckbox.checked).toBe(true)
  })

  it('handles status change correctly', async () => {
    const onStatusChange = jest.fn()
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={onStatusChange}
      />
    )

    const appliedCheckbox = screen.getByLabelText('Applied')
    fireEvent.click(appliedCheckbox)

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(MockApplication.id, 'applied')
    })
  })

  it('shows download resume button', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    expect(screen.getByText('Download Resume')).toBeInTheDocument()
  })

  it('shows download cover letter button', () => {
    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    expect(screen.getByText('Download Cover Letter')).toBeInTheDocument()
  })

  it('triggers resume download when button clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob(['resume content'], { type: 'text/plain' }))
    })

    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    const downloadButton = screen.getByText('Download Resume')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate/resume'),
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  it('triggers cover letter download when button clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob(['cover letter content'], { type: 'text/plain' }))
    })

    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    const downloadButton = screen.getByText('Download Cover Letter')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate/cover-letter'),
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  it('shows loading state during download', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    const downloadButton = screen.getByText('Download Resume')
    fireEvent.click(downloadButton)

    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('handles download error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Download failed'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <JobCard 
        job={MockJob} 
        application={MockApplication}
        onStatusChange={jest.fn()}
      />
    )

    const downloadButton = screen.getByText('Download Resume')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})