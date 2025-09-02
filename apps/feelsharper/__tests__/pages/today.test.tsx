/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import TodayPage from '@/app/today/page'

describe('Today Page', () => {
  it('renders the Today page', () => {
    render(<TodayPage />)
    
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getAllByText('Log Food')).toHaveLength(2)
    expect(screen.getAllByText('Log Workout')).toHaveLength(2)
    expect(screen.getAllByText('Add Weight')).toHaveLength(2)
  })

  it('shows empty states for all sections', () => {
    render(<TodayPage />)
    
    expect(screen.getByText("No meals logged yet")).toBeInTheDocument()
    expect(screen.getByText("No workout logged yet")).toBeInTheDocument()
    expect(screen.getByText("No weight logged yet")).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<TodayPage />)
    
    const foodLinks = screen.getAllByText('Log Food')
    const workoutLinks = screen.getAllByText('Log Workout') 
    const weightLinks = screen.getAllByText('Add Weight')
    
    expect(foodLinks.length).toBeGreaterThan(0)
    expect(workoutLinks.length).toBeGreaterThan(0) 
    expect(weightLinks.length).toBeGreaterThan(0)
  })
})