-- Migration: 008_add_link_to_stores
-- Description: Add link column to stores and organizations_stores for B2 public URL

ALTER TABLE stores ADD COLUMN link TEXT;
ALTER TABLE organizations_stores ADD COLUMN link TEXT;