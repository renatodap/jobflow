# JobFlow Clean Test Plan

## Test Coverage Requirements
- **Target Coverage**: 80% minimum
- **Current Coverage**: 0% (establishing baseline)
- **Test Framework**: Jest (Frontend), Pytest (Backend)

## Test Categories

### 1. Frontend Tests (Next.js/React)

#### Settings Page Tests (`app/settings/page.test.tsx`)
- [ ] User profile loading and display
- [ ] Profile update functionality
- [ ] Search settings configuration
- [ ] Job title add/remove
- [ ] Location add/remove
- [ ] Salary minimum validation
- [ ] Email frequency selection
- [ ] Search toggle activation
- [ ] Authentication redirect
- [ ] Error handling

#### Admin Page Tests (`app/admin/page.test.tsx`)
- [ ] Pending users display
- [ ] User approval flow
- [ ] User rejection flow
- [ ] Revenue calculations
- [ ] Stats display
- [ ] Authentication check
- [ ] Admin-only access

#### Landing Page Tests (`app/landing/page.test.tsx`)
- [ ] Component rendering
- [ ] Navigation links
- [ ] Call-to-action buttons
- [ ] Responsive design

#### API Route Tests
- [ ] `/api/settings` GET/PUT
- [ ] `/api/profile` GET/PATCH
- [ ] `/api/settings/toggle-search` POST
- [ ] `/api/admin/pending-approvals` GET
- [ ] `/api/admin/approve-user/[id]` POST
- [ ] `/api/auth/login` POST
- [ ] `/api/auth/signup` POST

### 2. Backend Tests (Python)

#### Email Delivery Service Tests (`test_email_job_delivery.py`)
- [ ] Get active users
- [ ] Search jobs for user preferences
- [ ] Generate email content
- [ ] Format job HTML
- [ ] Send email with attachments
- [ ] Process user jobs
- [ ] Run daily delivery
- [ ] Schedule deliveries

#### Job Aggregator Tests (`test_modular_job_aggregator.py`)
- [ ] Search jobs from multiple sources
- [ ] Deduplicate results
- [ ] Score job matches
- [ ] Filter by preferences
- [ ] Handle API failures

#### AI Content Generator Tests (`test_ai_content_generator.py`)
- [ ] Generate resume for job
- [ ] Generate cover letter
- [ ] Handle missing data
- [ ] Validate output format

### 3. Integration Tests

#### End-to-End Tests (`e2e/`)
- [ ] User signup → approval → settings → email delivery
- [ ] Admin approval workflow
- [ ] Job search and delivery pipeline
- [ ] Email generation and sending

## Test Implementation Priority

1. **Critical Path** (Must have for 80%):
   - Settings page functionality
   - Email delivery service
   - Job search aggregation
   - Admin approval flow

2. **Secondary** (Nice to have):
   - Landing page
   - Error edge cases
   - Performance tests

## Coverage Metrics

### Frontend Coverage Goals
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Backend Coverage Goals
- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

## Test Data Requirements

### Mock Data Files
- `__mocks__/users.json` - Sample user profiles
- `__mocks__/jobs.json` - Sample job listings
- `__mocks__/settings.json` - Sample user preferences

### Test Fixtures
- Authenticated user tokens
- Admin user tokens
- Pending approval users
- Active search users
- Sample job responses

## CI/CD Integration

### Pre-commit Hooks
```bash
npm test -- --coverage
pytest --cov=core --cov=backend
```

### GitHub Actions
- Run tests on PR
- Block merge if coverage < 80%
- Generate coverage reports

## Mock Usage Guidelines

Following TDD requirements:
- All mocks prefixed with "Mock"
- No mocks in production code
- Test file headers document mock usage
- Mocks only for external dependencies