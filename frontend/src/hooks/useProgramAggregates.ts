import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '../lib/supabase'

const MAX_ROWS = 50

export type ProgramAggregateFilters = {
  division?: string
  state?: string
  gender?: string
  sport?: string
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
  const from = Math.max((page - 1) * pageSize, 0)
  if (from >= MAX_ROWS) {
    return { data: [], total: 0 }
  }

  const to = Math.min(from + pageSize - 1, MAX_ROWS - 1)

  let allowedSchoolIds: string[] | undefined

  if (filters?.sport || filters?.gender) {
    let sportsQuery = supabase
      .from('sports_offered_rows')
      .select('school_id')

    if (filters.sport) {
      sportsQuery = sportsQuery.eq('sport', filters.sport)
    }

    if (filters.gender) {
      sportsQuery = sportsQuery.eq('gender', filters.gender)
    }

    if (filters.division) {
      sportsQuery = sportsQuery.eq('division', filters.division)
    }

    const { data: sportsRows, error: sportsError } = await sportsQuery
    if (sportsError) throw sportsError

    const schoolIds = Array.from(
      new Set((sportsRows || []).map((row) => row.school_id).filter(Boolean))
    ) as string[]

    if (!schoolIds.length) {
      return { data: [], total: 0 }
    }

    allowedSchoolIds = schoolIds
  }

  let aggregatesQuery = supabase
    .from('program_aggregates')
    .select(
      `
        school_id,
        facilities_rating,
        coaching_rating,
        balance_rating,
        support_rating,
        culture_rating,
        equity_rating,
        review_count,
        schools_rows(name, division, state_cd, location, logo_url)
      `,
      { count: 'exact' }
    )
    .order('facilities_rating', { ascending: false })

  if (filters?.division) {
    aggregatesQuery = aggregatesQuery.eq('schools_rows.division', filters.division)
  }

  if (filters?.state) {
    aggregatesQuery = aggregatesQuery.eq('schools_rows.state_cd', filters.state)
  }

  if (allowedSchoolIds) {
    aggregatesQuery = aggregatesQuery.in('school_id', allowedSchoolIds)
  }

  const { data, error, count } = await aggregatesQuery.range(from, to)

  if (error) throw error

  const rows = (data || []) as Array<Record<string, unknown>>

  const transformed: ProgramAggregateSchool[] = rows.map((row) => {
    const schoolsRows = row['schools_rows']
    const school = Array.isArray(schoolsRows) ? schoolsRows[0] : schoolsRows

    return {
      schoolId: String(row['school_id'] ?? ''),
      name: (school as Record<string, unknown>)?.['name']?.toString() ?? 'Unknown',
      division: (school as Record<string, unknown>)?.['division']?.toString() ?? 'N/A',
      state: (school as Record<string, unknown>)?.['state_cd']?.toString() ?? 'N/A',
      location: (school as Record<string, unknown>)?.['location']?.toString() ?? 'N/A',
      logoUrl: ((school as Record<string, unknown>)?.['logo_url'] as string | null) ?? null,
      facilities: normalizeNumber(row['facilities_rating'] as number | null | undefined),
      coaching: normalizeNumber(row['coaching_rating'] as number | null | undefined),
      balance: normalizeNumber(row['balance_rating'] as number | null | undefined),
      support: normalizeNumber(row['support_rating'] as number | null | undefined),
      culture: normalizeNumber(row['culture_rating'] as number | null | undefined),
      equity: normalizeNumber(row['equity_rating'] as number | null | undefined),
      reviewCount: Math.max((row['review_count'] as number | null | undefined) ?? 0, 0),
    }
  })

  return {
    data: transformed,
    total: Math.min(count ?? transformed.length, MAX_ROWS),
  }
}

export const useProgramAggregates = ({
  filters,
  page = 1,
  pageSize = 20,
}: UseProgramAggregatesParams) => {
  const fetcher = useCallback(
    () => fetchProgramAggregates({ filters, page, pageSize }),
    [filters, page, pageSize]
  )

  return useQuery<FetchResponse, Error>({
    queryKey: ['program-aggregates', filters, page, pageSize],
    queryFn: fetcher,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
}

export type ComparisonTableSchool = ProgramAggregateSchool & {
  composite?: number
}
