# Row Level Security Policies

---
id: rls-policies
owner: security-team
status: active
last_updated: 2025-08-12
links:
  - "[Domain Model](../06-domain-model/erd.md)"
  - "[Stack Decision](../02-decisions/stack.md)"
---

## Purpose
Define comprehensive Row Level Security (RLS) policies for all StudySharper tables to ensure complete multi-tenant data isolation and security.

## Scope
All database tables with user-specific data, covering read/write/delete operations with appropriate security contexts.

## Security Model

### Core Principles
1. **User Isolation**: Users can only access their own data
2. **Hierarchical Access**: Data access follows academic hierarchy (User → School → Course → Subject)
3. **Least Privilege**: Minimum permissions required for each operation
4. **No Shared Data**: Zero cross-user data leakage

### Authentication Context
```sql
-- Current user ID from JWT token
auth.uid() -- Returns authenticated user's UUID
auth.email() -- Returns authenticated user's email
auth.role() -- Returns user role (authenticated/anon)
```

## RLS Policy Definitions

### User Table Policies

```sql
-- Users can only read their own profile
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users  
FOR UPDATE USING (auth.uid() = id);

-- New users can insert their own record (signup)
CREATE POLICY "users_insert_own" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own account
CREATE POLICY "users_delete_own" ON users
FOR DELETE USING (auth.uid() = id);
```

### School Table Policies

```sql
-- Users can only see their own schools
CREATE POLICY "schools_select_own" ON schools
FOR SELECT USING (auth.uid() = user_id);

-- Users can create schools for themselves
CREATE POLICY "schools_insert_own" ON schools
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own schools
CREATE POLICY "schools_update_own" ON schools
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own schools
CREATE POLICY "schools_delete_own" ON schools
FOR DELETE USING (auth.uid() = user_id);
```

### Term Table Policies

```sql
-- Users can only see terms from their schools
CREATE POLICY "terms_select_own" ON terms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM schools 
    WHERE schools.id = terms.school_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can create terms in their schools
CREATE POLICY "terms_insert_own" ON terms
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM schools 
    WHERE schools.id = terms.school_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can update terms in their schools
CREATE POLICY "terms_update_own" ON terms
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM schools 
    WHERE schools.id = terms.school_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can delete terms in their schools
CREATE POLICY "terms_delete_own" ON terms
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM schools 
    WHERE schools.id = terms.school_id 
    AND schools.user_id = auth.uid()
  )
);
```

### Course Table Policies

```sql
-- Users can only see courses from their terms
CREATE POLICY "courses_select_own" ON courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM terms 
    JOIN schools ON schools.id = terms.school_id
    WHERE terms.id = courses.term_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can create courses in their terms
CREATE POLICY "courses_insert_own" ON courses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM terms 
    JOIN schools ON schools.id = terms.school_id
    WHERE terms.id = courses.term_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can update courses in their terms
CREATE POLICY "courses_update_own" ON courses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM terms 
    JOIN schools ON schools.id = terms.school_id
    WHERE terms.id = courses.term_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can delete courses in their terms
CREATE POLICY "courses_delete_own" ON courses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM terms 
    JOIN schools ON schools.id = terms.school_id
    WHERE terms.id = courses.term_id 
    AND schools.user_id = auth.uid()
  )
);
```

### Subject Table Policies

```sql
-- Users can only see subjects from their courses
CREATE POLICY "subjects_select_own" ON subjects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = subjects.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can create subjects in their courses
CREATE POLICY "subjects_insert_own" ON subjects
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = subjects.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can update subjects in their courses
CREATE POLICY "subjects_update_own" ON subjects
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = subjects.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can delete subjects in their courses
CREATE POLICY "subjects_delete_own" ON subjects
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = subjects.course_id 
    AND schools.user_id = auth.uid()
  )
);
```

### Assessment Table Policies

```sql
-- Users can only see assessments from their courses
CREATE POLICY "assessments_select_own" ON assessments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = assessments.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can create assessments in their courses
CREATE POLICY "assessments_insert_own" ON assessments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = assessments.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can update assessments in their courses
CREATE POLICY "assessments_update_own" ON assessments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = assessments.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can delete assessments in their courses
CREATE POLICY "assessments_delete_own" ON assessments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = assessments.course_id 
    AND schools.user_id = auth.uid()
  )
);
```

### Task Table Policies

```sql
-- Users can only see their own tasks
CREATE POLICY "tasks_select_own" ON tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = tasks.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can create tasks in their courses
CREATE POLICY "tasks_insert_own" ON tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = tasks.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can update their own tasks
CREATE POLICY "tasks_update_own" ON tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = tasks.course_id 
    AND schools.user_id = auth.uid()
  )
);

-- Users can delete their own tasks
CREATE POLICY "tasks_delete_own" ON tasks
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE courses.id = tasks.course_id 
    AND schools.user_id = auth.uid()
  )
);
```

### Study Plan & Session Policies

```sql
-- Study Plans - Direct user ownership
CREATE POLICY "study_plans_select_own" ON study_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_plans_insert_own" ON study_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_plans_update_own" ON study_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "study_plans_delete_own" ON study_plans
FOR DELETE USING (auth.uid() = user_id);

-- Study Blocks - Through study plan ownership
CREATE POLICY "study_blocks_select_own" ON study_blocks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM study_plans
    WHERE study_plans.id = study_blocks.study_plan_id
    AND study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "study_blocks_insert_own" ON study_blocks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM study_plans
    WHERE study_plans.id = study_blocks.study_plan_id
    AND study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "study_blocks_update_own" ON study_blocks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM study_plans
    WHERE study_plans.id = study_blocks.study_plan_id
    AND study_plans.user_id = auth.uid()
  )
);

CREATE POLICY "study_blocks_delete_own" ON study_blocks
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM study_plans
    WHERE study_plans.id = study_blocks.study_plan_id
    AND study_plans.user_id = auth.uid()
  )
);

-- Study Sessions - Direct user ownership
CREATE POLICY "study_sessions_select_own" ON study_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own" ON study_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own" ON study_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_delete_own" ON study_sessions
FOR DELETE USING (auth.uid() = user_id);
```

