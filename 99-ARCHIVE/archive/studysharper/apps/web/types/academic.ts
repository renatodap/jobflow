// Academic Structure Types
export interface School {
  id: string
  user_id: string
  name: string
  type: 'high_school' | 'college' | 'university' | 'other'
  created_at: string
}

export interface Term {
  id: string
  school_id: string
  name: string
  start_date: string
  end_date: string
  active: boolean
  created_at: string
}

export interface Course {
  id: string
  term_id: string
  name: string
  code?: string
  credits: number
  color: string
  syllabus_data: Record<string, any>
  created_at: string
}

export interface Subject {
  id: string
  course_id: string
  name: string
  description?: string
  order_index: number
  created_at: string
}

export interface Assessment {
  id: string
  course_id: string
  title: string
  type: 'exam' | 'quiz' | 'assignment' | 'project' | 'presentation'
  due_date: string
  weight: number
  points_possible?: number
  points_earned?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

export interface Task {
  id: string
  course_id: string
  assessment_id?: string
  title: string
  description?: string
  due_date?: string
  priority: number
  estimated_minutes: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  created_at: string
}

// Form types for creating/updating
export interface CreateSchoolData {
  name: string
  type: School['type']
}

export interface CreateTermData {
  school_id: string
  name: string
  start_date: string
  end_date: string
  active?: boolean
}

export interface CreateCourseData {
  term_id: string
  name: string
  code?: string
  credits: number
  color?: string
  syllabus_data?: Record<string, any>
}

export interface CreateSubjectData {
  course_id: string
  name: string
  description?: string
  order_index?: number
}

export interface CreateAssessmentData {
  course_id: string
  title: string
  type: Assessment['type']
  due_date: string
  weight: number
  points_possible?: number
}

export interface CreateTaskData {
  course_id: string
  assessment_id?: string
  title: string
  description?: string
  due_date?: string
  priority: number
  estimated_minutes: number
}

// Extended types with relationships
export interface SchoolWithTerms extends School {
  terms: Term[]
}

export interface TermWithCourses extends Term {
  courses: Course[]
  school: School
}

export interface CourseWithSubjects extends Course {
  subjects: Subject[]
  term: Term
}

export interface CourseWithDetails extends Course {
  subjects: Subject[]
  assessments: Assessment[]
  tasks: Task[]
  term: Term & { school: School }
}