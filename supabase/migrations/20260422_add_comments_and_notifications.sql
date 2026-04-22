-- ADD COMMENTS AND NOTIFICATIONS TABLES
-- Requires fix_rls_recursion_v2.sql to have been run (for is_owner() / is_active_staff() helpers)

-- 1. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_gig_id ON public.comments(gig_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Owner full access on comments') THEN
    CREATE POLICY "Owner full access on comments" ON public.comments
      FOR ALL USING (is_owner());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Staff read comments on assigned gigs') THEN
    CREATE POLICY "Staff read comments on assigned gigs" ON public.comments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.gigs
          WHERE gigs.id = comments.gig_id
          AND (gigs.sales_id = auth.uid() OR gigs.developer_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Staff insert comments on assigned gigs') THEN
    CREATE POLICY "Staff insert comments on assigned gigs" ON public.comments
      FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.gigs
          WHERE gigs.id = comments.gig_id
          AND (gigs.sales_id = auth.uid() OR gigs.developer_id = auth.uid())
        )
      );
  END IF;
END $$;

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users read own notifications') THEN
    CREATE POLICY "Users read own notifications" ON public.notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users update own notifications') THEN
    CREATE POLICY "Users update own notifications" ON public.notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Owner insert notifications') THEN
    CREATE POLICY "Owner insert notifications" ON public.notifications
      FOR INSERT WITH CHECK (is_owner());
  END IF;
END $$;
