'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { profileQueries } from '@/lib/supabase/client'
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FolderOpen,
  Target,
  Check
} from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Personal Info', icon: User },
  { id: 2, name: 'Education', icon: GraduationCap },
  { id: 3, name: 'Experience', icon: Briefcase },
  { id: 4, name: 'Skills', icon: Code },
  { id: 5, name: 'Projects', icon: FolderOpen },
  { id: 6, name: 'Preferences', icon: Target }
]

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    full_name: '',
    phone: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    
    // Step 2: Education
    education: [{
      institution: '',
      degree: '',
      field_of_study: '',
      graduation_date: '',
      gpa: '',
      relevant_coursework: []
    }],
    
    // Step 3: Experience
    experience: [{
      company: '',
      job_title: '',
      employment_type: 'Full-time',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: ['']
    }],
    
    // Step 4: Skills
    skills: {
      programming_languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      cloud: []
    },
    
    // Step 5: Projects
    projects: [{
      name: '',
      description: '',
      technologies: [],
      project_url: '',
      github_url: ''
    }],
    
    // Step 6: Preferences
    preferences: {
      desired_roles: [],
      experience_level: 'Entry Level',
      min_salary: 0,
      max_salary: 0,
      preferred_locations: [],
      remote_preference: 'No Preference',
      job_types: ['Full-time'],
      company_sizes: []
    }
  })

  // Load existing profile data if available
  useEffect(() => {
    if (user) {
      loadExistingProfile()
    }
  }, [user])

  const loadExistingProfile = async () => {
    if (!user) return
    
    try {
      const { data: profile } = await profileQueries.getProfile(user.id)
      if (profile) {
        setFormData(prev => ({
          ...prev,
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          location: profile.location || '',
          github_url: profile.github_url || '',
          linkedin_url: profile.linkedin_url || '',
          portfolio_url: profile.portfolio_url || ''
        }))
        
        // Set to the last incomplete step
        if (profile.onboarding_step) {
          setCurrentStep(profile.onboarding_step)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    setErrors((prev: any) => ({ ...prev, [field]: null }))
  }

  const handleArrayItemChange = (arrayName: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const array = [...(prev as any)[arrayName]]
      array[index] = { ...array[index], [field]: value }
      return { ...prev, [arrayName]: array }
    })
  }

  const addArrayItem = (arrayName: string) => {
    const templates: any = {
      education: {
        institution: '',
        degree: '',
        field_of_study: '',
        graduation_date: '',
        gpa: ''
      },
      experience: {
        company: '',
        job_title: '',
        employment_type: 'Full-time',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        achievements: ['']
      },
      projects: {
        name: '',
        description: '',
        technologies: [],
        project_url: '',
        github_url: ''
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev as any)[arrayName], templates[arrayName]]
    }))
  }

  const removeArrayItem = (arrayName: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].filter((_: any, i: number) => i !== index)
    }))
  }

  const validateStep = (step: number) => {
    const newErrors: any = {}
    
    switch(step) {
      case 1:
        if (!formData.full_name) newErrors.full_name = 'Name is required'
        if (!formData.location) newErrors.location = 'Location is required'
        break
      case 2:
        if (formData.education[0].institution === '') {
          newErrors.education = 'At least one education entry is required'
        }
        break
      case 3:
        // Experience is optional for entry-level
        break
      case 4:
        const totalSkills = Object.values(formData.skills).flat().length
        if (totalSkills < 3) {
          newErrors.skills = 'Add at least 3 skills'
        }
        break
      case 5:
        // Projects are optional but recommended
        break
      case 6:
        if (formData.preferences.desired_roles.length === 0) {
          newErrors.preferences = 'Select at least one desired role'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveStepData = async (step: number) => {
    if (!user) return false
    
    setLoading(true)
    try {
      switch(step) {
        case 1:
          // Save personal info
          await profileQueries.updateProfile(user.id, {
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            github_url: formData.github_url,
            linkedin_url: formData.linkedin_url,
            portfolio_url: formData.portfolio_url,
            onboarding_step: 2
          })
          break
          
        case 2:
          // Save education
          for (const edu of formData.education) {
            if (edu.institution) {
              await profileQueries.addEducation(user.id, edu)
            }
          }
          await profileQueries.updateProfile(user.id, { onboarding_step: 3 })
          break
          
        case 3:
          // Save experience
          for (const exp of formData.experience) {
            if (exp.company) {
              await profileQueries.addWorkExperience(user.id, exp)
            }
          }
          await profileQueries.updateProfile(user.id, { onboarding_step: 4 })
          break
          
        case 4:
          // Save skills
          const skillsToSave = []
          for (const [category, skills] of Object.entries(formData.skills)) {
            for (const skill of skills as string[]) {
              skillsToSave.push({
                category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                name: skill,
                proficiency: 'Intermediate'
              })
            }
          }
          if (skillsToSave.length > 0) {
            await profileQueries.addSkillsBatch(user.id, skillsToSave)
          }
          await profileQueries.updateProfile(user.id, { onboarding_step: 5 })
          break
          
        case 5:
          // Save projects
          for (const project of formData.projects) {
            if (project.name) {
              await profileQueries.addProject(user.id, project)
            }
          }
          await profileQueries.updateProfile(user.id, { onboarding_step: 6 })
          break
          
        case 6:
          // Save preferences and mark profile complete
          await profileQueries.updateJobPreferences(user.id, formData.preferences)
          await profileQueries.updateProfile(user.id, { 
            profile_complete: true,
            onboarding_step: 6
          })
          break
      }
      
      return true
    } catch (error) {
      console.error('Error saving step data:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return
    
    const saved = await saveStepData(currentStep)
    if (saved) {
      if (currentStep === 6) {
        router.push('/dashboard')
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} onChange={handleInputChange} errors={errors} />
      case 2:
        return <EducationStep formData={formData} onChange={handleArrayItemChange} onAdd={() => addArrayItem('education')} onRemove={(i) => removeArrayItem('education', i)} errors={errors} />
      case 3:
        return <ExperienceStep formData={formData} onChange={handleArrayItemChange} onAdd={() => addArrayItem('experience')} onRemove={(i) => removeArrayItem('experience', i)} errors={errors} />
      case 4:
        return <SkillsStep formData={formData} onChange={handleInputChange} errors={errors} />
      case 5:
        return <ProjectsStep formData={formData} onChange={handleArrayItemChange} onAdd={() => addArrayItem('projects')} onRemove={(i) => removeArrayItem('projects', i)} errors={errors} />
      case 6:
        return <PreferencesStep formData={formData} onChange={handleInputChange} errors={errors} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isComplete = step.id < currentStep
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-blue-600 text-white' : ''}
                      ${isComplete ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isComplete ? 'bg-gray-200 text-gray-500' : ''}
                    `}>
                      {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="ml-2">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`
                      flex-1 h-1 mx-4
                      ${isComplete ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              flex items-center px-6 py-2 rounded-lg font-medium
              ${currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (currentStep === 6 ? 'Complete Setup' : 'Next')}
            {!loading && <ChevronRight className="w-5 h-5 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Step Components
function PersonalInfoStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
        {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="San Francisco, CA"
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          GitHub URL
        </label>
        <input
          type="url"
          value={formData.github_url}
          onChange={(e) => onChange('github_url', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={formData.linkedin_url}
          onChange={(e) => onChange('linkedin_url', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://linkedin.com/in/username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Portfolio URL
        </label>
        <input
          type="url"
          value={formData.portfolio_url}
          onChange={(e) => onChange('portfolio_url', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://yourportfolio.com"
        />
      </div>
    </div>
  )
}

function EducationStep({ formData, onChange, onAdd, onRemove, errors }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Education</h2>
      
      {formData.education.map((edu: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Education {index + 1}</h3>
            {formData.education.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Institution *</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => onChange('education', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Stanford University"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => onChange('education', index, 'degree', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Bachelor of Science"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Field of Study *</label>
              <input
                type="text"
                value={edu.field_of_study}
                onChange={(e) => onChange('education', index, 'field_of_study', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Computer Science"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Graduation Date</label>
              <input
                type="month"
                value={edu.graduation_date}
                onChange={(e) => onChange('education', index, 'graduation_date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={edu.gpa}
                onChange={(e) => onChange('education', index, 'gpa', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="3.85"
              />
            </div>
          </div>
        </div>
      ))}
      
      {errors.education && <p className="text-red-500 text-sm">{errors.education}</p>}
      
      <button
        onClick={onAdd}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        + Add Another Education
      </button>
    </div>
  )
}

function ExperienceStep({ formData, onChange, onAdd, onRemove, errors }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
      <p className="text-gray-600 text-sm mb-4">Optional for entry-level positions</p>
      
      {formData.experience.map((exp: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Experience {index + 1}</h3>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => onChange('experience', index, 'company', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Tech Company Inc."
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Job Title</label>
              <input
                type="text"
                value={exp.job_title}
                onChange={(e) => onChange('experience', index, 'job_title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Software Engineer Intern"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="month"
                value={exp.start_date}
                onChange={(e) => onChange('experience', index, 'start_date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="month"
                value={exp.end_date}
                onChange={(e) => onChange('experience', index, 'end_date', e.target.value)}
                disabled={exp.is_current}
                className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
              />
              <label className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={exp.is_current}
                  onChange={(e) => onChange('experience', index, 'is_current', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Currently working here</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => onChange('experience', index, 'description', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={onAdd}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        + Add Experience
      </button>
    </div>
  )
}

function SkillsStep({ formData, onChange, errors }: any) {
  const skillCategories = [
    { key: 'programming_languages', label: 'Programming Languages', placeholder: 'Python, JavaScript, Java' },
    { key: 'frameworks', label: 'Frameworks', placeholder: 'React, Django, Spring' },
    { key: 'databases', label: 'Databases', placeholder: 'PostgreSQL, MongoDB, Redis' },
    { key: 'tools', label: 'Tools', placeholder: 'Git, Docker, Kubernetes' },
    { key: 'cloud', label: 'Cloud Platforms', placeholder: 'AWS, Google Cloud, Azure' }
  ]

  const handleSkillsChange = (category: string, value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s)
    onChange('skills', { ...formData.skills, [category]: skills })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Technical Skills</h2>
      <p className="text-gray-600 text-sm mb-4">Separate skills with commas</p>
      
      {skillCategories.map(category => (
        <div key={category.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {category.label}
          </label>
          <input
            type="text"
            value={formData.skills[category.key].join(', ')}
            onChange={(e) => handleSkillsChange(category.key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={category.placeholder}
          />
        </div>
      ))}
      
      {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
    </div>
  )
}

function ProjectsStep({ formData, onChange, onAdd, onRemove, errors }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <p className="text-gray-600 text-sm mb-4">Showcase your best work</p>
      
      {formData.projects.map((project: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Project {index + 1}</h3>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Project Name</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onChange('projects', index, 'name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="E-commerce Platform"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => onChange('projects', index, 'description', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
              placeholder="Built a full-stack e-commerce platform..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Technologies (comma-separated)</label>
            <input
              type="text"
              value={project.technologies.join(', ')}
              onChange={(e) => onChange('projects', index, 'technologies', e.target.value.split(',').map((s: string) => s.trim()))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Project URL</label>
              <input
                type="url"
                value={project.project_url}
                onChange={(e) => onChange('projects', index, 'project_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="https://project.com"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">GitHub URL</label>
              <input
                type="url"
                value={project.github_url}
                onChange={(e) => onChange('projects', index, 'github_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="https://github.com/user/repo"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={onAdd}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        + Add Project
      </button>
    </div>
  )
}

function PreferencesStep({ formData, onChange, errors }: any) {
  const roleOptions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Machine Learning Engineer',
    'Mobile Developer',
    'QA Engineer'
  ]

  const handleRoleToggle = (role: string) => {
    const roles = formData.preferences.desired_roles.includes(role)
      ? formData.preferences.desired_roles.filter((r: string) => r !== role)
      : [...formData.preferences.desired_roles, role]
    onChange('preferences', { ...formData.preferences, desired_roles: roles })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Job Preferences</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Desired Roles * (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map(role => (
            <label key={role} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.desired_roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="mr-2"
              />
              <span className="text-sm">{role}</span>
            </label>
          ))}
        </div>
        {errors.preferences && <p className="text-red-500 text-sm mt-1">{errors.preferences}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience Level
        </label>
        <select
          value={formData.preferences.experience_level}
          onChange={(e) => onChange('preferences', { ...formData.preferences, experience_level: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="Intern">Intern</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Salary (USD)
          </label>
          <input
            type="number"
            value={formData.preferences.min_salary}
            onChange={(e) => onChange('preferences', { ...formData.preferences, min_salary: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="60000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Salary (USD)
          </label>
          <input
            type="number"
            value={formData.preferences.max_salary}
            onChange={(e) => onChange('preferences', { ...formData.preferences, max_salary: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="120000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remote Preference
        </label>
        <select
          value={formData.preferences.remote_preference}
          onChange={(e) => onChange('preferences', { ...formData.preferences, remote_preference: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="No Preference">No Preference</option>
          <option value="Remote Only">Remote Only</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Locations (comma-separated)
        </label>
        <input
          type="text"
          value={formData.preferences.preferred_locations.join(', ')}
          onChange={(e) => onChange('preferences', { 
            ...formData.preferences, 
            preferred_locations: e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s)
          })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="San Francisco, New York, Austin, Remote"
        />
      </div>
    </div>
  )
}