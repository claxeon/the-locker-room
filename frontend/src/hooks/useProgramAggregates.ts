import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '../lib/supabase'

export type ProgramAggregateFilters = {
  division?: string
  state?: string
  gender?: string
  sport?: string
  name?: string
}

export type ProgramAggregateSchool = {
  schoolId: string
  name: string
  division: string
  state: string
  location: string
  logoUrl: string | null
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
  reviewCount: number
}

export type UseProgramAggregatesParams = {
  filters?: ProgramAggregateFilters
  page?: number
  pageSize?: number
  enabled?: boolean
}

type FetchResponse = {
  data: ProgramAggregateSchool[]
  total: number
}

const normalizeNumber = (value: number | string | null | undefined) => {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return Number(numeric.toFixed(2))
}

const fetchProgramAggregates = async ({
  filters,
  page = 1,
  pageSize = 20,
}: UseProgramAggregatesParams): Promise<FetchResponse> => {
  // Step 1: Get all program_aggregates with review_count > 0
  // We need school-level aggregates, so fetch all rows and group client-side
  let aggQuery = supabase
    .from('program_aggregates')
    .select(
      'school_id, sport, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating, review_count'
    )
    .gt('review_count', 0)

  // If filtering by sport, apply to aggregates directly
  if (filters?.sport) {
    aggQuery = aggQuery.eq('sport', filters.sport)
  }

  const { data: aggData, error: aggError } = await aggQuery
  if (aggError) throw aggError

  // If no data yet (no reviews submitted), return early — no infinite loading
  if (!aggData || aggData.length === 0) {
    return { data: [], total: 0 }
  }

  // Group by school_id and compute weighted averages across sports
  const schoolMap = new Map<
    number,
    {
      totalWeight: number
      facilities: number
      coaching: number
      balance: number
      support: number
      culture: number
      equity: number
      reviewCount: number
    }
  >()

  for (const row of aggData) {
    const sid = row.school_id as number
    const w = (row.review_count as number) || 1
    const existing = schoolMap.get(sid) ?? {
      totalWeight: 0,
      facilities: 0,
      coaching: 0,
      balance: 0,
      support: 0,
      culture: 0,
      equity: 0,
      reviewCount: 0,
    }
    existing.totalWeight += w
    existing.facilities += (row.facilities_rating as number) * w
    existing.coaching += (row.coaching_rating as number) * w
    existing.balance += (row.balance_rating as number) * w
    existing.support += (row.support_rating as number) * w
    existing.culture += (row.culture_rating as number) * w
    existing.equity += (row.equity_rating as number) * w
    existing.reviewCount += w
    schoolMap.set(sid, existing)
  }

  if (schoolMap.size === 0) {
    return { data: [], total: 0 }
  }

  // Step 2: Fetch school info for all school_ids that have reviews
  // If gender filter is active, narrow via sports_offered join
  let filteredSchoolIds = Array.from(schoolMap.keys())

  if (filters?.gender) {
    const { data: genderRows, error: genderError } = await supabase
      .from('sports_offered')
      .select('school_id')
      .eq('gender', filters.gender)
      .in('school_id', filteredSchoolIds)

    if (genderError) throw genderError

    const genderSchoolIds = Array.from(
      new Set((genderRows ?? []).map((r) => r.school_id as number))
    )

    if (genderSchoolIds.length === 0) {
      return { data: [], total: 0 }
    }

    filteredSchoolIds = genderSchoolIds
  }

  let schoolQuery = supabase
    .from('schools')
    .select('school_id, institution_name, state_cd, classification_name, sanction_name, logo_url')
    .in('school_id', filteredSchoolIds)

  // Apply division and state filters on the schools table
  if (filters?.division) {
    schoolQuery = schoolQuery.eq('classification_name', filters.division)
  }
  if (filters?.state) {
    schoolQuery = schoolQuery.eq('state_cd', filters.state)
  }
  // Apply name search
  if (filters?.name && filters.name.trim().length > 0) {
    schoolQuery = schoolQuery.ilike('institution_name', `%${filters.name.trim()}%`)
  }

  const { data: schoolData, error: schoolError } = await schoolQuery
  if (schoolError) throw schoolError

  // Build final list, sorted by composite score desc
  const results: ProgramAggregateSchool[] = (schoolData ?? []).map((school) => {
    const agg = schoolMap.get(school.school_id as number)!
    const tw = agg.totalWeight
    return {
      schoolId: String(school.school_id),
      name: school.institution_name as string,
      division: (school.classification_name as string) ?? 'N/A',
      state: (school.state_cd as string) ?? 'N/A',
      location: (school.state_cd as string) ?? 'N/A',
      logoUrl: (school.logo_url as string | null) ?? null,
      facilities: normalizeNumber(agg.facilities / tw),
      coaching: normalizeNumber(agg.coaching / tw),
      balance: normalizeNumber(agg.balance / tw),
      support: normalizeNumber(agg.support / tw),
      culture: normalizeNumber(agg.culture / tw),
      equity: normalizeNumber(agg.equity / tw),
      reviewCount: agg.reviewCount,
    }
  })

  // Sort by composite score descending
  results.sort((a, b) => {
    const compA =
      (a.facilities + a.coaching + a.balance + a.support + a.culture + a.equity) / 6
    const compB =
      (b.facilities + b.coaching + b.balance + b.support + b.culture + b.equity) / 6
    return compB - compA
  })

  // Paginate client-side
  const total = results.length
  const from = (page - 1) * pageSize
  const paginated = results.slice(from, from + pageSize)

  return { data: paginated, total }
}

export const useProgramAggregates = ({
  filters,
  page = 1,
  pageSize = 20,
  enabled = true,
}: UseProgramAggregatesParams) => {
  const fetcher = useCallback(
    () => fetchProgramAggregates({ filters, page, pageSize }),
    [filters, page, pageSize]
  )

  return useQuery<FetchResponse, Error>({
    queryKey: ['program-aggregates', filters, page, pageSize],
    queryFn: fetcher,
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
}

export type ComparisonTableSchool = ProgramAggregateSchool & {
  composite?: number
}
