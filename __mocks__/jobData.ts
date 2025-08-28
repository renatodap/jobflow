// Mock data for job-related tests
// This file contains mock data prefixed with "Mock" as required by TDD rules

export const MockJob = {
  id: 'mock-job-1',
  job_id: 'job-123',
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'Remote',
  salary_min: 100000,
  salary_max: 150000,
  description: 'Join our innovative team to build cutting-edge applications using modern technologies. We are looking for passionate developers who love solving complex problems.',
  requirements: ['JavaScript', 'React', 'Node.js', '3+ years experience'],
  url: 'https://example.com/jobs/123',
  source: 'adzuna',
  score: 85,
  days_old: 3,
  status: 'pending',
  contract_type: 'full-time',
  category: 'Software Development'
}

export const MockJobList = [
  MockJob,
  {
    id: 'mock-job-2',
    job_id: 'job-456',
    title: 'Frontend Developer',
    company: 'Web Studio',
    location: 'San Francisco, CA',
    salary_min: 90000,
    salary_max: 130000,
    description: 'Create beautiful user interfaces for our web applications. Work with designers and backend engineers.',
    requirements: ['React', 'TypeScript', 'CSS', '2+ years experience'],
    url: 'https://example.com/jobs/456',
    source: 'indeed',
    score: 78,
    days_old: 5,
    status: 'pending',
    contract_type: 'full-time',
    category: 'Frontend'
  },
  {
    id: 'mock-job-3',
    job_id: 'job-789',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    salary_min: 110000,
    salary_max: 160000,
    description: 'Build and scale our platform from frontend to backend. Own features end-to-end.',
    requirements: ['Python', 'React', 'PostgreSQL', '4+ years experience'],
    url: 'https://example.com/jobs/789',
    source: 'linkedin',
    score: 92,
    days_old: 1,
    status: 'applied',
    contract_type: 'full-time',
    category: 'Full Stack'
  }
]

export const MockApplication = {
  id: 'mock-app-1',
  user_id: 'mock-user-1',
  job_id: 'mock-job-1',
  status: 'pending',
  applied_at: null,
  resume_version: null,
  cover_letter_generated: false,
  notes: null,
  response_received: false,
  response_date: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}