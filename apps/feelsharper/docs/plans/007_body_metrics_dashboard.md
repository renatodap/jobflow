# 007: Body Metrics Dashboard

## 🎯 Feature Scope
Implement advanced body metrics tracking with trend analysis, 7-day exponential moving averages, goal tracking, and correlation insights.

## 🏗️ Database Schema Changes

### New Tables
```sql
-- Enhanced body measurements beyond weight
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,1),
  muscle_mass_kg DECIMAL(5,2),
  visceral_fat_level INTEGER,
  water_percentage DECIMAL(4,1),
  bone_mass_kg DECIMAL(4,2),
  metabolic_age INTEGER,
  -- Circumference measurements
  waist_cm DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  arm_cm DECIMAL(5,2),
  thigh_cm DECIMAL(5,2),
  hip_cm DECIMAL(5,2),
  neck_cm DECIMAL(5,2),
  -- Progress photos metadata
  progress_photo_front TEXT,
  progress_photo_side TEXT,
  progress_photo_back TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, measurement_date)
);

-- Body composition goals and targets
CREATE TABLE body_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'maintenance')),
  target_weight_kg DECIMAL(5,2),
  target_body_fat_percentage DECIMAL(4,1),
  target_muscle_mass_kg DECIMAL(5,2),
  target_date DATE,
  weekly_rate_kg DECIMAL(4,3), -- Expected change per week
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculated trend data for performance
CREATE TABLE body_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  weight_7day_ema DECIMAL(5,2),
  weight_trend_direction TEXT CHECK (weight_trend_direction IN ('up', 'down', 'stable')),
  weight_weekly_change_kg DECIMAL(4,3),
  body_fat_7day_ema DECIMAL(4,1),
  muscle_mass_7day_ema DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, calculation_date)
);
```

### Existing Table Updates
```sql
-- Add trend calculation fields to existing body_weight table
ALTER TABLE body_weight ADD COLUMN IF NOT EXISTS 
  trending_weight_kg DECIMAL(5,2),
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
  days_since_goal INTEGER;
```

### RLS Policies
```sql
-- body_measurements
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own measurements" ON body_measurements
  FOR ALL USING (user_id = auth.uid());

-- body_goals  
ALTER TABLE body_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own goals" ON body_goals
  FOR ALL USING (user_id = auth.uid());

-- body_trends
ALTER TABLE body_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own trends" ON body_trends
  FOR ALL USING (user_id = auth.uid());
```

## 🔌 API Endpoints

### Body Measurements
- `GET /api/body-measurements` - Get user's measurements with date range filtering
- `POST /api/body-measurements` - Add new measurement
- `PUT /api/body-measurements/[date]` - Update measurement for specific date
- `DELETE /api/body-measurements/[date]` - Delete measurement

### Trends & Analytics
- `GET /api/body-trends` - Get calculated trends and EMA data
- `GET /api/body-analytics/summary` - Get overview stats and progress
- `GET /api/body-analytics/correlations` - Get workout/nutrition correlations

### Goals
- `GET /api/body-goals` - Get user's body composition goals
- `POST /api/body-goals` - Create new goal
- `PUT /api/body-goals/[id]` - Update goal
- `PUT /api/body-goals/[id]/complete` - Mark goal as completed

## 🎨 UI Components

### Enhanced Weight Page (`/weight`)
- Quick weight entry with trend indicator
- 7-day EMA display vs raw weight
- Goal progress indicator
- Quick body composition entry

### Body Metrics Dashboard (`/body`)
- Comprehensive measurement entry form
- Progress photo upload
- Trend charts (weight, body fat, muscle mass)
- Goal tracking with timeline

### Analytics Views
- Correlation analysis (weight vs workout frequency)
- Progress predictions based on current trends
- Achievement celebration for milestones

### Chart Components
- Weight trend chart with EMA smoothing
- Body composition pie charts
- Goal progress timeline
- Measurement history comparison

## 🧮 Calculations & Algorithms

### 7-Day Exponential Moving Average
```typescript
// EMA formula: EMA(today) = α × current_value + (1 - α) × EMA(yesterday)
// Where α = 2 / (period + 1), for 7-day EMA: α = 0.25
const calculateEMA = (currentValue: number, previousEMA: number): number => {
  const alpha = 2 / (7 + 1); // 0.25 for 7-day EMA
  return alpha * currentValue + (1 - alpha) * previousEMA;
};
```

### Trend Direction Detection
```typescript
const getTrendDirection = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const change = Math.abs(current - previous);
  const threshold = 0.1; // kg threshold for "stable"
  
  if (change < threshold) return 'stable';
  return current > previous ? 'up' : 'down';
};
```

### Goal Progress Calculation
```typescript
const calculateGoalProgress = (
  current: number, 
  target: number, 
  starting: number
): number => {
  const totalChange = target - starting;
  const currentChange = current - starting;
  return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
};
```

## 🧪 Test Plan

### Unit Tests
- EMA calculation accuracy
- Trend direction detection
- Goal progress calculations
- Data validation for measurements

### Integration Tests
- Measurement CRUD operations
- Trend calculation triggers
- Goal achievement detection
- RLS policy enforcement

### E2E Tests
- Complete measurement entry flow
- Goal setting and tracking
- Chart rendering and interaction
- Progress photo upload

## ⚠️ Risks & Mitigation

### Data Privacy
- Risk: Sensitive body data exposure
- Mitigation: Strong RLS + encryption at rest

### Performance
- Risk: Trend calculations on large datasets
- Mitigation: Background jobs + caching

### User Experience
- Risk: Data entry friction
- Mitigation: Smart defaults + quick entry modes

## 🔄 Rollback Plan
- Feature flags for analytics features
- Database migration rollback scripts
- Fallback to simple weight tracking

## ✅ Acceptance Criteria

1. **Enhanced Measurements**
   - [ ] Users can log comprehensive body measurements
   - [ ] Progress photos upload and organization
   - [ ] Measurement history with search/filtering

2. **Trend Analysis**
   - [ ] 7-day EMA calculation for weight trends
   - [ ] Trend direction indicators (up/down/stable)
   - [ ] Weekly change rate calculation

3. **Goal Tracking**
   - [ ] Set and track body composition goals
   - [ ] Progress visualization with timelines
   - [ ] Achievement celebrations and milestones

4. **Analytics Dashboard**
   - [ ] Correlation analysis (weight vs workouts)
   - [ ] Prediction models for goal achievement
   - [ ] Summary statistics and insights

5. **Visual Experience**
   - [ ] Interactive trend charts with Recharts
   - [ ] Body composition visualizations
   - [ ] Progress photo timeline
   - [ ] Goal progress indicators

## 📊 Success Metrics
- Daily measurement logging rate: >60% of active users
- Goal setting rate: >40% of users create body goals
- Trend engagement: >80% of users view trend charts
- Goal achievement rate: >30% of goals completed on time