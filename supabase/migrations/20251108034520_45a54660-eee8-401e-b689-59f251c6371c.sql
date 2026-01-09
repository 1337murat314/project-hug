-- Fix RLS policies for user_sessions to allow anonymous users to manage sessions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only authenticated users can insert sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Only authenticated users can update sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Only authenticated users can delete sessions" ON public.user_sessions;

-- Allow anyone to insert sessions (for initial session creation)
CREATE POLICY "Anyone can create sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update sessions (user form flow needs this)
CREATE POLICY "Anyone can update sessions"
ON public.user_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only authenticated (admin) users can delete sessions
CREATE POLICY "Only admins can delete sessions"
ON public.user_sessions
FOR DELETE
USING (auth.role() = 'authenticated');

-- Ensure login_settings can be updated by authenticated users
DROP POLICY IF EXISTS "Only authenticated users can update login settings" ON public.login_settings;

CREATE POLICY "Authenticated users can update login settings"
ON public.login_settings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');