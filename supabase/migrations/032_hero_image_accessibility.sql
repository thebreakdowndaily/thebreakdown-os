-- Add accessibility columns to stories table
-- Matches production schema modification from Launch Stabilization Phase 2

ALTER TABLE stories ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS hero_image_is_decorative boolean DEFAULT false;
-- Data remediation from Phase 2 Hero Image Accessibility issue
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-01-the-promise';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-02-follow-the-money';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-03-the-sewage-problem';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-04-the-audit-trail';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-05-procurement-and-accountability';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-06-why-stps-dont-work';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-07-water-quality';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-08-city-report-cards';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-09-contractors';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-10-timeline-of-delays';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-11-ecology';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-12-voices-from-the-river';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-13-government-response';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-14-what-worked';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'ng-ch-15-recommendations';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Dry riverbed highlighting groundwater depletion in Northern India' WHERE slug = 'namami-gange-under-fire';
UPDATE stories SET hero_image_is_decorative = false, hero_image_alt = 'Graph showing education spending versus learning outcomes' WHERE slug = 'education-budget';
