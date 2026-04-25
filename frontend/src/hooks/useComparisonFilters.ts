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
  const [
    { data: divisionRows, error: divError },
    { data: stateRows, error: stateError },
    { data: genderRows, error: genderError },
  ] = await Promise.all([
    supabase.from('schools').select('classification_name'),
    supabase.from('schools').select('state_cd'),
    supabase.from('sports_offered').select('gender'),
  ])

  if (divError) throw divError
  if (stateError) throw stateError
  if (genderError) throw genderError

  return {
    divisions: normalize(
      (divisionRows ?? []).map((r) => r.classification_name as string | null)
    ),
    states: normalize((stateRows ?? []).map((r) => r.state_cd as string | null)),
    genders: normalize((genderRows ?? []).map((r) => r.gender as string | null)),
  }
}

export const useComparisonFilters = () =>
  useQuery<FilterOptions, Error>({
    queryKey: ['comparison-filters'],
    queryFn: fetchFilterOptions,
    staleTime: 1000 * 60 * 10,
  })
