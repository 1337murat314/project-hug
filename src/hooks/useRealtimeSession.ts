import { useEffect, useState } from 'react'
import { getAllSessions } from '@/lib/database'
import type { DatabaseUserSession } from '@/lib/database'
import { supabase } from '@/integrations/supabase/client'

export const useRealtimeSession = (sessionId: string) => {
  const [sessionData, setSessionData] = useState<DatabaseUserSession | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Poll for session updates every 2 seconds
    const pollSession = async () => {
      try {
        const sessions = await getAllSessions()
        const session = sessions.find(s => s.session_id === sessionId)
        if (session) {
          setSessionData(session)
        }
      } catch (error) {
        console.error('Error polling session:', error)
      }
    }

    pollSession()
    const interval = setInterval(pollSession, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  return sessionData
}

export const useRealtimeAllSessions = () => {
  const [sessions, setSessions] = useState<DatabaseUserSession[]>([])

  useEffect(() => {
    // Initial load
    const loadSessions = async () => {
      try {
        const data = await getAllSessions(false)
        setSessions(data || [])
      } catch (err) {
        console.error('[ADMIN PANEL] Failed to load sessions:', err)
        setSessions([])
      }
    }

    loadSessions()

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('user_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        () => {
          // Reload sessions when any change occurs
          loadSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return sessions
}
