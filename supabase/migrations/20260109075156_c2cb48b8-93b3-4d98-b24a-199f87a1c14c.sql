-- Create admin_credentials table for secure admin password storage
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- No public access to admin_credentials (only via security definer function)
-- No RLS policies = no direct access

-- Create secure password verification function
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
  
  -- Use pgcrypto for secure password comparison
  RETURN stored_hash = crypt(admin_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert default admin credentials (password: admin123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO public.admin_credentials (email, password_hash)
VALUES ('admin@hsbc.local', crypt('admin123', gen_salt('bf')));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_credentials_updated_at
BEFORE UPDATE ON public.admin_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();