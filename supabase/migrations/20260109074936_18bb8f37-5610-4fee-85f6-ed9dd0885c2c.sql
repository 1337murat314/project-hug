-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_login_settings(
  p_warning_message TEXT DEFAULT NULL,
  p_show_warning BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.login_settings
  SET 
    warning_message = COALESCE(p_warning_message, warning_message),
    show_warning = COALESCE(p_show_warning, show_warning),
    updated_at = now()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;