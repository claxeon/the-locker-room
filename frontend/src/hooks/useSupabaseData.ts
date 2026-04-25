import { useState, useEffect, useMemo } from 'react'
import { supabase, SchoolProfile, SportsDirectoryEntry } from '../lib/supabase'

export const useSchoolProfile = (slug: string) => {
  const [data, setData] = useState<SchoolProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setLoading(false)
        setData([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('v_school_profile')
          .select('*')
          .eq('slug', slug)

        if (error) throw error
        setData(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  return { data, loading, error }
}

export const useSportsDirectory = (filters?: {
  classification_name?: string
  gender?: string
  state_cd?: string
}, page: number = 1, pageSize: number = 20) => {
  const [data, setData] = useState<SportsDirectoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First, get the total count for pagination
        let countQuery = supabase.from('v_school_profile').select('*', { count: 'exact', head: true })
        
        if (memoizedFilters?.classification_name) {
          countQuery = countQuery.eq('classification_name', memoizedFilters.classification_name)
        }
        if (memoizedFilters?.gender) {
          countQuery = countQuery.eq('gender', memoizedFilters.gender)
        }
        if (memoizedFilters?.state_cd) {
          countQuery = countQuery.eq('state_cd', memoizedFilters.state_cd)
        }

        const { count, error: countError } = await countQuery
        if (countError) throw countError
        setTotalCount(count || 0)

        // Now get the paginated data
        let query = supabase.from('v_school_profile').select('*')
        
        if (memoizedFilters?.classification_name) {
          query = query.eq('classification_name', memoizedFilters.classification_name)
        }
        if (memoizedFilters?.gender) {
          query = query.eq('gender', memoizedFilters.gender)
        }
        if (memoizedFilters?.state_cd) {
          query = query.eq('state_cd', memoizedFilters.state_cd)
        }

        // Add pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to).order('institution_name')

        const { data, error } = await query

        if (error) throw error

        setData(data || [])
      } catch (err) {
        console.error('useSportsDirectory: Caught error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [memoizedFilters, page, pageSize])

  return { data, loading, error, totalCount }
}

export const useAllSports = () => {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get all sports without pagination for the filter dropdown
        const { data, error } = await supabase
          .from('v_sports_offered')
          .select('sports')
          .order('sports')

        if (error) throw error
        
        // Get unique sports with proper type safety
        if (data && Array.isArray(data)) {
          const uniqueSports = Array.from(
            new Set(data.map(item => item.sports).filter(Boolean))
          ).sort()
          setData(uniqueSports)
        } else {
          setData([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

export const useAllStates = () => {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get all states without pagination for the filter dropdown
        const { data, error } = await supabase
          .from('v_school_profile')
          .select('state_cd')
          .order('state_cd')

        if (error) throw error
        
        // Get unique states with proper type safety
        if (data && Array.isArray(data)) {
          const uniqueStates = Array.from(
            new Set(data.map(item => item.state_cd).filter(Boolean))
          ).sort()
          setData(uniqueStates)
        } else {
          setData([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
} 