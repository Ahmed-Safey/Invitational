-- Rename eagle-watermark media slot to screaming-eagle for clarity.
UPDATE media
SET slug        = 'screaming-eagle',
    label       = 'Screaming Eagle Logo',
    usage_hint  = 'Home hero (row 2 alongside CAC Swimming logo), Footer'
WHERE slug = 'eagle-watermark';

-- Ensure cac-logo usage_hint is up-to-date.
UPDATE media
SET usage_hint = 'Footer'
WHERE slug = 'cac-logo';

-- Add CAC Swimming logo slot (separate from the generic CAC logo in the footer).
INSERT INTO media (slug, label, usage_hint, alt_text)
VALUES ('cac-swimming', 'CAC Swimming Logo', 'Home hero (row 2 alongside Screaming Eagle logo)', 'CAC Swimming')
ON CONFLICT (slug) DO NOTHING;

-- Ensure seis-logo usage_hint is up-to-date.
UPDATE media
SET usage_hint = 'Navbar brand, Home hero (row 1 centered)'
WHERE slug = 'seis-logo';
