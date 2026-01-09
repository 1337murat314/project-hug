import { supabase } from '@/integrations/supabase/client'

// Database row type for user_sessions table
export type DatabaseUserSession = {
  id: string
  session_id: string
  ip_address: string | null
  current_page: number
  is_waiting: boolean | null
  session_data: Record<string, any> | null
  user_data: Record<string, any> | null
  authorization_number: string | null
  has_error: boolean | null
  error_message: string | null
  error_page: number | null
  status: 'Active' | 'Waiting' | 'Completed' | 'Redirected'
  archived: boolean | null
  created_at: string
  updated_at: string
  last_activity: string
}

// Initialize database (not needed for Supabase)
export const initializeDatabase = async () => {
  console.log('Database initialized via Supabase')
}

// Get user's IP address
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Failed to get IP:', error)
    return 'unknown'
  }
}

// Create a new session
export const createSession = async (sessionId: string) => {
  const ipAddress = await getUserIP()
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id: sessionId,
        ip_address: ipAddress,
        current_page: 1,
        status: 'Active',
        archived: false
      })
      .select()
      .single()
    
    if (error) throw error
    return data as DatabaseUserSession
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

// Get session by ID
export const getSession = async (sessionId: string): Promise<DatabaseUserSession | null> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error) throw error
    return data as DatabaseUserSession
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Update session - accepts all database fields
export const updateSession = async (
  sessionId: string,
  updates: Partial<{
    current_page: number
    is_waiting: boolean
    session_data: Record<string, any>
    user_data: Record<string, any>
    has_error: boolean
    error_message: string
    error_page: number
    authorization_number: string
    status: 'Active' | 'Waiting' | 'Completed' | 'Redirected'
    archived: boolean
  }>,
  allowAutoCreate: boolean = true
) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single()
    
    if (error) {
      if (allowAutoCreate && error.code === 'PGRST116') {
        // Session doesn't exist, create it
        const ipAddress = await getUserIP()
        const { data: newData, error: createError } = await supabase
          .from('user_sessions')
          .insert({
            session_id: sessionId,
            ip_address: ipAddress,
            current_page: 1,
            status: 'Active',
            archived: false,
            ...updates
          })
          .select()
          .single()
        
        if (createError) throw createError
        return newData as DatabaseUserSession
      }
      throw error
    }
    
    return data as DatabaseUserSession
  } catch (error) {
    console.error('Error updating session:', error)
    return null
  }
}

// Redirect user session (called by admin)
export const redirectUserSession = async (sessionId: string, targetPage: number) => {
  return updateSession(sessionId, {
    current_page: targetPage,
    status: 'Redirected',
    is_waiting: false
  })
}

// Set user as waiting
export const setUserWaiting = async (sessionId: string, isWaiting: boolean = true) => {
  return updateSession(sessionId, {
    is_waiting: isWaiting,
    status: isWaiting ? 'Waiting' : 'Active'
  })
}

// Get all sessions (excluding archived ones for live/old tabs)
export const getAllSessions = async (includeArchived: boolean = false): Promise<DatabaseUserSession[]> => {
  try {
    let query = supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!includeArchived) {
      query = query.eq('archived', false)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return (data || []) as DatabaseUserSession[]
  } catch (error) {
    console.error('Error getting all sessions:', error)
    return []
  }
}

// Get all sessions including archived (for Session Data tab)
export const getAllSessionsIncludingArchived = async () => {
  return getAllSessions(true)
}

// Delete a specific session
export const deleteSession = async (sessionId: string) => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_id', sessionId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting session:', error)
    throw error
  }
}

// Archive a specific session (move to history)
export const archiveSession = async (sessionId: string) => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ archived: true })
      .eq('session_id', sessionId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error archiving session:', error)
    throw error
  }
}

// Archive all sessions instead of deleting (for preserving data)
export const archiveAllSessions = async () => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ archived: true })
      .eq('archived', false)
    
    if (error) throw error
  } catch (error) {
    console.error('Error archiving sessions:', error)
    throw error
  }
}

// Delete old archived sessions (older than 30 days for data retention)
export const cleanupOldSessions = async () => {
  // This would be handled by a backend cron job or database policy
  console.log('Cleanup should be handled by a backend cron job')
}
