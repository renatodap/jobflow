import type { 
  School, 
  Term, 
  Course, 
  Subject,
  CreateSchoolData,
  CreateTermData, 
  CreateCourseData,
  CreateSubjectData,
  SchoolWithTerms,
  TermWithCourses,
  CourseWithSubjects 
} from '@/types/academic'

class AcademicAPI {
  private baseUrl = '/api'

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Schools
  async getSchools(): Promise<School[]> {
    const result = await this.request('/schools')
    return result.schools
  }

  async createSchool(data: CreateSchoolData): Promise<School> {
    const result = await this.request('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return result.school
  }

  async updateSchool(id: string, data: Partial<CreateSchoolData>): Promise<School> {
    const result = await this.request('/schools', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    return result.school
  }

  async deleteSchool(id: string): Promise<void> {
    await this.request(`/schools?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Terms
  async getTerms(schoolId: string): Promise<Term[]> {
    const result = await this.request(`/terms?schoolId=${schoolId}`)
    return result.terms
  }

  async createTerm(data: CreateTermData): Promise<Term> {
    const result = await this.request('/terms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return result.term
  }

  async updateTerm(id: string, data: Partial<CreateTermData>): Promise<Term> {
    const result = await this.request('/terms', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    return result.term
  }

  async deleteTerm(id: string): Promise<void> {
    await this.request(`/terms?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Courses
  async getCourses(termId: string): Promise<Course[]> {
    const result = await this.request(`/courses?termId=${termId}`)
    return result.courses
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const result = await this.request('/courses', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        code: data.code,
        credits: data.credits,
        color: data.color,
        termId: data.term_id
      }),
    })
    return result.course
  }

  async updateCourse(id: string, data: Partial<CreateCourseData>): Promise<Course> {
    const result = await this.request('/courses', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    return result.course
  }

  async deleteCourse(id: string): Promise<void> {
    await this.request(`/courses?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Subjects
  async getSubjects(courseId: string): Promise<Subject[]> {
    const result = await this.request(`/subjects?courseId=${courseId}`)
    return result.subjects
  }

  async createSubject(data: CreateSubjectData): Promise<Subject> {
    const result = await this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        courseId: data.course_id
      }),
    })
    return result.subject
  }

  async updateSubject(id: string, data: Partial<CreateSubjectData>): Promise<Subject> {
    const result = await this.request('/subjects', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    return result.subject
  }

  async deleteSubject(id: string): Promise<void> {
    await this.request(`/subjects?id=${id}`, {
      method: 'DELETE',
    })
  }
}

export const academicAPI = new AcademicAPI()

// Utility functions for academic structure
export function getActiveTerms(schools: SchoolWithTerms[]): Term[] {
  return schools.flatMap(school => 
    school.terms.filter(term => term.active)
  )
}

export function getCurrentTerm(schools: SchoolWithTerms[]): Term | null {
  const now = new Date()
  const activeTerms = getActiveTerms(schools)
  
  return activeTerms.find(term => {
    const startDate = new Date(term.start_date)
    const endDate = new Date(term.end_date)
    return now >= startDate && now <= endDate
  }) || null
}

export function getTermProgress(term: Term): number {
  const now = new Date()
  const startDate = new Date(term.start_date)
  const endDate = new Date(term.end_date)
  
  if (now < startDate) return 0
  if (now > endDate) return 100
  
  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  
  return Math.round((elapsed / totalDuration) * 100)
}

export function sortCoursesByImportance(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    // Sort by credits (higher first), then by name
    if (a.credits !== b.credits) {
      return b.credits - a.credits
    }
    return a.name.localeCompare(b.name)
  })
}

export function generateCourseColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // violet  
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#6366F1', // indigo
    '#EC4899', // pink
    '#84CC16', // lime
    '#F97316', // orange
    '#06B6D4', // cyan
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}

export function validateAcademicDates(startDate: string, endDate: string): string | null {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start >= end) {
    return 'End date must be after start date'
  }
  
  const diffMonths = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (diffMonths < 1) {
    return 'Terms should be at least 1 month long'
  }
  
  if (diffMonths > 12) {
    return 'Terms should not exceed 12 months'
  }
  
  return null
}