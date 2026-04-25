/**
 * database.types.ts
 *
 * Comprehensive TypeScript types derived from the Supabase schema for The Locker Room.
 * Provides type-safe DB queries via the typed Supabase client.
 *
 * Schema: public
 * Generated for: @supabase/supabase-js ^2.x
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

/** Gender field as stored in `reviews` (CHECK constraint in DB) */
export type ReviewGender = "Men's" | "Women's" | 'Mixed'

/** Gender field as stored in `sports_offered` */
export type SportsGender = 'Men' | 'Women'

export type VoteType = 'helpful' | 'flag'

// ---------------------------------------------------------------------------
// Row types — shape returned by SELECT
// ---------------------------------------------------------------------------

export interface SchoolRow {
  school_id: number
  institution_name: string
  state_cd: string
  classification_name: string
  sanction_name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export interface SportsOfferedRow {
  id: number
  school_id: number
  sport: string
  gender: SportsGender
  sanction_name: string
}

export interface ProfileRow {
  id: string
  full_name: string | null
  school_id: number | null
  sport: string | null
  gender: string | null
  graduation_year: number | null
  verification_status: VerificationStatus
  is_admin: boolean
  avatar_url: string | null
  created_at: string
}

export interface ReviewRow {
  id: string
  school_id: number
  user_id: string
  sport: string
  gender: ReviewGender
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  review_text: string | null
  pros: string | null
  cons: string | null
  helpful_count: number
  flagged_count: number
  is_anonymous: boolean
  moderation_status: ModerationStatus
  created_at: string
  updated_at: string
}

export interface RosterSubmissionRow {
  id: string
  user_id: string
  school_id: number
  sport: string
  gender: string
  graduation_year: number | null
  roster_url: string | null
  notes: string | null
  status: SubmissionStatus
  created_at: string
}

export interface ProgramAggregateRow {
  school_id: number
  sport: string
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  review_count: number
  last_updated: string
}

export interface ReviewVoteRow {
  id: string
  review_id: string
  user_id: string
  vote_type: VoteType
  flag_reason: string | null
}

// ---------------------------------------------------------------------------
// Insert types — used when calling .insert(); optional fields are optional
// ---------------------------------------------------------------------------

export interface SchoolInsert {
  /** If omitted, the DB assigns a serial PK */
  school_id?: number
  institution_name: string
  state_cd: string
  classification_name: string
  sanction_name: string
  slug: string
  logo_url?: string | null
  /** Defaults to now() in DB */
  created_at?: string
}

export interface ReviewInsert {
  /** If omitted, defaults to gen_random_uuid() */
  id?: string
  school_id: number
  user_id: string
  sport: string
  gender: ReviewGender
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  review_text?: string | null
  pros?: string | null
  cons?: string | null
  /** Defaults to 0 */
  helpful_count?: number
  /** Defaults to 0 */
  flagged_count?: number
  /** Defaults to false */
  is_anonymous?: boolean
  /** Defaults to 'pending' */
  moderation_status?: ModerationStatus
  created_at?: string
  updated_at?: string
}

export interface RosterSubmissionInsert {
  id?: string
  user_id: string
  school_id: number
  sport: string
  gender: string
  graduation_year?: number | null
  roster_url?: string | null
  notes?: string | null
  /** Defaults to 'pending' */
  status?: SubmissionStatus
  created_at?: string
}

export interface ReviewVoteInsert {
  id?: string
  review_id: string
  user_id: string
  vote_type: VoteType
  flag_reason?: string | null
}

export interface ProfileInsert {
  /** Must match auth.users id */
  id: string
  full_name?: string | null
  school_id?: number | null
  sport?: string | null
  gender?: string | null
  graduation_year?: number | null
  /** Defaults to 'pending' */
  verification_status?: VerificationStatus
  /** Defaults to false */
  is_admin?: boolean
  avatar_url?: string | null
  created_at?: string
}

// ---------------------------------------------------------------------------
// Update types — all fields optional
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<Omit<ProfileInsert, 'id'>>

export type ReviewUpdate = Partial<ReviewInsert>

export type RosterSubmissionUpdate = Partial<RosterSubmissionInsert>

// ---------------------------------------------------------------------------
// Master Database interface (Supabase client format)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: SchoolRow
        Insert: SchoolInsert
        Update: Partial<SchoolInsert>
      }
      sports_offered: {
        Row: SportsOfferedRow
        Insert: {
          id?: number
          school_id: number
          sport: string
          gender: SportsGender
          sanction_name: string
        }
        Update: Partial<{
          id: number
          school_id: number
          sport: string
          gender: SportsGender
          sanction_name: string
        }>
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      reviews: {
        Row: ReviewRow
        Insert: ReviewInsert
        Update: ReviewUpdate
      }
      roster_submissions: {
        Row: RosterSubmissionRow
        Insert: RosterSubmissionInsert
        Update: RosterSubmissionUpdate
      }
      program_aggregates: {
        Row: ProgramAggregateRow
        Insert: {
          school_id: number
          sport: string
          facilities_rating: number
          coaching_rating: number
          balance_rating: number
          support_rating: number
          culture_rating: number
          equity_rating: number
          review_count: number
          last_updated: string
        }
        Update: Partial<ProgramAggregateRow>
      }
      review_votes: {
        Row: ReviewVoteRow
        Insert: ReviewVoteInsert
        Update: Partial<ReviewVoteInsert>
      }
    }
    Views: {
      v_school_profile: {
        Row: Record<string, unknown>
      }
      v_sports_directory: {
        Row: Record<string, unknown>
      }
      v_sports_offered: {
        Row: Record<string, unknown>
      }
    }
    Functions: {
      increment_helpful_count: {
        Args: { p_review_id: string; p_delta: number }
        Returns: void
      }
      increment_flagged_count: {
        Args: { p_review_id: string; p_delta: number }
        Returns: void
      }
      is_current_user_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      refresh_program_aggregates: {
        Args: { school_id: number }
        Returns: void
      }
    }
    Enums: {
      verification_status: VerificationStatus
      moderation_status: ModerationStatus
      review_gender: ReviewGender
      sports_gender: SportsGender
      vote_type: VoteType
    }
  }
}

// ---------------------------------------------------------------------------
// Typed Supabase client helper
//
// Usage:
//   import { typedSupabase } from '../types/database.types'
//   const { data } = await typedSupabase.from('reviews').select('*')
// ---------------------------------------------------------------------------

export const typedSupabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
)
