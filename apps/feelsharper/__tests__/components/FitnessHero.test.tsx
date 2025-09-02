/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import FitnessHero from '@/components/home/FitnessHero'

describe('FitnessHero', () => {
  it('renders the hero section with correct messaging', () => {
    render(<FitnessHero />)
    
    expect(screen.getByText('Feel')).toBeInTheDocument()
    expect(screen.getByText('Sharper')).toBeInTheDocument()
    expect(screen.getByText(/Track food, workouts, and weight/)).toBeInTheDocument()
    expect(screen.getByText(/Completely free/)).toBeInTheDocument()
  })

  it('shows free messaging instead of premium', () => {
    render(<FitnessHero />)
    
    expect(screen.getByText('Free fitness tracking that works')).toBeInTheDocument()
    expect(screen.getByText('No subscriptions')).toBeInTheDocument()
    expect(screen.getByText('No ads')).toBeInTheDocument()
    expect(screen.getByText('Just fitness tracking')).toBeInTheDocument()
    
    // Should NOT have premium messaging
    expect(screen.queryByText('Start Free Trial')).not.toBeInTheDocument()
    expect(screen.queryByText('Premium')).not.toBeInTheDocument()
  })

  it('has proper call-to-action buttons', () => {
    render(<FitnessHero />)
    
    expect(screen.getByText('Start Tracking')).toBeInTheDocument()
    expect(screen.getByText('View Demo')).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(<FitnessHero />)
    
    expect(screen.getByText('Food Logging')).toBeInTheDocument()
    expect(screen.getByText('Workout Tracking')).toBeInTheDocument()
    expect(screen.getByText('Progress Insights')).toBeInTheDocument()
  })
})