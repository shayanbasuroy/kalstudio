-- ADD MISSING COLUMNS TO EXISTING TABLES
-- This script safely adds any columns that might be referenced in the code but missing from schema

-- 1. Add proof_url to payouts table (for payment proof images)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payouts' AND column_name = 'proof_url'
    ) THEN
        ALTER TABLE public.payouts ADD COLUMN proof_url TEXT;
        RAISE NOTICE 'Added proof_url column to payouts table';
    ELSE
        RAISE NOTICE 'proof_url column already exists in payouts table';
    END IF;
END $$;

-- 2. Ensure materials table has correct category values
-- The code expects categories: 'Strategy', 'Design Assets', 'Legal/Templates', 'Training'
-- But schema default is 'Strategy'. This is fine, just documenting.

-- 3. Add any other missing columns that might be needed
-- Check for missing columns in other tables

-- Example: Add email to users table if not already there (should be there)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT NOT NULL UNIQUE;
        RAISE NOTICE 'Added email column to users table';
    END IF;
END $$;

-- 4. Add missing status column check for clients if needed
DO $$ 
BEGIN
    -- Check if the check constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'clients_status_check'
    ) THEN
        -- Add check constraint if missing
        ALTER TABLE public.clients ADD CONSTRAINT clients_status_check 
        CHECK (status IN ('lead', 'active', 'lost'));
        RAISE NOTICE 'Added status check constraint to clients table';
    END IF;
END $$;

-- 5. Add service_type check constraint to gigs if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'gigs_service_type_check'
    ) THEN
        ALTER TABLE public.gigs ADD CONSTRAINT gigs_service_type_check 
        CHECK (service_type IN ('landing', 'multipage', 'custom'));
        RAISE NOTICE 'Added service_type check constraint to gigs table';
    END IF;
END $$;

-- 6. Create missing indexes if needed
CREATE INDEX IF NOT EXISTS idx_payouts_proof_url ON public.payouts(proof_url) WHERE proof_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 7. Update the handle_new_user function to include phone if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get user's assigned projects (for employee dashboard)
CREATE OR REPLACE FUNCTION public.get_user_payouts_with_details(user_uuid UUID)
RETURNS TABLE (
    payout_id UUID,
    amount NUMERIC(10,2),
    is_paid BOOLEAN,
    proof_url TEXT,
    gig_id UUID,
    service_type TEXT,
    gig_status TEXT,
    deadline DATE,
    client_name TEXT,
    sales_name TEXT,
    sales_email TEXT,
    sales_phone TEXT,
    developer_name TEXT,
    developer_email TEXT,
    developer_phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as payout_id,
        p.amount,
        p.is_paid,
        p.proof_url,
        g.id as gig_id,
        g.service_type,
        g.status::TEXT as gig_status,
        g.deadline,
        c.name as client_name,
        s.name as sales_name,
        s.email as sales_email,
        s.phone as sales_phone,
        d.name as developer_name,
        d.email as developer_email,
        d.phone as developer_phone
    FROM public.payouts p
    JOIN public.gigs g ON p.gig_id = g.id
    JOIN public.clients c ON g.client_id = c.id
    LEFT JOIN public.users s ON g.sales_id = s.id
    LEFT JOIN public.users d ON g.developer_id = d.id
    WHERE p.user_id = user_uuid
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Summary of changes
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully';
    RAISE NOTICE '   - Added any missing columns';
    RAISE NOTICE '   - Created/updated indexes';
    RAISE NOTICE '   - Updated helper functions';
    RAISE NOTICE '   - All changes are idempotent (safe to run multiple times)';
END $$;