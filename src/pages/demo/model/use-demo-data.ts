import { useQuery } from '@tanstack/react-query'

import { fetchDemoData } from '../api/fetch-demo-data'

export function useDemoData() {
  return useQuery({
    queryKey: ['demo', 'data'],
    queryFn: fetchDemoData,
  })
}
