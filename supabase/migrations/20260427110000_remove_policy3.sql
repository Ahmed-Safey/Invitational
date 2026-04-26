-- Remove fees policy_3 ("Schools with outstanding balances...") — not applicable.
DELETE FROM content_blocks
WHERE page_slug = 'fees' AND block_key = 'policy_3';

-- Re-number policy_4 to fill the gap
UPDATE content_blocks
SET sort_order = 3
WHERE page_slug = 'fees' AND block_key = 'policy_4';

INSERT INTO schema_migrations (filename) VALUES ('20260427110000_remove_policy3.sql')
ON CONFLICT DO NOTHING;
