import { getNavigationItems, getMenuItems, quickActions } from '@/lib/navigation/routes'

describe('Navigation Routes', () => {
  describe('getNavigationItems', () => {
    it('returns correct items for authenticated users', () => {
      const items = getNavigationItems(true)
      
      const itemNames = items.map(item => item.name)
      expect(itemNames).toContain('Today')
      expect(itemNames).toContain('Food')
      expect(itemNames).toContain('Workouts')
      expect(itemNames).toContain('Weight')
      expect(itemNames).toContain('Insights')
      expect(itemNames).toContain('Account')
      
      // Should not contain auth items for authenticated users
      expect(itemNames).not.toContain('Sign In')
      expect(itemNames).not.toContain('Sign Up')
    })

    it('returns correct items for unauthenticated users', () => {
      const items = getNavigationItems(false)
      
      const itemNames = items.map(item => item.name)
      expect(itemNames).toContain('Sign In')
      expect(itemNames).toContain('Sign Up')
      expect(itemNames).toContain('Home')
      expect(itemNames).toContain('Blog')
      expect(itemNames).toContain('About')
      
      // Should not contain auth-required items
      expect(itemNames).not.toContain('Today')
      expect(itemNames).not.toContain('Food')
    })
  })

  describe('quickActions', () => {
    it('contains fitness-focused actions', () => {
      expect(quickActions).toHaveLength(3)
      
      const labels = quickActions.map(action => action.label)
      expect(labels).toContain('Log Food')
      expect(labels).toContain('Log Workout')
      expect(labels).toContain('Add Weight')
    })

    it('has correct hrefs for fitness actions', () => {
      const foodAction = quickActions.find(action => action.label === 'Log Food')
      const workoutAction = quickActions.find(action => action.label === 'Log Workout')
      const weightAction = quickActions.find(action => action.label === 'Add Weight')

      expect(foodAction?.href).toBe('/food/add')
      expect(workoutAction?.href).toBe('/workouts/add')
      expect(weightAction?.href).toBe('/weight/add')
    })

    it('uses appropriate semantic colors', () => {
      const foodAction = quickActions.find(action => action.label === 'Log Food')
      const workoutAction = quickActions.find(action => action.label === 'Log Workout')
      const weightAction = quickActions.find(action => action.label === 'Add Weight')

      expect(foodAction?.color).toBe('bg-success')
      expect(workoutAction?.color).toBe('bg-navy')
      expect(weightAction?.color).toBe('bg-info')
    })
  })
})