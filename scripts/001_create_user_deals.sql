-- Create user_deals table for storing saved deal analyses
CREATE TABLE IF NOT EXISTS public.user_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_name TEXT NOT NULL,
  property_address TEXT,
  property_type TEXT,
  purchase_price NUMERIC,
  arv NUMERIC,
  rehab_cost NUMERIC,
  loan_amount NUMERIC,
  loan_term INTEGER,
  interest_rate NUMERIC,
  holding_months INTEGER,
  monthly_taxes NUMERIC,
  monthly_insurance NUMERIC,
  monthly_utilities NUMERIC,
  closing_costs NUMERIC,
  selling_costs_percent NUMERIC,
  total_profit NUMERIC,
  roi NUMERIC,
  cash_on_cash NUMERIC,
  deal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_deals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own deals
CREATE POLICY "users_select_own_deals" ON public.user_deals 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own deals
CREATE POLICY "users_insert_own_deals" ON public.user_deals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own deals
CREATE POLICY "users_update_own_deals" ON public.user_deals 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own deals
CREATE POLICY "users_delete_own_deals" ON public.user_deals 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_deals_user_id_idx ON public.user_deals(user_id);
CREATE INDEX IF NOT EXISTS user_deals_created_at_idx ON public.user_deals(created_at DESC);
