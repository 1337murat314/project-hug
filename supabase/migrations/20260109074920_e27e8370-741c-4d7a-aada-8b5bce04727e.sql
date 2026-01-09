-- Create session status enum
CREATE TYPE public.session_status AS ENUM ('Active', 'Waiting', 'Completed', 'Redirected');

-- Create user_sessions table
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  current_page INTEGER NOT NULL DEFAULT 1,
  is_waiting BOOLEAN DEFAULT false,
  session_data JSONB DEFAULT '{}',
  user_data JSONB DEFAULT '{}',
  authorization_number TEXT,
  has_error BOOLEAN DEFAULT false,
  error_message TEXT,
  error_page INTEGER,
  status public.session_status NOT NULL DEFAULT 'Active',
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  isp_name TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create login_settings table
CREATE TABLE public.login_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  warning_message TEXT DEFAULT '',
  show_warning BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default login settings row
INSERT INTO public.login_settings (id, warning_message, show_warning)
VALUES (1, '', true);

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_settings ENABLE ROW LEVEL SECURITY;

-- Create open policies for user_sessions (app needs public access for session management)
CREATE POLICY "Allow all operations on user_sessions"
ON public.user_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create open policies for visitors (app needs public access for visitor tracking)
CREATE POLICY "Allow all operations on visitors"
ON public.visitors
FOR ALL
USING (true)
WITH CHECK (true);

-- Create open policies for login_settings (app needs public read, admin write)
CREATE POLICY "Allow read access to login_settings"
ON public.login_settings
FOR SELECT
USING (true);

CREATE POLICY "Allow update on login_settings"
ON public.login_settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Enable realtime for user_sessions and login_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_settings;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_login_settings_updated_at
BEFORE UPDATE ON public.login_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update login settings (for admin RPC calls)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;