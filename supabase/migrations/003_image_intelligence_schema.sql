-- The Breakdown OS — Database Migration 003
-- Adds exhaustive editorial, AI provenance, and EXIF metadata to media_items

ALTER TABLE media_items
-- Core Editorial & Copyright
ADD COLUMN agency TEXT,
ADD COLUMN copyright_owner TEXT,
ADD COLUMN photographer TEXT,
ADD COLUMN captured_at TIMESTAMPTZ,
ADD COLUMN source_url TEXT,
ADD COLUMN license_type TEXT DEFAULT 'EDITORIAL',

-- Taxonomy & Accessibility
ADD COLUMN image_category TEXT,
ADD COLUMN editorial_priority TEXT,
ADD COLUMN long_description TEXT,

-- Technical & Automation
ADD COLUMN sha256_hash TEXT,
ADD COLUMN blur_hash TEXT,
ADD COLUMN focus_point_x NUMERIC DEFAULT 50,
ADD COLUMN focus_point_y NUMERIC DEFAULT 50,
ADD COLUMN dominant_color TEXT,
ADD COLUMN verification_status TEXT DEFAULT 'PENDING',

-- AI Provenance
ADD COLUMN is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN ai_model TEXT,
ADD COLUMN ai_prompt TEXT,
ADD COLUMN ai_provider TEXT,
ADD COLUMN generated_at TIMESTAMPTZ,

-- EXIF Data
ADD COLUMN orientation TEXT,
ADD COLUMN camera TEXT,
ADD COLUMN lens TEXT,
ADD COLUMN iso TEXT,
ADD COLUMN gps TEXT;

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_media_items_agency ON media_items(agency);
CREATE INDEX IF NOT EXISTS idx_media_items_verification ON media_items(verification_status);
CREATE INDEX IF NOT EXISTS idx_media_items_license ON media_items(license_type);
CREATE INDEX IF NOT EXISTS idx_media_items_is_ai ON media_items(is_ai_generated);
