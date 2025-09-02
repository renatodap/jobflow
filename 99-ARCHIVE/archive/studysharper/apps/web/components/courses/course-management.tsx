'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, School, Calendar, BookOpen, GraduationCap, Settings, Trash2 } from 'lucide-react'
import { SchoolForm } from './school-form'
import { TermForm } from './term-form'
import { CourseForm } from './course-form'
import { SubjectForm } from './subject-form'

interface CourseManagementProps {
  initialSchools: any[]
  currentTerm: any
  userId: string
}

interface School {
  id: string
  name: string
  type: string
  terms: Term[]
}

interface Term {
  id: string
  name: string
  start_date: string
  end_date: string
  active: boolean
  courses: Course[]
}

interface Course {
  id: string
  name: string
  code?: string
  credits: number
  color: string
  subjects: Subject[]
}

interface Subject {
  id: string
  name: string
  description?: string
  order_index: number
}

export function CourseManagement({ initialSchools, currentTerm, userId }: CourseManagementProps) {
  const [schools, setSchools] = useState<School[]>(initialSchools)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(
    schools.length > 0 ? schools[0] : null
  )
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(currentTerm)
  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [showTermForm, setShowTermForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const refreshData = async () => {
    // In a real app, this would refetch data from the server
    window.location.reload()
  }

  const getActiveTerms = () => {
    if (!selectedSchool) return []
    return selectedSchool.terms.filter(term => term.active)
  }

  const getAllCourses = () => {
    if (!selectedTerm) return []
    return selectedTerm.courses || []
  }

  const getTotalCredits = () => {
    return getAllCourses().reduce((sum, course) => sum + course.credits, 0)
  }

  const getSubjectCount = () => {
    return getAllCourses().reduce((sum, course) => sum + (course.subjects?.length || 0), 0)
  }

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <School className="h-16 w-16 text-muted-foreground" />
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
        
        {showSchoolForm && (
          <SchoolForm
            onSuccess={refreshData}
            onCancel={() => setShowSchoolForm(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold">{getAllCourses().length}</div>
            <p className="text-xs text-muted-foreground">This term</p>
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
      <Tabs defaultValue="courses" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
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
          </div>
        </div>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Courses</h3>
              <p className="text-sm text-muted-foreground">
                Manage your courses and subjects for the current term
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
                <h4 className="font-medium mb-2">No Active Term</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create or activate a term to start adding courses.
                </p>
                <Button onClick={() => setShowTermForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Term
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAllCourses().map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: course.color }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    {course.code && (
                      <CardDescription className="font-mono text-xs">
                        {course.code}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credits:</span>
                        <Badge variant="secondary">{course.credits}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Subjects:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course)
                              setShowSubjectForm(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          {course.subjects?.slice(0, 3).map((subject) => (
                            <div 
                              key={subject.id}
                              className="text-xs px-2 py-1 bg-muted rounded"
                            >
                              {subject.name}
                            </div>
                          ))}
                          {course.subjects && course.subjects.length > 3 && (
                            <div className="text-xs text-muted-foreground px-2">
                              +{course.subjects.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getAllCourses().length === 0 && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSchool?.terms.map((term) => (
              <Card 
                key={term.id} 
                className={`hover:shadow-md transition-shadow ${
                  term.active ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {term.name}
                      {term.active && <Badge>Active</Badge>}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTerm(term)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Courses:</span>
                    <Badge variant="secondary">{term.courses?.length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
                className={`hover:shadow-md transition-shadow ${
                  selectedSchool?.id === school.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{school.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSchool(school)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {school.type.replace('_', ' ').toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Terms:</span>
                      <Badge variant="secondary">{school.terms?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Terms:</span>
                      <Badge variant="outline">
                        {school.terms?.filter(t => t.active).length || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showSchoolForm && (
        <SchoolForm
          onSuccess={() => {
            setShowSchoolForm(false)
            refreshData()
          }}
          onCancel={() => setShowSchoolForm(false)}
        />
      )}

      {showTermForm && selectedSchool && (
        <TermForm
          school_id={selectedSchool.id}
          onSuccess={() => {
            setShowTermForm(false)
            refreshData()
          }}
          onCancel={() => setShowTermForm(false)}
        />
      )}

      {showCourseForm && selectedTerm && (
        <CourseForm
          term_id={selectedTerm.id}
          onSuccess={() => {
            setShowCourseForm(false)
            refreshData()
          }}
          onCancel={() => setShowCourseForm(false)}
        />
      )}

      {showSubjectForm && selectedCourse && (
        <SubjectForm
          course_id={selectedCourse.id}
          onSuccess={() => {
            setShowSubjectForm(false)
            refreshData()
          }}
          onCancel={() => setShowSubjectForm(false)}
        />
      )}
    </div>
  )
}