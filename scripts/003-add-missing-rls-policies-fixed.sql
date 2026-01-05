-- =====================================================
-- FIXED: Add missing RLS policies to ACTUAL TABLES ONLY
-- Note: affiliate_leaderboard, monthly_recurring_commissions, 
-- and vp_downline_report are VIEWS, not tables - they inherit
-- security from their underlying tables
-- =====================================================

-- Enable RLS on referral_clicks (actual table that's missing policies)
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

-- Add policy for affiliates to view their own referral clicks
CREATE POLICY "Affiliates can view own clicks"
ON referral_clicks FOR SELECT
USING (affiliate_id IN (
  SELECT id FROM affiliates WHERE user_id = auth.uid()
));

-- Add policy for service role to manage referral clicks
CREATE POLICY "Service role manages clicks"
ON referral_clicks FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Add indexes for better query performance
-- =====================================================

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_submitted_date ON deals(submitted_date DESC);

-- Loans indexes
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_by ON loans(created_by);
CREATE INDEX IF NOT EXISTS idx_loans_origination_date ON loans(origination_date DESC);

-- User deals indexes
CREATE INDEX IF NOT EXISTS idx_user_deals_user_id ON user_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deals_created_at ON user_deals(created_at DESC);

-- Affiliates indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_parent ON affiliates(parent_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- SaintSal analytics indexes
CREATE INDEX IF NOT EXISTS idx_saintsal_analytics_user_id ON saintsal_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_saintsal_analytics_event_type ON saintsal_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_saintsal_analytics_created_at ON saintsal_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saintsal_analytics_session_id ON saintsal_analytics(session_id);

-- Investors indexes
CREATE INDEX IF NOT EXISTS idx_investors_kyc_status ON investors(kyc_status);
CREATE INDEX IF NOT EXISTS idx_investors_accreditation ON investors(accreditation_status);

-- =====================================================
-- Auto-update triggers for updated_at columns
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at columns
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['deals', 'loans', 'investors', 'profiles', 'affiliates', 'user_deals', 'referrals', 'affiliate_settings', 'compliance_items'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', tbl, tbl);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
    END LOOP;
END $$;
