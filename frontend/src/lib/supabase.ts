import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY must be set in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our data
export interface SchoolProfile {
  school_id: number  // INTEGER in DB
  slug: string
  institution_name: string
  state_cd: string
  classification_name: string
  sanction_name: string
  logo_url: string | null
  programs: Array<{
    sport: string
    gender: string
  }>
}

export interface SportsDirectoryEntry {
  school_id: number  // INTEGER in DB
  slug: string
  institution_name: string
  state_cd: string
  classification_name: string
  sanction_name: string
  logo_url: string | null
  sport: string
  gender: string
} 