-- ADD MATERIALS TABLE FOR RESOURCE HUB
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'Strategy', -- 'Strategy', 'Design', 'Legal', 'Training'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Owners manage materials" ON public.materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Active staff view materials" ON public.materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND status = 'active')
);
