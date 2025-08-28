// Mock data for profile-related tests
// This file contains mock data prefixed with "Mock" as required by TDD rules

export const MockProfile = {
  id: 'mock-user-1',
  email: 'mockuser@test.com',
  full_name: 'Mock Test User',
  phone: '+1 555-0100',
  location: 'San Francisco, CA',
  linkedin: 'https://linkedin.com/in/mockuser',
  github: 'https://github.com/mockuser',
  website: 'https://mockuser.dev',
  current_title: 'Software Developer',
  years_experience: 3,
  education: 'BS Computer Science, Stanford University, 2021',
  work_experience: 'Software Engineer at TechCo (2021-2024): Built scalable web applications',
  projects: 'Open Source Contributor: React, Node.js projects',
  skills: 'JavaScript, TypeScript, React, Node.js, Python, PostgreSQL',
  certifications: 'AWS Certified Developer',
  ai_notes: 'Only interested in music-related software engineering positions',
  approved: true,
  is_admin: false,
  subscription_status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const MockSearchSettings = {
  id: 'mock-settings-1',
  user_id: 'mock-user-1',
  job_titles: ['Software Engineer', 'Full Stack Developer', 'Frontend Engineer'],
  locations: ['San Francisco, CA', 'Remote', 'New York, NY'],
  min_salary: 100000,
  max_salary: 180000,
  remote_only: false,
  job_types: ['full-time', 'contract'],
  email_frequency: 'daily',
  max_jobs_per_email: 20,
  include_resume: true,
  include_cover_letter: true,
  exclude_companies: ['BadCompany Inc'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const MockEmptyProfile = {
  id: 'mock-user-2',
  email: 'newuser@test.com',
  full_name: null,
  phone: null,
  location: null,
  linkedin: null,
  github: null,
  website: null,
  current_title: null,
  years_experience: null,
  education: null,
  work_experience: null,
  projects: null,
  skills: null,
  certifications: null,
  ai_notes: null,
  approved: false,
  is_admin: false,
  subscription_status: 'trial',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}