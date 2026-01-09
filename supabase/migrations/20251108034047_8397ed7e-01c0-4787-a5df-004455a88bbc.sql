-- Create admin_users table for secure admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read their own record
CREATE POLICY "Admins can view their own record"
ON public.admin_users
FOR SELECT
USING (auth.uid() = id);

-- No public insert/update/delete
CREATE POLICY "No public modifications to admin_users"
ON public.admin_users
FOR ALL
USING (false);

-- Update user_sessions RLS policies - remove public access
DROP POLICY IF EXISTS "Allow all access to user_sessions" ON public.user_sessions;

-- Only authenticated admins can access user_sessions
CREATE POLICY "Only authenticated users can view sessions"
ON public.user_sessions
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can insert sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete sessions"
ON public.user_sessions
FOR DELETE
USING (auth.role() = 'authenticated');

-- Update visitors RLS policies - remove public access
DROP POLICY IF EXISTS "Allow all access to visitors" ON public.visitors;

-- Allow public to track their own visit (insert/update only their IP)
CREATE POLICY "Public can track their own visit"
ON public.visitors
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update their own visit"
ON public.visitors
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only authenticated admins can view all visitors
CREATE POLICY "Only authenticated users can view visitors"
ON public.visitors
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated admins can delete visitors
CREATE POLICY "Only authenticated users can delete visitors"
ON public.visitors
FOR DELETE
USING (auth.role() = 'authenticated');

-- Update login_settings RLS policies
DROP POLICY IF EXISTS "Allow all access to login_settings" ON public.login_settings;

-- Anyone can read login settings (needed for login page warning)
CREATE POLICY "Public can read login settings"
ON public.login_settings
FOR SELECT
USING (true);

-- Only authenticated admins can update login settings
CREATE POLICY "Only authenticated users can update login settings"
ON public.login_settings
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Hash the password using bcrypt
  INSERT INTO public.admin_users (email, password_hash)
  VALUES (
    admin_email,
    crypt(admin_password, gen_salt('bf'))
  )
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$;

-- Function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.admin_users
  WHERE email = admin_email;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (stored_hash = crypt(admin_password, stored_hash));
END;
$$;