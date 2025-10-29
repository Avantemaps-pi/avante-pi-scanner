-- Create verification status enum
CREATE TYPE verification_status AS ENUM ('approved', 'rejected', 'under_review');

-- Create business_verifications table
CREATE TABLE business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  external_user_id TEXT NOT NULL,
  total_transactions INTEGER NOT NULL,
  unique_wallets INTEGER NOT NULL,
  meets_requirements BOOLEAN NOT NULL,
  failure_reason TEXT,
  verification_status verification_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_wallet_address ON business_verifications(wallet_address);
CREATE INDEX idx_external_user_id ON business_verifications(external_user_id);
CREATE INDEX idx_verification_status ON business_verifications(verification_status);

-- Enable RLS
ALTER TABLE business_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (edge function access)
CREATE POLICY "Allow service role full access"
ON business_verifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);