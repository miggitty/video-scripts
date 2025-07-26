-- Rename short_hash column to hash to use full hash values
-- This migration renames the short_hash column to hash for consistency

-- Rename the column from short_hash to hash
ALTER TABLE leads RENAME COLUMN short_hash TO hash;

-- Update the unique constraint name for clarity
ALTER TABLE leads RENAME CONSTRAINT leads_short_hash_key TO leads_hash_key;

-- Drop the old index and create a new one with the proper name
DROP INDEX IF EXISTS idx_leads_short_hash;
CREATE INDEX IF NOT EXISTS idx_leads_hash ON leads(hash);

-- Add comment to document the change
COMMENT ON COLUMN leads.hash IS 'Full hash identifier for the lead, used in URLs and API references';