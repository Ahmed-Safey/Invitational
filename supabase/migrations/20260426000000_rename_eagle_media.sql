-- Rename eagle-watermark media slot to screaming-eagle for clarity.
UPDATE media
SET slug        = 'screaming-eagle',
    label       = 'Screaming Eagle Logo',
    usage_hint  = 'Home hero (row 2 alongside CAC Swimming logo), Footer'
WHERE slug = 'eagle-watermark';

-- Ensure cac-logo usage_hint is up-to-date too.
UPDATE media
SET usage_hint = 'Home hero (row 2 alongside Screaming Eagle logo), Footer, Navbar fallback'
WHERE slug = 'cac-logo';

-- Ensure seis-logo usage_hint is up-to-date.
UPDATE media
SET usage_hint = 'Navbar brand, Home hero (row 1 centered), Footer'
WHERE slug = 'seis-logo';
