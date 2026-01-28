'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { HomepageData } from '@/lib/types/public.types';
import { fetchHomepageData } from './homepage.api';

// Query keys
export const publicKeys = {
  all: ['public'] as const,
  homepage: () => [...publicKeys.all, 'homepage'] as const,
};

// ========== Homepage Hook ==========

export function useHomepageData(): UseQueryResult<HomepageData, Error> {
  return useQuery({
    queryKey: publicKeys.homepage(),
    queryFn: fetchHomepageData,
    staleTime: 5 * 60 * 1000, // 5 minutes (homepage data doesn't change frequently)
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 3, // Retry failed requests
  });
}
