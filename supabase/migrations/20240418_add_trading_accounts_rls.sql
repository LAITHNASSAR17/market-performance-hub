
-- Add Row Level Security to trading_accounts table
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own trading accounts
CREATE POLICY "Users can view their own trading accounts"
  ON public.trading_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own trading accounts
CREATE POLICY "Users can insert their own trading accounts"
  ON public.trading_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own trading accounts
CREATE POLICY "Users can update their own trading accounts"
  ON public.trading_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own trading accounts
CREATE POLICY "Users can delete their own trading accounts"
  ON public.trading_accounts
  FOR DELETE
  USING (auth.uid() = user_id);
