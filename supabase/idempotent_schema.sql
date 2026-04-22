-- KAL STUDIO — IDEMPOTENT SCHEMA SETUP
-- This script can be run safely multiple times without destroying data
-- It creates missing tables, enums, RLS policies, and triggers

-----------------------------------------------------
-- 1. EXTENSIONS (Optional)
-----------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------
-- 2. ENUMS (Create only if they don't exist)
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

DO $$ BEGIN
    CREATE TYPE public.material_audience AS ENUM ('all', 'sales', 'developer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-----------------------------------------------------
-- 3. CORE TABLES (Create only if they don't exist)
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
  proof_url TEXT,
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

-- MATERIALS (Resource Hub)
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'Strategy', -- 'Strategy', 'Design Assets', 'Legal/Templates', 'Training'
  audience public.material_audience NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE (Create only if they don't exist)
-----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_added_by ON public.clients(added_by);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_gigs_client_id ON public.gigs(client_id);
CREATE INDEX IF NOT EXISTS idx_gigs_sales_id ON public.gigs(sales_id);
CREATE INDEX IF NOT EXISTS idx_gigs_developer_id ON public.gigs(developer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_payments_gig_id ON public.payments(gig_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_gig_id ON public.payouts(gig_id);
CREATE INDEX IF NOT EXISTS idx_payouts_is_paid ON public.payouts(is_paid);
CREATE INDEX IF NOT EXISTS idx_payment_details_user_id ON public.payment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_audience ON public.materials(audience);

-----------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) - Enable and create policies safely
-----------------------------------------------------

-- Enable RLS on all tables
DO $$ BEGIN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.application_data ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Drop existing policies to avoid conflicts (optional - safer to check first)
-- Uncomment if you want to recreate all policies:
-- DROP POLICY IF EXISTS "Owners Full Access" ON public.users;
-- ... etc.

-- USERS Policies
DO $$ BEGIN
    CREATE POLICY "Owners Full Access" ON public.users FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CLIENTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage clients" ON public.clients FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public lead creation" ON public.clients FOR INSERT WITH CHECK (status = 'lead');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Sales view own clients" ON public.clients FOR SELECT USING (added_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- GIGS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage gigs" ON public.gigs FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Staff view own gigs" ON public.gigs FOR SELECT USING (
        sales_id = auth.uid() OR developer_id = auth.uid()
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYMENTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage payments" ON public.payments FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYOUTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage payouts" ON public.payouts FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Staff view own payouts" ON public.payouts FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYMENT_DETAILS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage application_data" ON public.application_data FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Staff manage own payment_details" ON public.payment_details FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- APPLICATION_DATA Policies
DO $$ BEGIN
    CREATE POLICY "Users insert own application" ON public.application_data FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users view own application" ON public.application_data FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- MATERIALS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage materials" ON public.materials FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Active staff view materials" ON public.materials FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND status = 'active')
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-----------------------------------------------------
-- 6. AUTOMATION & TRIGGERS (Create only if they don't exist)
-----------------------------------------------------

-- UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers if they don't exist
DO $$ BEGIN
    CREATE TRIGGER tr_users_update BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER tr_clients_update BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER tr_gigs_update BEFORE UPDATE ON public.gigs 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER tr_payment_details_update BEFORE UPDATE ON public.payment_details 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth users
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-----------------------------------------------------
-- 7. HELPER VIEWS (Optional - for reporting)
-----------------------------------------------------

-- Revenue overview view
CREATE OR REPLACE VIEW public.revenue_overview AS
SELECT 
    g.id as gig_id,
    c.name as client_name,
    g.service_type,
    g.total_amount,
    COALESCE(SUM(p.amount_received), 0) as total_received,
    g.total_amount - COALESCE(SUM(p.amount_received), 0) as pending_amount,
    g.status,
    g.deadline
FROM public.gigs g
LEFT JOIN public.clients c ON g.client_id = c.id
LEFT JOIN public.payments p ON g.id = p.gig_id
GROUP BY g.id, c.name, g.service_type, g.total_amount, g.status, g.deadline;

-- Staff payout summary view
CREATE OR REPLACE VIEW public.staff_payout_summary AS
SELECT 
    u.id as user_id,
    u.name as staff_name,
    u.role,
    COUNT(p.id) as total_payouts,
    COUNT(CASE WHEN p.is_paid THEN 1 END) as paid_payouts,
    COUNT(CASE WHEN NOT p.is_paid THEN 1 END) as pending_payouts,
    COALESCE(SUM(CASE WHEN p.is_paid THEN p.amount END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN NOT p.is_paid THEN p.amount END), 0) as total_pending
FROM public.users u
LEFT JOIN public.payouts p ON u.id = p.user_id
WHERE u.role IN ('sales', 'developer')
GROUP BY u.id, u.name, u.role;

-----------------------------------------------------
-- 8. SAMPLE DATA (Optional - only for development)
-----------------------------------------------------
-- Uncomment the following section for development environments only

/*
-- Insert sample owner user (adjust ID to match your auth user)
INSERT INTO public.users (id, email, name, role, status)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual auth user ID
    'owner@kalstudio.com',
    'Studio Owner',
    'owner',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample materials
INSERT INTO public.materials (title, description, url, category) VALUES
('Brand Strategy Template', 'Complete framework for developing client brand strategies', 'https://example.com/strategy.pdf', 'Strategy'),
('Design System Components', 'Reusable Figma components for consistent design work', 'https://figma.com/design-system', 'Design Assets'),
('Client Contract Template', 'Standard agency service agreement template', 'https://example.com/contract.docx', 'Legal/Templates'),
('Sales Pitch Training', 'Video series on effective client acquisition techniques', 'https://example.com/sales-training', 'Training')
ON CONFLICT DO NOTHING;
*/

-----------------------------------------------------
-- FINAL MESSAGE
-----------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE '✅ Kal Studio schema has been safely updated';
    RAISE NOTICE '   Tables created/verified: users, clients, gigs, payments, payouts, payment_details, application_data, materials';
    RAISE NOTICE '   RLS policies enabled for all tables';
    RAISE NOTICE '   Triggers and helper functions created';
END $$;