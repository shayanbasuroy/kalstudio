-- KAL STUDIO — PRODUCTION SUPABASE SCHEMA (V2)
-- This script sets up the full database, enums, RLS policies, and triggers.

-----------------------------------------------------
-- 0. CLEANUP (Optional - Use with caution)
-----------------------------------------------------
-- DROP TABLE IF EXISTS public.application_data CASCADE;
-- DROP TABLE IF EXISTS public.payment_details CASCADE;
-- DROP TABLE IF EXISTS public.payouts CASCADE;
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.gigs CASCADE;
-- DROP TABLE IF EXISTS public.clients CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TYPE IF EXISTS public.user_role CASCADE;
-- DROP TYPE IF EXISTS public.user_status CASCADE;
-- DROP TYPE IF EXISTS public.gig_status CASCADE;
-- DROP TYPE IF EXISTS public.payment_status CASCADE;

-----------------------------------------------------
-- 1. SETUP EXTENSIONS
-----------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------
-- 2. ENUMS
-----------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('owner', 'sales', 'developer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.gig_status AS ENUM ('lead', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('partial', 'full');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-----------------------------------------------------
-- 3. CORE TABLES
-----------------------------------------------------

-- USERS (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'sales',
  status public.user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('lead', 'active', 'lost')) DEFAULT 'lead',
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIGS (The central Agency OS logic)
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  sales_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  developer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('landing', 'multipage', 'custom')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status public.gig_status NOT NULL DEFAULT 'lead',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS (Incoming Client Money)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE,
  amount_received NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status public.payment_status NOT NULL DEFAULT 'full'
);

-- PAYOUTS (Outgoing Staff Payouts)
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT_DETAILS (Staff Financial Info)
CREATE TABLE IF NOT EXISTS public.payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  upi_id TEXT,
  bank_account TEXT,
  ifsc TEXT,
  name_on_account TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION_DATA (Pending Onboarding)
CREATE TABLE IF NOT EXISTS public.application_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  role_applying_for public.user_role,
  experience_level TEXT,
  portfolio_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_data ENABLE ROW LEVEL SECURITY;

-- GLOBAL: Owners can do everything
CREATE POLICY "Owners Full Access" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners manage clients" ON public.clients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners manage gigs" ON public.gigs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners manage payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners manage payouts" ON public.payouts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners manage application_data" ON public.application_data FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

-- PUBLIC: Contact Form Insert
CREATE POLICY "Public lead creation" ON public.clients FOR INSERT WITH CHECK (status = 'lead');

-- USERS: Self Profile view
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- CLIENTS: Sales view own
CREATE POLICY "Sales view own clients" ON public.clients FOR SELECT USING (added_by = auth.uid());

-- GIGS: Conditional Visibility
CREATE POLICY "Staff view own gigs" ON public.gigs FOR SELECT USING (
  sales_id = auth.uid() OR developer_id = auth.uid()
);

-- PAYOUTS: Staff view own
CREATE POLICY "Staff view own payouts" ON public.payouts FOR SELECT USING (user_id = auth.uid());

-- PAYMENT_DETAILS: Staff manage own
CREATE POLICY "Staff manage own payment_details" ON public.payment_details FOR ALL USING (user_id = auth.uid());

-----------------------------------------------------
-- 5. AUTOMATION & TRIGGERS
-----------------------------------------------------

-- UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER tr_users_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER tr_clients_update BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER tr_gigs_update BEFORE UPDATE ON public.gigs FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER tr_payment_details_update BEFORE UPDATE ON public.payment_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- AUTH SIGNUP TRIGGER
-- Automatically creates a public.users row when a new auth.users account is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, status)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', -- Take from metadata if provided
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'sales'),
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
