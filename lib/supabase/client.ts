import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client-side Supabase client for React components
export const supabase = createClientComponentClient<Database>()

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Profile-specific queries
export const profileQueries = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  async getCompleteProfile(userId: string) {
    const { data, error } = await supabase.rpc('get_user_profile', { 
      user_uuid: userId 
    })
    
    return { data, error }
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getEducation(userId: string) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true })
    
    return { data, error }
  },

  async addEducation(userId: string, education: any) {
    const { data, error } = await supabase
      .from('education')
      .insert({
        user_id: userId,
        ...education
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateEducation(id: string, updates: any) {
    const { data, error } = await supabase
      .from('education')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteEducation(id: string) {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async getWorkExperience(userId: string) {
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
    
    return { data, error }
  },

  async addWorkExperience(userId: string, experience: any) {
    const { data, error } = await supabase
      .from('work_experience')
      .insert({
        user_id: userId,
        ...experience
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateWorkExperience(id: string, updates: any) {
    const { data, error } = await supabase
      .from('work_experience')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteWorkExperience(id: string) {
    const { error } = await supabase
      .from('work_experience')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async getSkills(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    return { data, error }
  },

  async addSkill(userId: string, skill: any) {
    const { data, error } = await supabase
      .from('skills')
      .insert({
        user_id: userId,
        ...skill
      })
      .select()
      .single()
    
    return { data, error }
  },

  async addSkillsBatch(userId: string, skills: any[]) {
    const skillsWithUserId = skills.map(skill => ({
      user_id: userId,
      ...skill
    }))
    
    const { data, error } = await supabase
      .from('skills')
      .insert(skillsWithUserId)
      .select()
    
    return { data, error }
  },

  async deleteSkill(id: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true })
    
    return { data, error }
  },

  async addProject(userId: string, project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        ...project
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateProject(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async getJobPreferences(userId: string) {
    const { data, error } = await supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  async updateJobPreferences(userId: string, preferences: any) {
    const { data, error } = await supabase
      .from('job_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getCertifications(userId: string) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })
    
    return { data, error }
  },

  async addCertification(userId: string, certification: any) {
    const { data, error } = await supabase
      .from('certifications')
      .insert({
        user_id: userId,
        ...certification
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getGeneratedMaterials(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('generated_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async saveGeneratedMaterial(userId: string, material: any) {
    const { data, error } = await supabase
      .from('generated_materials')
      .insert({
        user_id: userId,
        ...material
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getProfileCompleteness(userId: string) {
    const { data, error } = await supabase
      .from('profile_completeness')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  }
}