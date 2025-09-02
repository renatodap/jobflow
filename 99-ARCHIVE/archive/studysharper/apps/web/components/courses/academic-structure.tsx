'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAcademic } from '@/hooks/use-academic'
import type { School, Term, Course } from '@/types/academic'
import { 
  Plus, 
  School as SchoolIcon, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Trash2, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { SchoolForm } from './school-form'
import { TermForm } from './term-form'
import { CourseForm } from './course-form'
import { SubjectForm } from './subject-form'
import { useState } from 'react'

export function AcademicStructure() {
  const {
    schools,
    terms,
    courses,
    subjects,
    selectedSchool,
    selectedTerm,
    selectedCourse,
    activeTerm,
    currentPath,
    loading,
    error,
    selectSchool,
    selectTerm,
    selectCourse,
    deleteSchool,
    deleteTerm,
    deleteCourse,
    deleteSubject,
    clearError
  } = useAcademic()

  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [showTermForm, setShowTermForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const getTotalCredits = () => {
    return courses.reduce((sum, course) => sum + course.credits, 0)
  }

  const getSubjectCount = () => {
    return subjects.length
  }

  const handleDeleteSchool = async (id: string) => {
    if (confirm('Are you sure? This will delete all terms, courses, and subjects in this school.')) {
      try {
        await deleteSchool(id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleDeleteTerm = async (id: string) => {
    if (confirm('Are you sure? This will delete all courses and subjects in this term.')) {
      try {
        await deleteTerm(id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure? This will delete all subjects in this course.')) {
      try {
        await deleteCourse(id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  if (loading && schools.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <SchoolIcon className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">No Schools Added</h3>
          <p className="text-muted-foreground max-w-md">
            Get started by adding your school or educational institution to organize your courses.
          </p>
        </div>
        <Button onClick={() => setShowSchoolForm(true)} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Your First School
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Breadcrumb Navigation */}
      {currentPath.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Current Path:</span>
              {currentPath.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2">
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 font-medium text-foreground"
                    onClick={() => {
                      if (index === 0) selectSchool(item as School)
                      else if (index === 1) selectTerm(item as Term)
                      else if (index === 2) selectCourse(item as Course)
                    }}
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <SchoolIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">Educational institutions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTerm ? 'This term' : 'Total courses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCredits()}</div>
            <p className="text-xs text-muted-foreground">Credit hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSubjectCount()}</div>
            <p className="text-xs text-muted-foreground">Study areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Interface */}
      <Tabs defaultValue="schools" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            {selectedSchool && (
              <Badge variant="secondary">
                {selectedSchool.name}
              </Badge>
            )}
            {selectedTerm && (
              <Badge variant="outline">
                {selectedTerm.name}
              </Badge>
            )}
            {selectedCourse && (
              <Badge variant="outline">
                {selectedCourse.name}
              </Badge>
            )}
          </div>
        </div>

        <TabsContent value="schools" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Schools & Institutions</h3>
              <p className="text-sm text-muted-foreground">
                Manage your educational institutions
              </p>
            </div>
            <Button onClick={() => setShowSchoolForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <Card 
                key={school.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedSchool?.id === school.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => selectSchool(school)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{school.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingItem(school)
                          setShowSchoolForm(true)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSchool(school.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {school.type.replace('_', ' ').toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="secondary">{school.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Academic Terms</h3>
              <p className="text-sm text-muted-foreground">
                Manage semesters, quarters, or other academic periods
              </p>
            </div>
            <Button onClick={() => setShowTermForm(true)} disabled={!selectedSchool}>
              <Plus className="mr-2 h-4 w-4" />
              Add Term
            </Button>
          </div>

          {!selectedSchool ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <SchoolIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No School Selected</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Select a school from the Schools tab to manage its terms.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {terms.map((term) => (
                <Card 
                  key={term.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    term.active ? 'ring-2 ring-primary' : ''
                  } ${selectedTerm?.id === term.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => selectTerm(term)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {term.name}
                        {term.active && <Badge>Active</Badge>}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(term)
                            setShowTermForm(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTerm(term.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}

              {terms.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Terms Added</h4>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Add your first academic term to start organizing courses.
                    </p>
                    <Button onClick={() => setShowTermForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Term
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Courses</h3>
              <p className="text-sm text-muted-foreground">
                Manage your courses for the selected term
              </p>
            </div>
            <Button onClick={() => setShowCourseForm(true)} disabled={!selectedTerm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>

          {!selectedTerm ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Term Selected</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Select a term to view and manage its courses.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectCourse(course)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(course)
                            setShowCourseForm(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCourse(course.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    {course.code && (
                      <CardDescription className="font-mono text-xs">
                        {course.code}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Credits:</span>
                      <Badge variant="secondary">{course.credits}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {courses.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Courses Added</h4>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Add your first course to start organizing your studies.
                    </p>
                    <Button onClick={() => setShowCourseForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Subjects</h3>
              <p className="text-sm text-muted-foreground">
                Manage subjects for the selected course
              </p>
            </div>
            <Button onClick={() => setShowSubjectForm(true)} disabled={!selectedCourse}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>

          {!selectedCourse ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Course Selected</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Select a course to view and manage its subjects.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <Card key={subject.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-muted-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-base">{subject.name}</CardTitle>
                          {subject.description && (
                            <CardDescription className="text-sm">
                              {subject.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(subject)
                            setShowSubjectForm(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubject(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {subjects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Subjects Added</h4>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Add subjects to organize your course content.
                    </p>
                    <Button onClick={() => setShowSubjectForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showSchoolForm && (
        <SchoolForm
          school={editingItem}
          onSuccess={() => {
            setShowSchoolForm(false)
            setEditingItem(null)
          }}
          onCancel={() => {
            setShowSchoolForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showTermForm && selectedSchool && (
        <TermForm
          school_id={selectedSchool.id}
          term={editingItem}
          onSuccess={() => {
            setShowTermForm(false)
            setEditingItem(null)
          }}
          onCancel={() => {
            setShowTermForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showCourseForm && selectedTerm && (
        <CourseForm
          term_id={selectedTerm.id}
          course={editingItem}
          onSuccess={() => {
            setShowCourseForm(false)
            setEditingItem(null)
          }}
          onCancel={() => {
            setShowCourseForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showSubjectForm && selectedCourse && (
        <SubjectForm
          course_id={selectedCourse.id}
          subject={editingItem}
          onSuccess={() => {
            setShowSubjectForm(false)
            setEditingItem(null)
          }}
          onCancel={() => {
            setShowSubjectForm(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}