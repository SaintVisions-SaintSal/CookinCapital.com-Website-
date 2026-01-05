-- SaintSal Analytics Table - Track all AI interactions and lead intelligence
-- This powers the SaintSal dashboard and GHL integration

CREATE TABLE IF NOT EXISTS public.saintsal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Event tracking
  event_type TEXT NOT NULL, -- conversation, deal_analysis, lead_capture, property_search, etc.
  event_source TEXT, -- research, chat, deal_analyzer, property_search, etc.
  
  -- User info (nullable for anonymous)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Contact info captured
  contact_email TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  
  -- Query/Intent
  query TEXT,
  intent TEXT, -- lending, investing, property_search, deal_analysis, general
  
  -- SaintSal Analysis
  saintsal_signal TEXT, -- BUY, HOLD, PASS, CAUTION
  saintsal_confidence INTEGER,
  saintsal_rating TEXT, -- A, B, C, D
  saintsal_response TEXT,
  
  -- Property/Deal info
  property_address TEXT,
  property_type TEXT,
  purchase_price NUMERIC,
  arv NUMERIC,
  loan_amount NUMERIC,
  
  -- GHL sync
  ghl_synced BOOLEAN DEFAULT FALSE,
  ghl_synced_at TIMESTAMP WITH TIME ZONE,
  ghl_contact_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.saintsal_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own analytics"
ON public.saintsal_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics"
ON public.saintsal_analytics
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics"
ON public.saintsal_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
ON public.saintsal_analytics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_saintsal_analytics_event_type ON public.saintsal_analytics(event_type);
CREATE INDEX idx_saintsal_analytics_user_id ON public.saintsal_analytics(user_id);
CREATE INDEX idx_saintsal_analytics_created_at ON public.saintsal_analytics(created_at DESC);
CREATE INDEX idx_saintsal_analytics_intent ON public.saintsal_analytics(intent);
CREATE INDEX idx_saintsal_analytics_ghl_synced ON public.saintsal_analytics(ghl_synced);
CREATE INDEX idx_saintsal_analytics_contact_email ON public.saintsal_analytics(contact_email);

-- Function to auto-sync to GHL (can be called by trigger or cron)
CREATE OR REPLACE FUNCTION sync_analytics_to_ghl()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as needing sync - actual sync happens via API
  NEW.ghl_synced = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saintsal_analytics_ghl_sync
BEFORE INSERT ON public.saintsal_analytics
FOR EACH ROW
EXECUTE FUNCTION sync_analytics_to_ghl();
