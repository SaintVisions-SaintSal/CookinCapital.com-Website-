-- Add missing RLS policies for production security
-- Run this after initial setup

-- Enable RLS on tables that don't have it
ALTER TABLE public.affiliate_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_recurring_commissions ENABLE ROW LEVEL SECURITY;

-- Affiliate Leaderboard - Read only for authenticated users
CREATE POLICY "Authenticated users can view leaderboard"
ON public.affiliate_leaderboard
FOR SELECT
TO authenticated
USING (true);

-- Monthly Recurring Commissions - Affiliates can view their own
CREATE POLICY "Affiliates can view own recurring commissions"
ON public.monthly_recurring_commissions
FOR SELECT
TO authenticated
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- Add insert policy for user_deals if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_deals' 
    AND policyname = 'users_insert_own_deals'
  ) THEN
    CREATE POLICY "users_insert_own_deals"
    ON public.user_deals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure service role can bypass RLS for admin operations
-- This is already default behavior but good to document

-- Create index for faster queries on common columns
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON public.deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_by ON public.loans(created_by);
CREATE INDEX IF NOT EXISTS idx_user_deals_user_id ON public.user_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_kyc_status ON public.investors(kyc_status);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);

-- Add audit timestamp triggers for important tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'updated_at'
    AND table_name NOT IN ('nav_history')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
