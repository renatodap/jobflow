/**
 * InlineEdit Component Tests
 * This test file uses mocks prefixed with "Mock" as required by TDD rules
 * Tests the inline editing functionality for profile fields
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { InlineEdit } from '../InlineEdit'

describe('InlineEdit Component', () => {
  const mockOnSave = jest.fn()
  
  const defaultProps = {
    label: 'Full Name',
    value: 'John Doe',
    fieldName: 'full_name',
    onSave: mockOnSave,
    placeholder: 'Enter your name',
    type: 'text' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays value in view mode by default', () => {
    render(<InlineEdit {...defaultProps} />)
    
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows placeholder when value is empty', () => {
    render(<InlineEdit {...defaultProps} value="" />)
    
    expect(screen.getByText('Enter your name')).toBeInTheDocument()
    expect(screen.getByText('Enter your name')).toHaveClass('text-gray-400')
  })

  it('enters edit mode when clicked', () => {
    render(<InlineEdit {...defaultProps} />)
    
    const valueDisplay = screen.getByText('John Doe')
    fireEvent.click(valueDisplay)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('John Doe')
  })

  it('shows save button when value changes', async () => {
    const user = userEvent.setup()
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Type new value
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Jane Smith')
    
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('does not show save button when value unchanged', () => {
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Save button should not appear yet
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('calls onSave when save button clicked', async () => {
    const user = userEvent.setup()
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Type new value
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Jane Smith')
    
    // Click save
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('full_name', 'Jane Smith')
    })
  })

  it('exits edit mode after saving', async () => {
    const user = userEvent.setup()
    mockOnSave.mockResolvedValueOnce(true)
    
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Type new value and save
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Jane Smith')
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  it('shows cancel button in edit mode', () => {
    render(<InlineEdit {...defaultProps} />)
    
    fireEvent.click(screen.getByText('John Doe'))
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('cancels edit on cancel button click', () => {
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('cancels edit on Escape key', () => {
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByText('John Doe'))
    
    // Press Escape
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('handles textarea type correctly', () => {
    render(<InlineEdit {...defaultProps} type="textarea" />)
    
    fireEvent.click(screen.getByText('John Doe'))
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('handles number type correctly', async () => {
    const user = userEvent.setup()
    render(<InlineEdit {...defaultProps} type="number" value="100" />)
    
    fireEvent.click(screen.getByText('100'))
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
    
    await user.clear(input)
    await user.type(input, '200')
    
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('full_name', '200')
    })
  })

  it('shows loading state while saving', async () => {
    const user = userEvent.setup()
    mockOnSave.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    )
    
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode and change value
    fireEvent.click(screen.getByText('John Doe'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Jane Smith')
    
    // Click save
    fireEvent.click(screen.getByText('Save'))
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('handles save error gracefully', async () => {
    const user = userEvent.setup()
    mockOnSave.mockRejectedValueOnce(new Error('Save failed'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<InlineEdit {...defaultProps} />)
    
    // Enter edit mode and change value
    fireEvent.click(screen.getByText('John Doe'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Jane Smith')
    
    // Click save
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
      expect(screen.getByRole('textbox')).toBeInTheDocument() // Should stay in edit mode
    })
    
    consoleSpy.mockRestore()
  })

  it('validates email format for email type', async () => {
    const user = userEvent.setup()
    render(<InlineEdit {...defaultProps} type="email" value="test@example.com" />)
    
    fireEvent.click(screen.getByText('test@example.com'))
    
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'invalid-email')
    
    expect(screen.getByText('Save')).toBeDisabled()
    expect(screen.getByText('Invalid email format')).toBeInTheDocument()
  })

  it('validates URL format for URL type', async () => {
    const user = userEvent.setup()
    render(<InlineEdit {...defaultProps} type="url" value="https://example.com" />)
    
    fireEvent.click(screen.getByText('https://example.com'))
    
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'not-a-url')
    
    expect(screen.getByText('Save')).toBeDisabled()
    expect(screen.getByText('Invalid URL format')).toBeInTheDocument()
  })
})