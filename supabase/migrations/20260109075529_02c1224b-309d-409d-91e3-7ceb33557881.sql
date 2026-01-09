-- Enable pgcrypto extension properly
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop and recreate the verify_admin_password function to use extensions schema
CREATE OR REPLACE FUNCTION public.verify_admin_password(admin_email TEXT, admin_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.admin_credentials
  WHERE email = admin_email;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use extensions.crypt for secure password comparison
  RETURN stored_hash = extensions.crypt(admin_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Delete existing credentials and insert with proper hash
DELETE FROM public.admin_credentials;

-- Insert admin with password 'boss2024' using extensions.crypt
INSERT INTO public.admin_credentials (email, password_hash)
VALUES ('admin@hsbc.local', extensions.crypt('boss2024', extensions.gen_salt('bf')));