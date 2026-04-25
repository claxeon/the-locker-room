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
  sport?: string
  gender?: string
  state_cd?: string
}, page: number = 1, pageSize: number = 20) => {
  const [data, setData] = useState<SportsDirectoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Stable memoized filters — stringify to detect value changes
  const filterKey = useMemo(
    () => JSON.stringify(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters?.sport, filters?.gender, filters?.state_cd]
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const sport = filters?.sport || ''
        // gender filter is applied at sport level, not school level
        // const gender = filters?.gender || ''
        const state_cd = filters?.state_cd || ''

        // When a sport filter is active, pre-fetch matching school_ids from sports_offered
        let sportSchoolIds: number[] | null = null
        if (sport) {
          const { data: soData, error: soErr } = await supabase
            .from('sports_offered')
            .select('school_id')
            .eq('sport', sport)
          if (soErr) throw soErr
          sportSchoolIds = (soData || []).map((r: { school_id: number }) => r.school_id)
          // If no schools offer this sport, return empty immediately
          if (sportSchoolIds.length === 0) {
            setTotalCount(0)
            setData([])
            return
          }
        }

        // Build count query
        let countQuery = supabase
          .from('v_school_profile')
          .select('*', { count: 'exact', head: true })

        if (sportSchoolIds !== null) {
          countQuery = countQuery.in('school_id', sportSchoolIds)
        }
        if (state_cd) {
          countQuery = countQuery.eq('state_cd', state_cd)
        }
        // gender filter doesn't apply at school level (schools aren't gendered)
        // It's a sports_offered level filter — handled via sport+gender combo below

        const { count, error: countError } = await countQuery
        if (countError) throw countError
        setTotalCount(count || 0)

        // Build data query
        let query = supabase.from('v_school_profile').select('*')

        if (sportSchoolIds !== null) {
          query = query.in('school_id', sportSchoolIds)
        }
        if (state_cd) {
          query = query.eq('state_cd', state_cd)
        }

        // Pagination
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, pageSize])

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
        
        const { data, error } = await supabase
          .from('sports_offered')
          .select('sport')
          .not('sport', 'ilike', '%(Coed) team%')
          .not('sport', 'ilike', '%track combined%')
          .not('sport', 'ilike', '%participation%')
          .not('sport', 'ilike', 'Other sports%')
          .order('sport')

        if (error) throw error
        
        if (data && Array.isArray(data)) {
          const uniqueSports = Array.from(
            new Set(data.map(item => item.sport).filter(Boolean))
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
        
        const { data, error } = await supabase
          .from('v_school_profile')
          .select('state_cd')
          .order('state_cd')

        if (error) throw error
        
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
