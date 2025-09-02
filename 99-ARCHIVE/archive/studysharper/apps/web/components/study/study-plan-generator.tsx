'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { 
  Sparkles, 
  Calendar,
  Clock,
  Target,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Settings,
  Brain
} from 'lucide-react'
import { useAcademic } from '@/hooks/use-academic'
import { useToast } from '@/hooks/use-toast'

interface StudyPlanGeneratorProps {
  onPlanGenerated?: (plan: any) => void
  className?: string
}

export function StudyPlanGenerator({ onPlanGenerated, className }: StudyPlanGeneratorProps) {
  const { subjects } = useAcademic()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    selectedSubjects: [] as string[],
    studyHoursPerDay: 3,
    preferredTimeSlots: [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '17:00' }
    ],
    sessionDuration: 90,
    breakDuration: 15,
    avoidWeekends: true,
    focusMode: 'balanced' as 'balanced' | 'exam_prep' | 'review' | 'learning'
  })

  const totalSteps = 4

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }))
  }

  const generatePlan = async () => {
    if (formData.selectedSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one subject',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/study/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          title: formData.title || 'My Study Plan',
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          subjectIds: formData.selectedSubjects,
          preferences: {
            studyHoursPerDay: formData.studyHoursPerDay,
            preferredTimeSlots: formData.preferredTimeSlots,
            sessionDuration: formData.sessionDuration,
            breakDuration: formData.breakDuration,
            avoidWeekends: formData.avoidWeekends,
            focusMode: formData.focusMode
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setGeneratedPlan(data.plan)
      setStep(totalSteps + 1) // Go to review step
      
      toast({
        title: 'Plan Generated!',
        description: data.message
      })

    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate study plan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    if (!generatedPlan) return

    setLoading(true)
    try {
      const response = await fetch('/api/study/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          plan: generatedPlan
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save plan')
      }

      toast({
        title: 'Plan Saved!',
        description: 'Your study plan has been saved and activated'
      })

      onPlanGenerated?.(generatedPlan)

    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save study plan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                placeholder="e.g., Final Exam Preparation"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your study goals and objectives..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.startDate}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Subjects to Study</Label>
              <p className="text-sm text-muted-foreground">
                Choose which subjects to include in your study plan
              </p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSubjectToggle(subject.id)}
                >
                  <Checkbox
                    checked={formData.selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.courses?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {formData.selectedSubjects.length > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {formData.selectedSubjects.length} subject{formData.selectedSubjects.length !== 1 ? 's' : ''} selected
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Daily Study Hours</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[formData.studyHoursPerDay]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, studyHoursPerDay: value }))}
                  min={1}
                  max={8}
                  step={0.5}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">
                  {formData.studyHoursPerDay}h
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Duration (minutes)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[formData.sessionDuration]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, sessionDuration: value }))}
                  min={30}
                  max={180}
                  step={15}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">
                  {formData.sessionDuration}m
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Break Duration (minutes)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[formData.breakDuration]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, breakDuration: value }))}
                  min={5}
                  max={30}
                  step={5}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">
                  {formData.breakDuration}m
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="avoidWeekends"
                checked={formData.avoidWeekends}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, avoidWeekends: checked as boolean }))
                }
              />
              <Label htmlFor="avoidWeekends" className="cursor-pointer">
                Avoid scheduling on weekends
              </Label>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Study Focus Mode</Label>
              <RadioGroup
                value={formData.focusMode}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, focusMode: value as any }))
                }
              >
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <div className="space-y-1">
                      <Label htmlFor="balanced" className="cursor-pointer">
                        Balanced
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Equal distribution across all subjects
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="exam_prep" id="exam_prep" />
                    <div className="space-y-1">
                      <Label htmlFor="exam_prep" className="cursor-pointer">
                        Exam Preparation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Focus on upcoming exams and assessments
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="review" id="review" />
                    <div className="space-y-1">
                      <Label htmlFor="review" className="cursor-pointer">
                        Review & Consolidation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Emphasis on reviewing and strengthening knowledge
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="learning" id="learning" />
                    <div className="space-y-1">
                      <Label htmlFor="learning" className="cursor-pointer">
                        New Learning
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Focus on covering new material and concepts
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (generatedPlan) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Study Plan Generated!
          </CardTitle>
          <CardDescription>
            Review your personalized study plan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">{generatedPlan.title}</h3>
            <p className="text-sm text-muted-foreground">{generatedPlan.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {format(new Date(generatedPlan.startDate), 'MMM d')} - {format(new Date(generatedPlan.endDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Study Hours</p>
              <p className="font-medium">{Math.round(generatedPlan.totalStudyHours)} hours</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="font-medium">{generatedPlan.sessions.length} sessions</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="font-medium">{generatedPlan.averageHoursPerDay.toFixed(1)} hours</p>
            </div>
          </div>

          {generatedPlan.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendations
              </h4>
              <ul className="space-y-1">
                {generatedPlan.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={savePlan}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save & Activate Plan
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setGeneratedPlan(null)
                setStep(1)
              }}
            >
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Study Plan
        </CardTitle>
        <CardDescription>
          Create an AI-powered personalized study schedule
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} />
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              className="flex-1"
              onClick={() => setStep(prev => prev + 1)}
              disabled={
                (step === 2 && formData.selectedSubjects.length === 0) ||
                loading
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={generatePlan}
              disabled={loading || formData.selectedSubjects.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Plan
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}