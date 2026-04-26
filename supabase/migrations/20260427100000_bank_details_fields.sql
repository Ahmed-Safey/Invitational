-- =============================================================================
-- Update bank_details fields to match actual transfer requirements:
--   Bank Name, IBAN Number, Account Number, Swift Code,
--   Beneficiary, Address in Cairo, Phone, Important Note
-- =============================================================================

-- Rename existing columns where meaning maps directly
ALTER TABLE bank_details RENAME COLUMN swift_iban TO swift_code;
ALTER TABLE bank_details RENAME COLUMN account_name TO beneficiary;
ALTER TABLE bank_details RENAME COLUMN reference_format TO important_note;

-- Add new columns
ALTER TABLE bank_details ADD COLUMN IF NOT EXISTS iban_number text DEFAULT 'TBC';
ALTER TABLE bank_details ADD COLUMN IF NOT EXISTS address text DEFAULT 'TBC';
ALTER TABLE bank_details ADD COLUMN IF NOT EXISTS phone text DEFAULT 'TBC';

-- Set default for important_note (was reference_format)
UPDATE bank_details
SET important_note = 'Please indicate the event account #'
WHERE important_note IS NULL
   OR important_note = 'TBC'
   OR important_note = 'School Name + Season (e.g. SEIS Fall 2027)';

-- Track migration
INSERT INTO schema_migrations (filename) VALUES ('20260427100000_bank_details_fields.sql')
ON CONFLICT DO NOTHING;
