# Academic Structure Implementation Plan

**Plan ID:** 002
**Feature:** Complete Academic Structure UI & CRUD
**Priority:** CRITICAL PATH #1 
**Estimated Time:** 2-3 hours
**Started:** 2025-08-13 13:15 UTC

## Scope

Implement complete academic hierarchy management:
- Schools/Institutions creation & management
- Terms/Semesters with academic calendar
- Courses with metadata and settings
- Subjects for granular organization

## Database Schema Status

✅ **COMPLETE** - Schema already exists in migrations:
- `schools` table with user ownership
- `terms` table linked to schools  
- `courses` table linked to terms
- `subjects` table linked to courses
- Complete RLS policies for tenant isolation
- Proper indexes for performance

## API Requirements

### Server Actions Needed:

1. **School Management (`lib/actions/schools.ts`)**
   - `createSchool(name, type)` 
   - `getSchools()` - user's schools only
   - `updateSchool(id, data)`
   - `deleteSchool(id)` - cascade to terms/courses

2. **Term Management (`lib/actions/terms.ts`)**
   - `createTerm(schoolId, name, startDate, endDate)`
   - `getTerms(schoolId)` 
   - `updateTerm(id, data)`
   - `deleteTerm(id)` - cascade to courses

3. **Course Management (`lib/actions/courses.ts`)**
   - `createCourse(termId, name, code, credits, color)`
   - `getCourses(termId)`
   - `updateCourse(id, data)`
   - `deleteCourse(id)` - cascade to subjects

4. **Subject Management (`lib/actions/subjects.ts`)**
   - `createSubject(courseId, name, description, orderIndex)`
   - `getSubjects(courseId)`
   - `updateSubject(id, data)`
   - `deleteSubject(id)`
   - `reorderSubjects(courseId, subjectIds)` - drag & drop

## UI Components Needed

### 1. Academic Structure Page (`app/dashboard/academic/page.tsx`)
- Tab interface for Schools → Terms → Courses → Subjects
- Breadcrumb navigation showing current level
- Create new buttons for each level
- List/grid view of items at current level

### 2. Management Components

**Schools (`components/academic/school-manager.tsx`)**
- School creation form (name, type dropdown)
- School list with edit/delete actions
- School type options: High School, College, University, Other

**Terms (`components/academic/term-manager.tsx`)**  
- Term creation form (name, start date, end date)
- Calendar picker for date ranges
- Term list with active/inactive status
- Validation: end date > start date

**Courses (`components/academic/course-manager.tsx`)**
- Course creation form (name, code, credits, color picker)
- Course grid with color coding
- Credit hour validation (1-6 range typical)
- Course code format validation

**Subjects (`components/academic/subject-manager.tsx`)**
- Subject creation form (name, description, order)
- Drag & drop reordering interface  
- Subject list with order indicators
- Description with rich text support

### 3. Shared Components

**Navigation Flow (`components/academic/academic-nav.tsx`)**
- Hierarchical breadcrumbs
- "Back" and "Up Level" buttons
- Current selection indicators

**Create Forms (`components/academic/create-forms/`)**
- Reusable form components with validation
- Consistent styling and error handling
- Loading states and success feedback

## User Experience Flow

1. **First Time Setup**
   - User lands on empty academic structure page
   - Prominent "Add Your First School" CTA
   - Guided flow: School → Term → Course → Subject

2. **Daily Usage**
   - Quick access to current term's courses
   - Recently accessed courses pinned
   - Search/filter across all levels

3. **Bulk Operations**
   - Import from transcript/class schedule
   - Duplicate previous term structure
   - Archive completed terms

## Form Validation Rules

### Schools
- Name: required, 2-100 chars, no special chars
- Type: required, enum validation

### Terms  
- Name: required, 2-50 chars
- Start Date: required, valid date
- End Date: required, valid date, after start date
- Unique name per school

### Courses
- Name: required, 2-100 chars
- Code: optional, 2-20 chars, alphanumeric + spaces/dashes
- Credits: required, 0.5-6.0 range
- Color: valid hex color
- Unique code per term (if provided)

