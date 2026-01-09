// ============================================
// SUPABASE CONFIGURATION
// All data now comes from Supabase database
// ============================================

// This file is kept for backwards compatibility
// All actual API calls now use Supabase client directly
// See: src/integrations/supabase/client.ts

export const API_BASE_URL = 'https://aiarkioizxzafaotaueu.supabase.co';
export const API_ENDPOINTS = {};

// Deprecated - use Supabase client instead
export async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  throw new Error('apiCall is deprecated - use Supabase client directly');
}