### Note & Resource Policies

```sql
-- Notes - Direct user ownership
CREATE POLICY "notes_select_own" ON notes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own" ON notes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON notes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON notes
FOR DELETE USING (auth.uid() = user_id);

-- Note Embeddings - Through note ownership
CREATE POLICY "note_embeddings_select_own" ON note_embeddings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = note_embeddings.note_id
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "note_embeddings_insert_own" ON note_embeddings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = note_embeddings.note_id
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "note_embeddings_update_own" ON note_embeddings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = note_embeddings.note_id
    AND notes.user_id = auth.uid()
  )
);

CREATE POLICY "note_embeddings_delete_own" ON note_embeddings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM notes
    WHERE notes.id = note_embeddings.note_id
    AND notes.user_id = auth.uid()
  )
);

-- Resources - Direct user ownership
CREATE POLICY "resources_select_own" ON resources
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "resources_insert_own" ON resources
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resources_update_own" ON resources
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "resources_delete_own" ON resources
FOR DELETE USING (auth.uid() = user_id);
```

### Spaced Repetition Policies

```sql
-- Decks - Direct user ownership with subject verification
CREATE POLICY "decks_select_own" ON decks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "decks_insert_own" ON decks
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM subjects
    JOIN courses ON courses.id = subjects.course_id
    JOIN terms ON terms.id = courses.term_id
    JOIN schools ON schools.id = terms.school_id
    WHERE subjects.id = decks.subject_id
    AND schools.user_id = auth.uid()
  )
);

CREATE POLICY "decks_update_own" ON decks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "decks_delete_own" ON decks
FOR DELETE USING (auth.uid() = user_id);

-- Cards - Through deck ownership
CREATE POLICY "cards_select_own" ON cards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "cards_insert_own" ON cards
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "cards_update_own" ON cards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "cards_delete_own" ON cards
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Reviews - Direct user ownership with card verification
CREATE POLICY "reviews_select_own" ON reviews
FOR SELECT USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM cards
    JOIN decks ON decks.id = cards.deck_id
    WHERE cards.id = reviews.card_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "reviews_insert_own" ON reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM cards
    JOIN decks ON decks.id = cards.deck_id
    WHERE cards.id = reviews.card_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "reviews_update_own" ON reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews
FOR DELETE USING (auth.uid() = user_id);
```

### Analytics & Event Policies

```sql
-- Metrics - Direct user ownership
CREATE POLICY "metrics_select_own" ON metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "metrics_insert_own" ON metrics
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "metrics_update_own" ON metrics
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "metrics_delete_own" ON metrics
FOR DELETE USING (auth.uid() = user_id);

-- Events - Direct user ownership
CREATE POLICY "events_select_own" ON events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "events_insert_own" ON events
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update_own" ON events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_delete_own" ON events
FOR DELETE USING (auth.uid() = user_id);
```

## RLS Activation Commands

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

## Security Testing Framework

### Test Scenarios
1. **Cross-User Data Access**: Verify user A cannot access user B's data
2. **Unauthenticated Access**: Verify anonymous users cannot access any data
3. **Privilege Escalation**: Verify users cannot access parent hierarchy they don't own
4. **Bulk Operations**: Verify batch operations respect RLS boundaries
5. **Complex Queries**: Verify JOINs and subqueries maintain isolation

### Testing SQL Queries
```sql
-- Test cross-user isolation
SET request.jwt.claims TO '{"sub": "user-a-uuid"}';
SELECT * FROM notes WHERE user_id = 'user-b-uuid'; -- Should return empty

-- Test hierarchical access
SET request.jwt.claims TO '{"sub": "user-a-uuid"}';
SELECT * FROM subjects WHERE course_id IN (
  SELECT id FROM courses WHERE term_id IN (
    SELECT id FROM terms WHERE school_id IN (
      SELECT id FROM schools WHERE user_id = 'user-b-uuid'
    )
  )
); -- Should return empty

-- Test unauthenticated access
RESET request.jwt.claims;
SELECT * FROM users; -- Should return empty
```

## Performance Considerations

### Index Requirements
```sql
-- Indexes to support RLS policy performance
CREATE INDEX idx_schools_user_id ON schools(user_id);
CREATE INDEX idx_terms_school_id ON terms(school_id);
CREATE INDEX idx_courses_term_id ON courses(term_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
```

### Query Optimization
- Use direct user_id foreign keys where possible to avoid complex JOINs
- Cache school/course hierarchy for session to reduce repeated lookups
- Consider materialized views for complex hierarchical queries

## Acceptance Criteria
- [ ] All tables have complete CRUD policies implemented
- [ ] No cross-user data leakage in any scenario
- [ ] Performance impact <10ms for typical queries
- [ ] Comprehensive test suite covers all security boundaries
- [ ] Policies support all application user journeys
- [ ] Emergency admin access patterns defined

## Risks
- **Performance Impact**: Complex hierarchical queries may slow with large datasets
- **Development Complexity**: Developers must understand RLS for all queries
- **Testing Overhead**: Security testing requires multiple user contexts

## Open Questions
- Should we implement admin override policies for customer support?
- How to handle data migration scenarios across user boundaries?
- What audit logging is needed for RLS policy violations?

## Done means...
Complete RLS implementation with 100% user data isolation, comprehensive test coverage, and performance within acceptable bounds for all user operations.