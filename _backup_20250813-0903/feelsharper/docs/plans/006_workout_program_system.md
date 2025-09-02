# 006: Workout Program System

## 🎯 Feature Scope
Implement comprehensive workout program templates with progression tracking, PR monitoring, and volume analytics.

## 🏗️ Database Schema Changes

### New Tables
```sql
-- Workout program templates
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT, -- 'strength', 'endurance', 'muscle_gain', 'fat_loss'
  experience_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  equipment_required TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual workout templates within programs
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  week_number INTEGER,
  day_number INTEGER,
  estimated_duration_minutes INTEGER,
  exercises JSONB NOT NULL, -- Array of exercise objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's assigned programs
CREATE TABLE user_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id, started_at)
);

-- Personal records tracking
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL, -- '1rm', '3rm', '5rm', 'distance', 'time'
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL, -- 'kg', 'lb', 'km', 'mi', 'seconds'
  workout_id UUID REFERENCES workouts(id),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_name, record_type)
);
```

### RLS Policies
```sql
-- workout_programs
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public programs or their own" ON workout_programs
  FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can insert their own programs" ON workout_programs
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own programs" ON workout_programs
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete their own programs" ON workout_programs
  FOR DELETE USING (created_by = auth.uid());

-- workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view templates for accessible programs" ON workout_templates
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM workout_programs wp 
    WHERE wp.id = program_id AND (wp.is_public = true OR wp.created_by = auth.uid())
  ));
CREATE POLICY "Users can manage templates for their programs" ON workout_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM workout_programs wp 
    WHERE wp.id = program_id AND wp.created_by = auth.uid()
  ));

-- user_programs
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own assigned programs" ON user_programs
  FOR ALL USING (user_id = auth.uid());

-- personal_records
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own PRs" ON personal_records
  FOR ALL USING (user_id = auth.uid());
```

## 🔌 API Endpoints

### Programs
- `GET /api/workout-programs` - List available programs (public + user's own)
- `POST /api/workout-programs` - Create new program
- `GET /api/workout-programs/[id]` - Get program details with templates
- `PUT /api/workout-programs/[id]` - Update program
- `DELETE /api/workout-programs/[id]` - Delete program
- `POST /api/workout-programs/[id]/assign` - Assign program to user

### User Programs
- `GET /api/user-programs` - Get user's assigned programs
- `GET /api/user-programs/[id]` - Get specific assignment with progress
- `PUT /api/user-programs/[id]/progress` - Update week/day progress
- `POST /api/user-programs/[id]/complete` - Mark program as completed

### Personal Records
- `GET /api/personal-records` - Get user's PRs (with filtering)
- `POST /api/personal-records` - Create/update PR
- `DELETE /api/personal-records/[id]` - Delete PR

## 🎨 UI Components

### Program Library (`/workouts/programs`)
- Grid of available workout programs
- Filter by goal type, experience level, duration
- Program cards showing key info and preview
- Search functionality

### Program Detail (`/workouts/programs/[id]`)
- Full program overview with weekly breakdown
- Exercise preview for each workout
- "Start Program" button
- Progress tracking if already assigned

### Active Program Dashboard (`/workouts/dashboard`)
- Current program progress
- Today's workout (if scheduled)
- Weekly overview with completion status
- Quick start next workout

### Personal Records (`/workouts/records`)
- PR history by exercise
- Charts showing progression over time
- Add/edit PR functionality
- Exercise-specific filtering

### Program Creator (`/workouts/programs/create`)
- Comprehensive program builder
- Weekly structure setup
- Exercise selection and ordering
- Preview and validation

## 🧪 Test Plan

### Unit Tests
- Program CRUD operations
- PR calculation and tracking
- Progress tracking logic
- Exercise template validation

### Integration Tests
- Program assignment flow
- Workout completion updates PRs
- RLS policy enforcement
- API endpoint security

### E2E Tests
- Complete program assignment flow
- PR tracking from workout completion
- Program progression through weeks
- Program creation and sharing

## ⚠️ Risks & Mitigation

### Data Integrity
- Risk: Orphaned templates if program deleted
- Mitigation: CASCADE deletes + cleanup jobs

### Performance
- Risk: Large JSONB exercise arrays
- Mitigation: Pagination + lazy loading

### User Experience
- Risk: Complex program setup
- Mitigation: Pre-built templates + simple flow

## 🔄 Rollback Plan
- Feature flags for program system
- Database migration rollback scripts
- Fallback to basic workout logging

## ✅ Acceptance Criteria

1. **Program Library**
   - [ ] Users can browse available workout programs
   - [ ] Filter by goal type and experience level
   - [ ] View program details before assignment

2. **Program Assignment**
   - [ ] Users can assign programs to themselves
   - [ ] Track current week and day progress
   - [ ] Mark workouts as completed

3. **Personal Records**
   - [ ] Automatic PR detection from workouts
   - [ ] Manual PR entry and editing
   - [ ] Historical PR tracking with charts

4. **Program Creation**
   - [ ] Create custom programs with templates
   - [ ] Share programs publicly (if desired)
   - [ ] Edit and manage created programs

5. **Analytics**
   - [ ] Volume/tonnage tracking per program
   - [ ] Progress visualization
   - [ ] Program completion rates

## 📊 Success Metrics
- Program assignment rate: >40% of active users
- Program completion rate: >60% of assigned programs
- PR tracking engagement: >30% of workouts logged
- Custom program creation: >10% of power users