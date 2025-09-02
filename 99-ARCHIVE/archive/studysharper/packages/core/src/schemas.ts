import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1),
  google_id: z.string().optional(),
  created_at: z.string().datetime(),
  last_seen: z.string().datetime(),
  preferences: z.record(z.any()).default({}),
  timezone: z.string().default('UTC'),
});

export const UserPreferencesSchema = z.object({
  dark_mode: z.boolean().default(true),
  notifications: z.boolean().default(true),
  study_reminders: z.boolean().default(true),
  daily_study_goal: z.number().min(30).max(480).default(120), // minutes
  preferred_study_times: z.array(z.string()).default(['morning']),
  cognitive_load_preference: z.number().min(1).max(5).default(3),
});

// School hierarchy schemas
export const SchoolSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['high_school', 'college', 'university', 'other']),
  created_at: z.string().datetime(),
});

export const TermSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  name: z.string().min(1),
  start_date: z.string().date(),
  end_date: z.string().date(),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
});

export const CourseSchema = z.object({
  id: z.string().uuid(),
  term_id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().optional(),
  credits: z.number().int().min(0).max(6).default(3),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  syllabus_data: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  order_index: z.number().int().min(0).default(0),
  created_at: z.string().datetime(),
});

// Assessment and task schemas
export const AssessmentTypeSchema = z.enum(['exam', 'quiz', 'assignment', 'project', 'presentation']);
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(1),
  type: AssessmentTypeSchema,
  due_date: z.string().date(),
  weight: z.number().min(0).max(100).default(0),
  points_possible: z.number().min(0).optional(),
  points_earned: z.number().min(0).optional(),
  status: TaskStatusSchema.default('pending'),
  created_at: z.string().datetime(),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  assessment_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().date().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  estimated_minutes: z.number().int().min(5).max(480).default(60),
  status: TaskStatusSchema.default('pending'),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
});

// Study planning schemas
export const StudyMethodSchema = z.enum(['reading', 'flashcards', 'practice_problems', 'writing', 'discussion', 'video']);

export const StudyPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  start_date: z.string().date(),
  end_date: z.string().date(),
  ai_config: z.record(z.any()).default({}),
  generated_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export const StudyBlockSchema = z.object({
  id: z.string().uuid(),
  study_plan_id: z.string().uuid(),
  task_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  scheduled_start: z.string().datetime(),
  duration_minutes: z.number().int().min(5).max(240),
  study_method: StudyMethodSchema,
  cognitive_load: z.number().int().min(1).max(5).default(3),
  ai_reasoning: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

export const StudySessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  study_block_id: z.string().uuid().optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  actual_minutes: z.number().int().min(0).optional(),
  focus_rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

// Content schemas
export const NoteFormatSchema = z.enum(['markdown', 'html', 'plain']);

export const NoteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  subject_id: z.string().uuid().optional(),
  title: z.string().min(1),
  content: z.string(),
  format: NoteFormatSchema.default('markdown'),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ResourceTypeSchema = z.enum(['pdf', 'url', 'video', 'audio', 'image', 'document']);

export const ResourceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  url: z.string().url().optional(),
  file_path: z.string().optional(),
  resource_type: ResourceTypeSchema,
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

// Spaced repetition schemas
export const DeckSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  subject_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});

export const CardSchema = z.object({
  id: z.string().uuid(),
  deck_id: z.string().uuid(),
  front: z.string().min(1),
  back: z.string().min(1),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

export const SRSAlgorithmSchema = z.enum(['sm2', 'fsrs']);

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  card_id: z.string().uuid(),
  user_id: z.string().uuid(),
  reviewed_at: z.string().datetime(),
  rating: z.number().int().min(1).max(5),
  interval_days: z.number().int().min(1).default(1),
  ease_factor: z.number().min(1.3).max(5.0).default(2.5),
  repetitions: z.number().int().min(0).default(0),
  next_review: z.string().datetime(),
  algorithm: SRSAlgorithmSchema.default('sm2'),
});

// Analytics schemas
export const MetricSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  metric_type: z.string(),
  value: z.number(),
  dimensions: z.record(z.any()).default({}),
  recorded_at: z.string().datetime(),
});

export const EventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_type: z.string(),
  properties: z.record(z.any()).default({}),
  occurred_at: z.string().datetime(),
});

// API request/response schemas
export const CreateCourseRequestSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
  credits: z.number().int().min(0).max(6).default(3),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
});

export const CreateTaskRequestSchema = z.object({
  course_id: z.string().uuid(),
  assessment_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  due_date: z.string().date().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  estimated_minutes: z.number().int().min(5).max(480).default(60),
});

export const CreateNoteRequestSchema = z.object({
  subject_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  format: NoteFormatSchema.default('markdown'),
});

export const StudyPlanGenerationRequestSchema = z.object({
  name: z.string().min(1).max(100),
  start_date: z.string().date(),
  end_date: z.string().date(),
  focus_subjects: z.array(z.string().uuid()).optional(),
  daily_study_minutes: z.number().int().min(30).max(480).default(120),
  preferences: z.object({
    preferred_times: z.array(z.string()).default(['morning']),
    max_session_length: z.number().int().min(15).max(180).default(60),
    break_between_subjects: z.number().int().min(5).max(30).default(10),
    interleaving_strength: z.number().min(0).max(1).default(0.3),
  }).default({}),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type School = z.infer<typeof SchoolSchema>;
export type Term = z.infer<typeof TermSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type StudyBlock = z.infer<typeof StudyBlockSchema>;
export type StudySession = z.infer<typeof StudySessionSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type Card = z.infer<typeof CardSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type Event = z.infer<typeof EventSchema>;

export type CreateCourseRequest = z.infer<typeof CreateCourseRequestSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;
export type StudyPlanGenerationRequest = z.infer<typeof StudyPlanGenerationRequestSchema>;