import { useQuery } from '@tanstack/react-query'

import { supabase } from '../lib/supabase'

type FilterOptions = {
  divisions: string[]
  states: string[]
  genders: string[]
}

const normalize = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const [{ data: divisionRows, error: divisionError }, { data: stateRows, error: stateError }, { data: genderRows, error: genderError }] =
    await Promise.all([
      supabase.from('schools_rows').select('division'),
      supabase.from('schools_rows').select('state_cd'),
      supabase.from('sports_offered_rows').select('gender'),
    ])

  if (divisionError) throw divisionError
  if (stateError) throw stateError
  if (genderError) throw genderError

  return {
    divisions: normalize((divisionRows || []).map((row) => row.division as string | null | undefined)),
    states: normalize((stateRows || []).map((row) => row.state_cd as string | null | undefined)),
    genders: normalize((genderRows || []).map((row) => row.gender as string | null | undefined)),
  }
}

export const useComparisonFilters = () =>
  useQuery<FilterOptions, Error>({
    queryKey: ['comparison-filters'],
    queryFn: fetchFilterOptions,
    staleTime: 1000 * 60 * 10,
  })
