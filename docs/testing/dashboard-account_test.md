# Dashboard and Account Testing Specification

## Test Requirements

### Dashboard Page Tests

#### Component Tests
1. **JobCard Component**
   - Displays job title, company, location
   - Shows truncated description (max 200 chars)
   - Renders all 5 status checkboxes
   - Shows download buttons for resume and cover letter
   - Displays relevance score

2. **Status Management**
   - Default status is "pending" when job loaded
   - Only one status can be selected at a time
   - Status change triggers API call
   - UI updates optimistically
   - Handles API errors gracefully

3. **Document Generation**
   - Resume download button triggers generation
   - Cover letter download button triggers generation
   - Shows loading state during generation
   - Downloads file when complete
   - Handles generation errors

#### Integration Tests
1. **Dashboard Load**
   - Fetches user's jobs from API
   - Displays loading state
   - Renders job cards when loaded
   - Shows empty state if no jobs

2. **Status Persistence**
   - Status changes save to database
   - Refreshing page maintains status
   - Concurrent updates handled correctly

### Account Page Tests

#### Component Tests
1. **Inline Edit Fields**
   - Field shows current value or placeholder
   - Click enables edit mode
   - Save button appears on change
   - Save button triggers API call
   - Success indicator shows after save
   - Field returns to view mode after save

2. **Field Validation**
   - Email format validation
   - URL format validation for LinkedIn/GitHub
   - Salary must be positive number
   - Required fields show error if empty

3. **Preference Checkboxes**
   - Checkboxes maintain state
   - Changes trigger save
   - Multiple selections allowed for job types

#### Integration Tests
1. **Profile Load**
   - Fetches user profile from API
   - Pre-fills all fields with existing data
   - Email field is read-only

2. **Field Updates**
   - Individual field updates save to database
   - Optimistic updates with rollback on error
   - Concurrent edits don't conflict

3. **Notes Field**
   - Free-form text accepts any input
   - Saves large text content
   - Preserves formatting

### Navigation Tests
1. **Menu Navigation**
   - Menu visible on both pages
   - Active page highlighted
   - Navigation preserves unsaved changes warning
   - Redirect to login if not authenticated

### Authentication Tests
1. **Protected Routes**
   - Redirect to login if no session
   - Valid session shows dashboard
   - Admin users have additional options

## Test Implementation Plan

### Unit Tests (Jest + React Testing Library)
```typescript
// __tests__/components/JobCard.test.tsx
describe('JobCard', () => {
  it('renders job information')
  it('handles status change')
  it('triggers resume download')
  it('triggers cover letter download')
})

// __tests__/components/InlineEdit.test.tsx
describe('InlineEdit', () => {
  it('enters edit mode on click')
  it('shows save button on change')
  it('saves on button click')
  it('cancels on escape key')
})
```

### Integration Tests (Playwright)
```typescript
// e2e/dashboard.spec.ts
test('user can manage job applications', async ({ page }) => {
  // Login
  // Navigate to dashboard
  // Change job status
  // Download resume
  // Verify persistence
})

// e2e/account.spec.ts
test('user can update profile', async ({ page }) => {
  // Login
  // Navigate to account
  // Edit field
  // Save change
  // Verify persistence
})
```

### Mock Data Structure
```typescript
// __mocks__/jobData.ts
export const mockJob = {
  id: 'test-job-1',
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'Remote',
  salary_min: 100000,
  salary_max: 150000,
  description: 'Join our team...',
  score: 85,
  status: 'pending'
}

// __mocks__/profileData.ts
export const mockProfile = {
  id: 'test-user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  current_title: 'Developer',
  skills: 'JavaScript, React, Node.js',
  ai_notes: 'Only music-related jobs'
}
```

## Coverage Requirements
- Minimum 80% code coverage
- All critical paths tested
- Error states handled
- Edge cases covered

## Test Execution Order
1. Write component tests first (TDD)
2. Implement components to pass tests
3. Write integration tests
4. Verify end-to-end functionality
5. Measure coverage and add missing tests