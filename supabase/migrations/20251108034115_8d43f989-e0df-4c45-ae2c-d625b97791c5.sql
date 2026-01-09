-- Ensure pgcrypto extension is enabled in the correct schema
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Drop and recreate the functions with correct extension references
DROP FUNCTION IF EXISTS public.create_admin_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_admin_password(TEXT, TEXT);

-- Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Hash the password using bcrypt from extensions schema
  INSERT INTO public.admin_users (email, password_hash)
  VALUES (
    admin_email,
    extensions.crypt(admin_password, extensions.gen_salt('bf'))
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
  
  RETURN (stored_hash = extensions.crypt(admin_password, stored_hash));
END;
$$;

-- Now insert the admin user
SELECT public.create_admin_user('admin@hsbc.local', '@3M%-4$rpA2Y');