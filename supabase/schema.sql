-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Extends Supabase auth.users)
-- Note: id references auth.users to handle authentication internally
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'sales', 'developer')) DEFAULT 'sales',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS TABLE
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('lead', 'active', 'lost')) DEFAULT 'lead',
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Employee who added the lead
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEALS TABLE
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Sales representative
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'closed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Developer assigned
  type TEXT NOT NULL CHECK (type IN ('landing', 'multipage', 'photography')) DEFAULT 'landing',
  status TEXT NOT NULL DEFAULT 'In Progress',
  pay NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYOUTS TABLE
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MAINTENANCE TABLE
CREATE TABLE public.maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount_per_month NUMERIC(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) SETUP
-----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- ALLOW ANON INSERTS FOR CLIENTS (For the Contact Form)
CREATE POLICY "Allow public inserts for leads" ON public.clients
  FOR INSERT WITH CHECK (status = 'lead');

-- USERS POLICIES
CREATE POLICY "Users can view their own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners can view all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- CLIENTS POLICIES
CREATE POLICY "Sales can view their own clients" ON public.clients
  FOR SELECT USING (added_by = auth.uid());

CREATE POLICY "Owners can view all clients" ON public.clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- DEALS POLICIES
CREATE POLICY "Sales can view their own deals" ON public.deals
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Owners can view all deals" ON public.deals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- PROJECTS POLICIES
CREATE POLICY "Developers can view their assigned projects" ON public.projects
  FOR SELECT USING (developer_id = auth.uid());

CREATE POLICY "Owners can view all projects" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- PAYOUTS POLICIES
CREATE POLICY "Employees can view their own payouts" ON public.payouts
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Owners can view all payouts" ON public.payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- MAINTENANCE POLICIES
CREATE POLICY "Owners can view maintenance" ON public.maintenance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-----------------------------------------------------
-- TRIGGERS (Optional: Automatically create a profile when user signs up)
-----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
