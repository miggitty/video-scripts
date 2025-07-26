-- Remove hash column from leads table and use UUIDs in URLs instead
-- This migration removes the hash column since we'll use the primary key id (UUID) directly

-- Drop the index on hash column
DROP INDEX IF EXISTS idx_leads_hash;

-- Drop the unique constraint on hash
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_hash_key;

-- Remove the hash column entirely
ALTER TABLE leads DROP COLUMN IF EXISTS hash;

-- Add comment to document the change
COMMENT ON TABLE leads IS 'Leads table using UUID primary key for URL identification, hash column removed for simplicity';