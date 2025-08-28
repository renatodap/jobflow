export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
          preferences: Json | null
          subscription_status: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
          preferences?: Json | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
          preferences?: Json | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          location: string | null
          description: string | null
          url: string | null
          status: string
          score: number | null
          applied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          location?: string | null
          description?: string | null
          url?: string | null
          status?: string
          score?: number | null
          applied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          location?: string | null
          description?: string | null
          url?: string | null
          status?: string
          score?: number | null
          applied_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}