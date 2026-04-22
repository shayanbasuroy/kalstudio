-- FIX: Profile sync trigger for Kal Studio
-- Run this in Supabase SQL Editor to fix the "Profile sync failed" error

-- Drop and recreate the handle_new_user function with proper metadata handling
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

-- Test: Check if trigger exists and recreate if needed
DO $$ 
BEGIN
    -- Drop trigger if exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    
    RAISE NOTICE 'Trigger updated successfully';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error updating trigger: %', SQLERRM;
END $$;

-- Also create a helper function to repair existing users
CREATE OR REPLACE FUNCTION public.repair_missing_profiles()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        INSERT INTO public.users (id, email, name, phone, role, status)
        VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(
                auth_user.raw_user_meta_data->>'name',
                auth_user.raw_user_meta_data->>'full_name',
                'User'
            ),
            COALESCE(auth_user.raw_user_meta_data->>'phone', ''),
            COALESCE(
                NULLIF(auth_user.raw_user_meta_data->>'role', ''),
                'sales'
            )::public.user_role,
            'pending'::public.user_status
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            status = EXCLUDED.status;
    END LOOP;
    
    RAISE NOTICE 'Missing profiles repaired';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run repair for existing users
SELECT public.repair_missing_profiles();

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