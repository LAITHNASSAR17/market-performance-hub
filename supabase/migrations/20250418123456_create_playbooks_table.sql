
-- Create playbooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rating NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  r_multiple NUMERIC,
  win_rate NUMERIC,
  expected_value NUMERIC,
  profit_factor NUMERIC,
  total_trades INTEGER DEFAULT 0,
  average_profit NUMERIC,
  category TEXT,
  is_private BOOLEAN DEFAULT false,
  avg_winner NUMERIC,
  avg_loser NUMERIC,
  missed_trades INTEGER DEFAULT 0,
  net_profit_loss NUMERIC DEFAULT 0,
  rules JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies for playbooks
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- Users can view their own playbooks and public playbooks from others
CREATE POLICY "Users can view own and public playbooks" 
  ON public.playbooks 
  FOR SELECT 
  USING (auth.uid() = user_id OR NOT is_private);

-- Users can only insert their own playbooks
CREATE POLICY "Users can create own playbooks" 
  ON public.playbooks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own playbooks
CREATE POLICY "Users can update own playbooks" 
  ON public.playbooks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only delete their own playbooks
CREATE POLICY "Users can delete own playbooks" 
  ON public.playbooks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Make sure trades table has the playbook field
ALTER TABLE public.trades 
  ADD COLUMN IF NOT EXISTS playbook UUID REFERENCES public.playbooks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS followed_rules TEXT[] DEFAULT '{}';
