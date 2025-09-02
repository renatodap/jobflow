/**
 * Feel Sharper Database Types
 * Generated from Supabase schema migrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type GoalTypeEnum = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health' | 'sport_specific' | 'marathon'
export type ExperienceLevelEnum = 'beginner' | 'intermediate' | 'advanced'
export type UnitWeightEnum = 'kg' | 'lb'
export type UnitDistanceEnum = 'km' | 'mi'
export type WorkoutTypeEnum = 'strength' | 'cardio' | 'flexibility' | 'sport'
export type ExerciseTypeEnum = 'reps' | 'time' | 'distance'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          locale: string
          units_weight: UnitWeightEnum
          units_distance: UnitDistanceEnum
          goal_type: GoalTypeEnum | null
          experience_level: ExperienceLevelEnum | null
          age: number | null
          height_cm: number | null
          starting_weight_kg: number | null
          target_weight_kg: number | null
          activity_level: number | null
          weekly_sessions: number | null
          session_duration_min: number | null
          target_date: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          locale?: string
          units_weight?: UnitWeightEnum
          units_distance?: UnitDistanceEnum
          goal_type?: GoalTypeEnum | null
          experience_level?: ExperienceLevelEnum | null
          age?: number | null
          height_cm?: number | null
          starting_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: number | null
          weekly_sessions?: number | null
          session_duration_min?: number | null
          target_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          locale?: string
          units_weight?: UnitWeightEnum
          units_distance?: UnitDistanceEnum
          goal_type?: GoalTypeEnum | null
          experience_level?: ExperienceLevelEnum | null
          age?: number | null
          height_cm?: number | null
          starting_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: number | null
          weekly_sessions?: number | null
          session_duration_min?: number | null
          target_date?: string | null
        }
      }
      foods: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          fdc_id: number | null
          description: string
          brand_name: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_100g: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          category: string | null
          verified: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          fdc_id?: number | null
          description: string
          brand_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          category?: string | null
          verified?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          fdc_id?: number | null
          description?: string
          brand_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          category?: string | null
          verified?: boolean
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          date: string
          workout_type: WorkoutTypeEnum
          duration_minutes: number | null
          calories_burned: number | null
          notes: string | null
          exercises: Json
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          date: string
          workout_type: WorkoutTypeEnum
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          exercises?: Json
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          date?: string
          workout_type?: WorkoutTypeEnum
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          exercises?: Json
          completed?: boolean
        }
      }
      body_weight: {
        Row: {
          id: string
          user_id: string
          created_at: string
          date: string
          weight_kg: number
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          date: string
          weight_kg: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          date?: string
          weight_kg?: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
        }
      }
      custom_foods: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_serving: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          is_recipe: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_recipe?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_recipe?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          date: string
          meal_type: string
          food_id: number
          quantity_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          date: string
          meal_type: string
          food_id: number
          quantity_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          date?: string
          meal_type?: string
          food_id?: number
          quantity_g?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          notes?: string | null
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          servings: number | null
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          instructions: string[] | null
          tags: string[] | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          servings?: number | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          instructions?: string[] | null
          tags?: string[] | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          servings?: number | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          instructions?: string[] | null
          tags?: string[] | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          food_id: number | null
          custom_food_id: string | null
          quantity: number
          unit: string
          notes: string | null
          order_index: number | null
        }
        Insert: {
          id?: string
          recipe_id: string
          food_id?: number | null
          custom_food_id?: string | null
          quantity: number
          unit: string
          notes?: string | null
          order_index?: number | null
        }
        Update: {
          id?: string
          recipe_id?: string
          food_id?: number | null
          custom_food_id?: string | null
          quantity?: number
          unit?: string
          notes?: string | null
          order_index?: number | null
        }
      }
      meal_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          meal_type: string | null
          is_favorite: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          meal_type?: string | null
          is_favorite?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          meal_type?: string | null
          is_favorite?: boolean | null
          created_at?: string
        }
      }
      meal_template_items: {
        Row: {
          id: string
          template_id: string
          food_id: number | null
          custom_food_id: string | null
          recipe_id: string | null
          quantity: number
          unit: string
        }
        Insert: {
          id?: string
          template_id: string
          food_id?: number | null
          custom_food_id?: string | null
          recipe_id?: string | null
          quantity: number
          unit: string
        }
        Update: {
          id?: string
          template_id?: string
          food_id?: number | null
          custom_food_id?: string | null
          recipe_id?: string | null
          quantity?: number
          unit?: string
        }
      }
      workout_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          goal_type: string | null
          experience_level: string | null
          duration_weeks: number | null
          sessions_per_week: number | null
          equipment_required: string[] | null
          created_by: string | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          goal_type?: string | null
          experience_level?: string | null
          duration_weeks?: number | null
          sessions_per_week?: number | null
          equipment_required?: string[] | null
          created_by?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          goal_type?: string | null
          experience_level?: string | null
          duration_weeks?: number | null
          sessions_per_week?: number | null
          equipment_required?: string[] | null
          created_by?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          program_id: string
          name: string
          description: string | null
          week_number: number
          day_number: number
          estimated_duration_minutes: number | null
          exercises: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          description?: string | null
          week_number: number
          day_number: number
          estimated_duration_minutes?: number | null
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          description?: string | null
          week_number?: number
          day_number?: number
          estimated_duration_minutes?: number | null
          exercises?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_programs: {
        Row: {
          id: string
          user_id: string
          program_id: string
          started_at: string
          current_week: number | null
          current_day: number | null
          is_active: boolean | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_id: string
          started_at?: string
          current_week?: number | null
          current_day?: number | null
          is_active?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string
          started_at?: string
          current_week?: number | null
          current_day?: number | null
          is_active?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          exercise_name: string
          record_type: string
          value: number
          unit: string
          workout_id: string | null
          achieved_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_name: string
          record_type: string
          value: number
          unit: string
          workout_id?: string | null
          achieved_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_name?: string
          record_type?: string
          value?: number
          unit?: string
          workout_id?: string | null
          achieved_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          measurement_date: string
          weight_kg: number | null
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          visceral_fat_level: number | null
          water_percentage: number | null
          bone_mass_kg: number | null
          metabolic_age: number | null
          waist_cm: number | null
          chest_cm: number | null
          arm_cm: number | null
          thigh_cm: number | null
          hip_cm: number | null
          neck_cm: number | null
          progress_photo_front: string | null
          progress_photo_side: string | null
          progress_photo_back: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          measurement_date: string
          weight_kg?: number | null
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          visceral_fat_level?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          metabolic_age?: number | null
          waist_cm?: number | null
          chest_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          hip_cm?: number | null
          neck_cm?: number | null
          progress_photo_front?: string | null
          progress_photo_side?: string | null
          progress_photo_back?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          measurement_date?: string
          weight_kg?: number | null
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          visceral_fat_level?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          metabolic_age?: number | null
          waist_cm?: number | null
          chest_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          hip_cm?: number | null
          neck_cm?: number | null
          progress_photo_front?: string | null
          progress_photo_side?: string | null
          progress_photo_back?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_weight_kg: number | null
          target_body_fat_percentage: number | null
          target_muscle_mass_kg: number | null
          target_date: string | null
          weekly_rate_kg: number | null
          starting_weight_kg: number | null
          starting_body_fat_percentage: number | null
          starting_muscle_mass_kg: number | null
          is_active: boolean | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_weight_kg?: number | null
          target_body_fat_percentage?: number | null
          target_muscle_mass_kg?: number | null
          target_date?: string | null
          weekly_rate_kg?: number | null
          starting_weight_kg?: number | null
          starting_body_fat_percentage?: number | null
          starting_muscle_mass_kg?: number | null
          is_active?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_weight_kg?: number | null
          target_body_fat_percentage?: number | null
          target_muscle_mass_kg?: number | null
          target_date?: string | null
          weekly_rate_kg?: number | null
          starting_weight_kg?: number | null
          starting_body_fat_percentage?: number | null
          starting_muscle_mass_kg?: number | null
          is_active?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_trends: {
        Row: {
          id: string
          user_id: string
          calculation_date: string
          weight_7day_ema: number | null
          weight_trend_direction: string | null
          weight_weekly_change_kg: number | null
          body_fat_7day_ema: number | null
          muscle_mass_7day_ema: number | null
          data_points_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calculation_date: string
          weight_7day_ema?: number | null
          weight_trend_direction?: string | null
          weight_weekly_change_kg?: number | null
          body_fat_7day_ema?: number | null
          muscle_mass_7day_ema?: number | null
          data_points_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calculation_date?: string
          weight_7day_ema?: number | null
          weight_trend_direction?: string | null
          weight_weekly_change_kg?: number | null
          body_fat_7day_ema?: number | null
          muscle_mass_7day_ema?: number | null
          data_points_count?: number | null
          created_at?: string
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
      goal_type_enum: GoalTypeEnum
      experience_level_enum: ExperienceLevelEnum
      unit_weight_enum: UnitWeightEnum
      unit_distance_enum: UnitDistanceEnum
      workout_type_enum: WorkoutTypeEnum
      exercise_type_enum: ExerciseTypeEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Food = Database['public']['Tables']['foods']['Row']
export type FoodInsert = Database['public']['Tables']['foods']['Insert']
export type FoodUpdate = Database['public']['Tables']['foods']['Update']

export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

export type BodyWeight = Database['public']['Tables']['body_weight']['Row']
export type BodyWeightInsert = Database['public']['Tables']['body_weight']['Insert']
export type BodyWeightUpdate = Database['public']['Tables']['body_weight']['Update']

export type NutritionLog = Database['public']['Tables']['nutrition_logs']['Row']
export type NutritionLogInsert = Database['public']['Tables']['nutrition_logs']['Insert']
export type NutritionLogUpdate = Database['public']['Tables']['nutrition_logs']['Update']

export type CustomFood = Database['public']['Tables']['custom_foods']['Row']
export type CustomFoodInsert = Database['public']['Tables']['custom_foods']['Insert']
export type CustomFoodUpdate = Database['public']['Tables']['custom_foods']['Update']

export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert']
export type RecipeIngredientUpdate = Database['public']['Tables']['recipe_ingredients']['Update']

export type MealTemplate = Database['public']['Tables']['meal_templates']['Row']
export type MealTemplateInsert = Database['public']['Tables']['meal_templates']['Insert']
export type MealTemplateUpdate = Database['public']['Tables']['meal_templates']['Update']

export type MealTemplateItem = Database['public']['Tables']['meal_template_items']['Row']
export type MealTemplateItemInsert = Database['public']['Tables']['meal_template_items']['Insert']
export type MealTemplateItemUpdate = Database['public']['Tables']['meal_template_items']['Update']

// Extended types with relations
export interface MealTemplateWithItems extends MealTemplate {
  meal_template_items?: (MealTemplateItem & {
    foods?: Food
    custom_foods?: CustomFood
    recipes?: Recipe
  })[]
}

export type WorkoutProgram = Database['public']['Tables']['workout_programs']['Row']
export type WorkoutProgramInsert = Database['public']['Tables']['workout_programs']['Insert']
export type WorkoutProgramUpdate = Database['public']['Tables']['workout_programs']['Update']

export type WorkoutTemplate = Database['public']['Tables']['workout_templates']['Row']
export type WorkoutTemplateInsert = Database['public']['Tables']['workout_templates']['Insert']
export type WorkoutTemplateUpdate = Database['public']['Tables']['workout_templates']['Update']

export type UserProgram = Database['public']['Tables']['user_programs']['Row']
export type UserProgramInsert = Database['public']['Tables']['user_programs']['Insert']
export type UserProgramUpdate = Database['public']['Tables']['user_programs']['Update']

export type PersonalRecord = Database['public']['Tables']['personal_records']['Row']
export type PersonalRecordInsert = Database['public']['Tables']['personal_records']['Insert']
export type PersonalRecordUpdate = Database['public']['Tables']['personal_records']['Update']

// Extended types with relations
export interface WorkoutProgramWithTemplates extends WorkoutProgram {
  workout_templates?: WorkoutTemplate[]
}

export interface UserProgramWithDetails extends UserProgram {
  workout_programs?: WorkoutProgramWithTemplates
}

export type BodyMeasurement = Database['public']['Tables']['body_measurements']['Row']
export type BodyMeasurementInsert = Database['public']['Tables']['body_measurements']['Insert']
export type BodyMeasurementUpdate = Database['public']['Tables']['body_measurements']['Update']

export type BodyGoal = Database['public']['Tables']['body_goals']['Row']
export type BodyGoalInsert = Database['public']['Tables']['body_goals']['Insert']
export type BodyGoalUpdate = Database['public']['Tables']['body_goals']['Update']

export type BodyTrend = Database['public']['Tables']['body_trends']['Row']
export type BodyTrendInsert = Database['public']['Tables']['body_trends']['Insert']
export type BodyTrendUpdate = Database['public']['Tables']['body_trends']['Update']

// Exercise structure for workouts
export interface Exercise {
  name: string
  type: ExerciseTypeEnum
  sets?: ExerciseSet[]
  duration_seconds?: number
  distance_km?: number
  notes?: string
}

export interface ExerciseSet {
  reps?: number
  weight_kg?: number
  duration_seconds?: number
  rest_seconds?: number
  completed: boolean
}