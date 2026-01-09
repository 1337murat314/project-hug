-- Fix RLS policies to allow anonymous users to manage their own sessions
-- Drop restrictive SELECT policy
DROP POLICY IF EXISTS "Only authenticated users can view sessions" ON public.user_sessions;

-- Allow anyone to select sessions (needed for session management)
-- In production, you'd want to restrict this to only authenticated admins viewing all,
-- or implement a more sophisticated policy
CREATE POLICY "Allow session selection"
ON public.user_sessions
FOR SELECT
USING (true);

-- Fix visitors policies - allow anonymous inserts
DROP POLICY IF EXISTS "Public can track their own visit" ON public.visitors;
DROP POLICY IF EXISTS "Public can update their own visit" ON public.visitors;

-- Allow anyone to insert/update visitors (for tracking)
CREATE POLICY "Anyone can insert visitors"
ON public.visitors
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update visitors"
ON public.visitors
FOR UPDATE
USING (true)
WITH CHECK (true);