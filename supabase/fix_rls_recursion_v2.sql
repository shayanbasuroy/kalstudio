-- FIX: Infinite recursion in RLS policies for Kal Studio (Version 2)
-- Run this in Supabase SQL Editor to fix the "infinite recursion detected in policy" error
-- This version uses DO blocks with exception handling to avoid "policy already exists" errors

BEGIN;

-- Create helper functions that bypass RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND status = 'active'
  );
$$;

-- Drop existing policies that cause recursion (if they exist)
DROP POLICY IF EXISTS "Owners Full Access" ON public.users;
DROP POLICY IF EXISTS "Owners manage clients" ON public.clients;
DROP POLICY IF EXISTS "Owners manage gigs" ON public.gigs;
DROP POLICY IF EXISTS "Owners manage payments" ON public.payments;
DROP POLICY IF EXISTS "Owners manage payouts" ON public.payouts;
DROP POLICY IF EXISTS "Owners manage application_data" ON public.application_data;
DROP POLICY IF EXISTS "Owners manage materials" ON public.materials;

-- Also drop any policies we're going to recreate (to avoid conflicts)
DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Owners manage users" ON public.users;
DROP POLICY IF EXISTS "Public lead creation" ON public.clients;
DROP POLICY IF EXISTS "Sales view own clients" ON public.clients;
DROP POLICY IF EXISTS "Staff view own gigs" ON public.gigs;
DROP POLICY IF EXISTS "Staff view own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Staff manage own payment_details" ON public.payment_details;
DROP POLICY IF EXISTS "Users insert own application" ON public.application_data;
DROP POLICY IF EXISTS "Users view own application" ON public.application_data;
DROP POLICY IF EXISTS "Owners manage applications" ON public.application_data;
DROP POLICY IF EXISTS "Active staff view materials" ON public.materials;

-- Recreate policies using the helper functions (no recursion)
-- USERS Policies
DO $$ BEGIN
    CREATE POLICY "Users insert own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users view own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Owners manage users" ON public.users 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CLIENTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage clients" ON public.clients 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public lead creation" ON public.clients 
    FOR INSERT WITH CHECK (status = 'lead');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Sales view own clients" ON public.clients 
    FOR SELECT USING (added_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- GIGS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage gigs" ON public.gigs 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Staff view own gigs" ON public.gigs 
    FOR SELECT USING (sales_id = auth.uid() OR developer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYMENTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage payments" ON public.payments 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYOUTS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage payouts" ON public.payouts 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Staff view own payouts" ON public.payouts 
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PAYMENT_DETAILS Policies
DO $$ BEGIN
    CREATE POLICY "Staff manage own payment_details" ON public.payment_details 
    FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- APPLICATION_DATA Policies
DO $$ BEGIN
    CREATE POLICY "Users insert own application" ON public.application_data 
    FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users view own application" ON public.application_data 
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Owners manage applications" ON public.application_data 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- MATERIALS Policies
DO $$ BEGIN
    CREATE POLICY "Owners manage materials" ON public.materials 
    FOR ALL USING (public.is_owner());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Active staff view materials" ON public.materials 
    FOR SELECT USING (public.is_active_staff());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Update the handle_new_user trigger to ensure it works with new policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone, role, status)
    VALUES (
        NEW.id, 
        NEW.email, 
        -- Try multiple possible metadata field names for name
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        -- Try to get role from metadata, default to 'sales'
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'role', ''),
            'sales'
        )::public.user_role,
        -- Default status for new users
        'pending'::public.user_status
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        status = EXCLUDED.status;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Repair any existing users missing profiles
INSERT INTO public.users (id, email, name, phone, role, status)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        'User'
    ),
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'role', ''),
        'sales'
    )::public.user_role,
    'pending'::public.user_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

COMMIT;

-- Verify the fix
SELECT 
    'Total auth users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total public.users profiles' as metric,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Missing profiles' as metric,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;