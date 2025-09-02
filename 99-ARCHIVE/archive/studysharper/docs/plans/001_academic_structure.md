# Plan: Academic Structure Management

## Scope
Implement the foundational academic hierarchy management system: Schools → Terms → Courses → Subjects.

## DB/API Deltas
- Tables already exist in initial migration
- Need RLS policies for multi-tenant isolation
- API routes for CRUD operations:
  - `/api/schools` - GET, POST, PUT, DELETE
  - `/api/terms` - GET, POST, PUT, DELETE  
  - `/api/courses` - GET, POST, PUT, DELETE
  - `/api/subjects` - GET, POST, PUT, DELETE

## UI Tasks
1. **Schools Management Page** (`/dashboard/schools`)
   - List all user's schools with search/filter
   - Add new school form (name, type dropdown)
   - Edit/delete existing schools
   - Empty state for new users

2. **Terms Management** (`/dashboard/schools/[id]/terms`) 
   - List terms for selected school
   - Create term form (name, start/end dates, active toggle)
   - Academic calendar view
   - Current term highlighting

3. **Courses Management** (`/dashboard/terms/[id]/courses`)
   - Grid/list view of courses
   - Rich course creation form (name, code, credits, color picker, syllabus upload)
   - Course cards with progress indicators
   - Drag-and-drop reordering

4. **Subjects Management** (`/dashboard/courses/[id]/subjects`)
   - Nested subject hierarchy
   - Quick add subjects inline
   - Reorder subjects with drag-and-drop
   - Subject completion tracking

5. **Navigation & Breadcrumbs**
   - Hierarchical navigation sidebar
   - Breadcrumb trail for deep navigation
   - Quick switcher for schools/terms/courses

## Acceptance Criteria
- [ ] User can create complete academic hierarchy in < 5 minutes
- [ ] All forms have proper validation and error handling
- [ ] Real-time updates reflect immediately in UI
- [ ] Mobile responsive design works on phones
- [ ] Keyboard navigation works throughout
- [ ] Loading states provide clear feedback
- [ ] Empty states guide user to first action
- [ ] Delete operations have confirmation dialogs
- [ ] Performance: < 500ms for CRUD operations
- [ ] RLS policies prevent cross-user data access

## Test Plan
### Unit Tests (Vitest)
- Form validation logic
- API route handlers  
- RLS policy enforcement
- Data transformation utilities

### E2E Tests (Playwright)
- Complete onboarding flow (school → term → course → subjects)
- CRUD operations for each entity
- Navigation between levels
- Error handling (network failures, validation errors)
- Multi-user isolation (negative RLS test)

### Visual Tests
- School management page (empty + populated states)
- Course creation form
- Subject hierarchy view
- Mobile responsive layouts

## Risks
- **Complexity**: Academic structures vary widely between institutions
- **Performance**: Deep hierarchies could impact load times
- **UX**: Too many clicks to get to actual studying

## Mitigation
- Start with US college/university standard structure
- Implement lazy loading for large hierarchies
- Provide templates for common academic structures
- Add quick actions for power users

## Rollback Plan
- Feature flags control academic structure UI
- Fallback to simple course list view
- Database schema remains backwards compatible

## Implementation Order
1. RLS policies and API routes
2. Schools management UI
3. Terms management with calendar view
4. Courses with rich metadata
5. Subjects with hierarchy support
6. Navigation and breadcrumbs
7. Performance optimizations
8. Testing and polish