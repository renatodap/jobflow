import { useState, useEffect, useMemo } from 'react'
import { academicAPI } from '@/lib/academic'
import type { 
  School, 
  Term, 
  Course, 
  Subject,
  CreateSchoolData,
  CreateTermData,
  CreateCourseData,
  CreateSubjectData,
  SchoolWithTerms 
} from '@/types/academic'

interface AcademicState {
  schools: School[]
  selectedSchool: School | null
  selectedTerm: Term | null
  selectedCourse: Course | null
  loading: boolean
  error: string | null
}

export function useAcademic() {
  const [state, setState] = useState<AcademicState>({
    schools: [],
    selectedSchool: null,
    selectedTerm: null,
    selectedCourse: null,
    loading: false,
    error: null
  })

  const [terms, setTerms] = useState<Term[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Load schools on mount
  useEffect(() => {
    loadSchools()
  }, [])

  // Load terms when school is selected
  useEffect(() => {
    if (state.selectedSchool) {
      loadTerms(state.selectedSchool.id)
    } else {
      setTerms([])
      setState(prev => ({ ...prev, selectedTerm: null, selectedCourse: null }))
    }
  }, [state.selectedSchool])

  // Load courses when term is selected
  useEffect(() => {
    if (state.selectedTerm) {
      loadCourses(state.selectedTerm.id)
    } else {
      setCourses([])
      setState(prev => ({ ...prev, selectedCourse: null }))
    }
  }, [state.selectedTerm])

  // Load subjects when course is selected
  useEffect(() => {
    if (state.selectedCourse) {
      loadSubjects(state.selectedCourse.id)
    } else {
      setSubjects([])
    }
  }, [state.selectedCourse])

  async function loadSchools() {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const schools = await academicAPI.getSchools()
      setState(prev => ({ ...prev, schools, loading: false }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load schools' 
      }))
    }
  }

  async function loadTerms(schoolId: string) {
    try {
      const newTerms = await academicAPI.getTerms(schoolId)
      setTerms(newTerms)
      
      // Auto-select active term if available
      const activeTerm = newTerms.find(term => term.active)
      if (activeTerm && !state.selectedTerm) {
        setState(prev => ({ ...prev, selectedTerm: activeTerm }))
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load terms' 
      }))
    }
  }

  async function loadCourses(termId: string) {
    try {
      const newCourses = await academicAPI.getCourses(termId)
      setCourses(newCourses)
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load courses' 
      }))
    }
  }

  async function loadSubjects(courseId: string) {
    try {
      const newSubjects = await academicAPI.getSubjects(courseId)
      setSubjects(newSubjects)
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load subjects' 
      }))
    }
  }

  // School operations
  async function createSchool(data: CreateSchoolData) {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const school = await academicAPI.createSchool(data)
      setState(prev => ({ 
        ...prev, 
        schools: [school, ...prev.schools],
        selectedSchool: school,
        loading: false 
      }))
      return school
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create school' 
      }))
      throw error
    }
  }

  async function updateSchool(id: string, data: Partial<CreateSchoolData>) {
    try {
      const school = await academicAPI.updateSchool(id, data)
      setState(prev => ({
        ...prev,
        schools: prev.schools.map(s => s.id === id ? school : s),
        selectedSchool: prev.selectedSchool?.id === id ? school : prev.selectedSchool
      }))
      return school
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update school' 
      }))
      throw error
    }
  }

  async function deleteSchool(id: string) {
    try {
      await academicAPI.deleteSchool(id)
      setState(prev => ({
        ...prev,
        schools: prev.schools.filter(s => s.id !== id),
        selectedSchool: prev.selectedSchool?.id === id ? null : prev.selectedSchool
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete school' 
      }))
      throw error
    }
  }

  // Term operations
  async function createTerm(data: CreateTermData) {
    try {
      const term = await academicAPI.createTerm(data)
      setTerms(prev => [term, ...prev])
      if (term.active) {
        setState(prev => ({ ...prev, selectedTerm: term }))
      }
      return term
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create term' 
      }))
      throw error
    }
  }

  async function updateTerm(id: string, data: Partial<CreateTermData>) {
    try {
      const term = await academicAPI.updateTerm(id, data)
      setTerms(prev => prev.map(t => t.id === id ? term : t))
      setState(prev => ({
        ...prev,
        selectedTerm: prev.selectedTerm?.id === id ? term : prev.selectedTerm
      }))
      return term
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update term' 
      }))
      throw error
    }
  }

  async function deleteTerm(id: string) {
    try {
      await academicAPI.deleteTerm(id)
      setTerms(prev => prev.filter(t => t.id !== id))
      setState(prev => ({
        ...prev,
        selectedTerm: prev.selectedTerm?.id === id ? null : prev.selectedTerm
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete term' 
      }))
      throw error
    }
  }

  // Course operations
  async function createCourse(data: CreateCourseData) {
    try {
      const course = await academicAPI.createCourse(data)
      setCourses(prev => [...prev, course])
      return course
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create course' 
      }))
      throw error
    }
  }

  async function updateCourse(id: string, data: Partial<CreateCourseData>) {
    try {
      const course = await academicAPI.updateCourse(id, data)
      setCourses(prev => prev.map(c => c.id === id ? course : c))
      setState(prev => ({
        ...prev,
        selectedCourse: prev.selectedCourse?.id === id ? course : prev.selectedCourse
      }))
      return course
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update course' 
      }))
      throw error
    }
  }

  async function deleteCourse(id: string) {
    try {
      await academicAPI.deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
      setState(prev => ({
        ...prev,
        selectedCourse: prev.selectedCourse?.id === id ? null : prev.selectedCourse
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete course' 
      }))
      throw error
    }
  }

  // Subject operations
  async function createSubject(data: CreateSubjectData) {
    try {
      const subject = await academicAPI.createSubject(data)
      setSubjects(prev => [...prev, subject])
      return subject
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create subject' 
      }))
      throw error
    }
  }

  async function updateSubject(id: string, data: Partial<CreateSubjectData>) {
    try {
      const subject = await academicAPI.updateSubject(id, data)
      setSubjects(prev => prev.map(s => s.id === id ? subject : s))
      return subject
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update subject' 
      }))
      throw error
    }
  }

  async function deleteSubject(id: string) {
    try {
      await academicAPI.deleteSubject(id)
      setSubjects(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete subject' 
      }))
      throw error
    }
  }

  // Selection helpers
  function selectSchool(school: School | null) {
    setState(prev => ({ ...prev, selectedSchool: school, selectedTerm: null, selectedCourse: null }))
  }

  function selectTerm(term: Term | null) {
    setState(prev => ({ ...prev, selectedTerm: term, selectedCourse: null }))
  }

  function selectCourse(course: Course | null) {
    setState(prev => ({ ...prev, selectedCourse: course }))
  }

  // Computed values
  const activeTerm = useMemo(() => 
    terms.find(term => term.active) || null, 
    [terms]
  )

  const currentPath = useMemo(() => {
    const path = []
    if (state.selectedSchool) path.push(state.selectedSchool)
    if (state.selectedTerm) path.push(state.selectedTerm)
    if (state.selectedCourse) path.push(state.selectedCourse)
    return path
  }, [state.selectedSchool, state.selectedTerm, state.selectedCourse])

  return {
    // State
    ...state,
    terms,
    courses,
    subjects,
    activeTerm,
    currentPath,

    // School operations
    createSchool,
    updateSchool,
    deleteSchool,
    selectSchool,

    // Term operations
    createTerm,
    updateTerm,
    deleteTerm,
    selectTerm,

    // Course operations
    createCourse,
    updateCourse,
    deleteCourse,
    selectCourse,

    // Subject operations
    createSubject,
    updateSubject,
    deleteSubject,

    // Utilities
    refresh: loadSchools,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}