### Subjects
- Name: required, 2-100 chars
- Description: optional, max 500 chars
- Order: auto-assigned, user can reorder

## Error Handling

- **Network Errors:** Retry logic with exponential backoff
- **Validation Errors:** Inline field validation with clear messages
- **Constraint Violations:** User-friendly messages for DB constraints
- **Permission Errors:** Clear messaging about ownership requirements

## Testing Strategy

### Unit Tests (`__tests__/academic/`)
- Form validation logic
- Server action error handling  
- Data transformation utilities

### Integration Tests (`e2e/academic/`)
- Complete school → term → course → subject flow
- RLS policy verification (cross-user isolation)
- Bulk operations and edge cases

### Performance Tests
- Load 100+ courses in term view (< 500ms)
- Subject drag & drop responsiveness  
- Form submission speed (< 200ms)

## Acceptance Criteria

### ✅ Schools
- [ ] Create school with name and type
- [ ] View list of user's schools only
- [ ] Edit school details
- [ ] Delete school (with confirmation)
- [ ] RLS prevents cross-user access

### ✅ Terms  
- [ ] Create term within school
- [ ] Set academic calendar dates
- [ ] Mark term as active/inactive
- [ ] View terms for selected school
- [ ] Cannot create overlapping terms

### ✅ Courses
- [ ] Create course within term
- [ ] Set course metadata (code, credits, color)
- [ ] Visual course grid with colors
- [ ] Edit/delete courses
- [ ] Unique course codes per term

### ✅ Subjects
- [ ] Create subjects within course  
- [ ] Drag & drop reordering
- [ ] Rich text descriptions
- [ ] Edit/delete subjects
- [ ] Order persistence across sessions

### ✅ Navigation
- [ ] Hierarchical breadcrumb navigation
- [ ] Deep linking to specific course/subject
- [ ] Back button and browser history
- [ ] Mobile responsive design

### ✅ Data Integrity
- [ ] Cascade deletes work correctly
- [ ] Orphaned records are prevented
- [ ] Transaction rollback on failures
- [ ] Audit log for critical changes

## Technical Implementation Details

### File Structure
```
app/dashboard/academic/page.tsx          # Main academic page
lib/actions/academic.ts                  # Server actions  
components/academic/
  ├── academic-layout.tsx               # Tab layout & navigation
  ├── school-manager.tsx                # School CRUD
  ├── term-manager.tsx                  # Term CRUD  
  ├── course-manager.tsx                # Course CRUD
  ├── subject-manager.tsx               # Subject CRUD
  └── forms/                            # Form components
hooks/use-academic.ts                    # Academic data hooks
types/academic.ts                        # TypeScript types
```

### State Management
- React Query for server state caching
- Optimistic updates for better UX
- Automatic refetch on window focus
- Error boundary for graceful failures

## Rollback Plan

If academic structure breaks existing functionality:
1. Revert to previous dashboard layout
2. Hide academic navigation tabs
3. Add feature flag: `FEATURE_ACADEMIC_STRUCTURE=false`
4. Preserve database schema for retry

## Dependencies

- ✅ Database schema (already complete)
- ✅ Authentication system (already working)
- ✅ UI components library (shadcn/ui)
- ✅ Form handling (react-hook-form + zod)

## Risk Assessment

- **Low Risk:** Database schema is proven and tested
- **Medium Risk:** Complex hierarchical navigation UX
- **Mitigation:** Progressive enhancement, start with simple lists

## Post-Implementation

After academic structure is complete:
1. Update TRACKER.md to mark as ✅ 
2. Update PROGRESS.md with completion timestamp
3. Begin Priority 2: PDF Upload & Processing
4. Create sample data for demonstration
5. Deploy to staging for user testing

## Performance Considerations

- Lazy load lower levels (don't fetch all courses until term selected)
- Debounce search inputs (300ms delay)
- Virtual scrolling for large lists (100+ items)
- Prefetch adjacent levels on hover
- Optimize bundle size with dynamic imports