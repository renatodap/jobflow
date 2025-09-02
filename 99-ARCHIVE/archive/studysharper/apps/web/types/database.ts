/**
 * Database type definitions for Supabase
 * These types should be generated from your Supabase schema
 * For now, this is a basic structure that can be expanded
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add more tables as needed
    }
    Views: {
      // Add views if any
    }
    Functions: {
      // Add functions if any
    }
    Enums: {
      // Add enums if any
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type NewUser = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']