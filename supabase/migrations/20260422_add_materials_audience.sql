-- ADD AUDIENCE COLUMN TO MATERIALS TABLE
-- Allows filtering materials by role: all, sales, developer

-- Create enum type for material audience
DO $$ BEGIN
    CREATE TYPE public.material_audience AS ENUM ('all', 'sales', 'developer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add audience column with default 'all'
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS audience public.material_audience NOT NULL DEFAULT 'all';

-- Update existing rows to have 'all' audience (safe default)
UPDATE public.materials SET audience = 'all' WHERE audience IS NULL;

-- Add index for faster filtering by audience
CREATE INDEX IF NOT EXISTS idx_materials_audience ON public.materials(audience);

-- Verify the update
SELECT 
    'Total materials' as metric,
    COUNT(*) as count
FROM public.materials
UNION ALL
SELECT 
    'By audience: ' || audience,
    COUNT(*)
FROM public.materials
GROUP BY audience
ORDER BY audience;