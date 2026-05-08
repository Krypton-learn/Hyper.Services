-- Migration: 008_remove_account_type_from_organizations
-- Description: Remove account_type from organizations table (now stored in users)

ALTER TABLE organizations DROP COLUMN account_type;