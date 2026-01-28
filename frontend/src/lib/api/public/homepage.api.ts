import axios from 'axios';
import type { HomepageData } from '@/lib/types/public.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const buildError = (action: string, error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    return new Error(`Failed to ${action}: ${message}`);
  }
  return error instanceof Error ? error : new Error(`Failed to ${action}`);
};

// ========== Public Homepage API ==========

export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    const { data } = await publicApi.get<HomepageData>('/homepage/tables');
    
    // Ensure data has the expected structure
    if (!data || !data.tables) {
      return {
        tables: [],
        last_updated: new Date().toISOString(),
      };
    }
    
    return data;
  } catch (error) {
    throw buildError('fetch homepage data', error);
  }
}
