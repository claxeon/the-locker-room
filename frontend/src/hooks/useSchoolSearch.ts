/**
 * useSchoolSearch
 *
 * Searches the full schools directory (all 1,086 schools) by name, regardless
 * of whether they have reviews. Used by the College Comparison picker so users
 * can find any school, not just the handful that have been reviewed.
 *
 * Returns basic school info + any program_aggregate data if it exists, so
 * the comparison card can show a radar when data is available or a "no reviews
 * yet" state when it isn't.
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type SchoolSearchResult = {
  schoolId: number
  name: string
  division: string
  sanction: string
  state: string
  location: string
  logoUrl: string | null
  hasReviews: boolean
  reviewCount: number
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
}

async function fetchSchoolSearch(query: string): Promise<SchoolSearchResult[]> {
  if (!query || query.trim().length < 2) return []

  // 1. Search schools table directly
  const { data: schoolData, error: schoolError } = await supabase
    .from('schools')
    .select('school_id, institution_name, state_cd, classification_name, sanction_name, logo_url')
    .ilike('institution_name', `%${query.trim()}%`)
    .order('institution_name')
    .limit(20)

  if (schoolError) throw schoolError
  if (!schoolData || schoolData.length === 0) return []

  const schoolIds = schoolData.map((s) => s.school_id as number)

  // 2. Pull any existing aggregates for these schools (optional — may be empty)
  const { data: aggData } = await supabase
    .from('program_aggregates')
    .select(
      'school_id, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating, review_count'
    )
    .in('school_id', schoolIds)
    .gt('review_count', 0)

  // Build a map of school_id → weighted aggregate across all sports
  const aggMap = new Map<
    number,
    {
      facilities: number
      coaching: number
      balance: number
      support: number
      culture: number
      equity: number
      reviewCount: number
      totalWeight: number
    }
  >()

  for (const row of aggData ?? []) {
    const sid = row.school_id as number
    const w = (row.review_count as number) || 1
    const existing = aggMap.get(sid) ?? {
      facilities: 0, coaching: 0, balance: 0,
      support: 0, culture: 0, equity: 0,
      reviewCount: 0, totalWeight: 0,
    }
    existing.totalWeight += w
    existing.facilities  += (row.facilities_rating  as number) * w
    existing.coaching    += (row.coaching_rating    as number) * w
    existing.balance     += (row.balance_rating     as number) * w
    existing.support     += (row.support_rating     as number) * w
    existing.culture     += (row.culture_rating     as number) * w
    existing.equity      += (row.equity_rating      as number) * w
    existing.reviewCount += w
    aggMap.set(sid, existing)
  }

  return schoolData.map((s) => {
    const sid = s.school_id as number
    const agg = aggMap.get(sid)
    const tw = agg?.totalWeight ?? 1

    return {
      schoolId: sid,
      name: s.institution_name as string,
      division: (s.classification_name as string) ?? '',
      sanction: (s.sanction_name as string) ?? '',
      state: (s.state_cd as string) ?? '',
      location: (s.state_cd as string) ?? '',
      logoUrl: (s.logo_url as string | null) ?? null,
      hasReviews: !!agg,
      reviewCount: agg?.reviewCount ?? 0,
      facilities: agg ? Number((agg.facilities / tw).toFixed(2)) : 0,
      coaching:   agg ? Number((agg.coaching   / tw).toFixed(2)) : 0,
      balance:    agg ? Number((agg.balance    / tw).toFixed(2)) : 0,
      support:    agg ? Number((agg.support    / tw).toFixed(2)) : 0,
      culture:    agg ? Number((agg.culture    / tw).toFixed(2)) : 0,
      equity:     agg ? Number((agg.equity     / tw).toFixed(2)) : 0,
    }
  })
}

export function useSchoolSearch(query: string) {
  return useQuery({
    queryKey: ['school-search', query],
    queryFn: () => fetchSchoolSearch(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}
