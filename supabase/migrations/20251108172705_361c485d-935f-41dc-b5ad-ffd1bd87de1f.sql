-- Create a function to update login settings that bypasses RLS
CREATE OR REPLACE FUNCTION public.update_login_settings(
  new_warning_message TEXT,
  new_show_warning BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.login_settings
  SET 
    warning_message = new_warning_message,
    show_warning = new_show_warning,
    updated_at = NOW()
  WHERE id = 1;
  
  -- Insert if not exists
  IF NOT FOUND THEN
    INSERT INTO public.login_settings (id, warning_message, show_warning)
    VALUES (1, new_warning_message, new_show_warning);
  END IF;
END;
$$;