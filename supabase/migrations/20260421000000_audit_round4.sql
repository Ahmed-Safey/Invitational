-- Round 4 audit fixes.

-- 1. Generic bank reference_format default so seed value does not bake in a
--    specific season. FeesAdmin's TBC guard won't flag "SEIS Fall 2026" as
--    incomplete, leading to stale payment references for Spring visitors.
ALTER TABLE bank_details
  ALTER COLUMN reference_format SET DEFAULT 'School Name + Season (e.g. SEIS Fall 2027)';

-- Also normalize any existing row that still holds the old season-specific seed.
UPDATE bank_details
SET reference_format = 'School Name + Season (e.g. SEIS Fall 2027)'
WHERE reference_format = 'School Name + SEIS Fall 2026';
