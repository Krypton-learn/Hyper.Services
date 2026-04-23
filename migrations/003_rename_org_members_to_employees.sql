-- Migration: 003_rename_org_members_to_employees.sql
-- Renames organization_members table to employees

ALTER TABLE organization_members RENAME TO employees;

-- Drop old indexes and recreate with new names (SQLite doesn't support RENAME INDEX)
DROP INDEX IF EXISTS idx_organization_members_org_id;
DROP INDEX IF EXISTS idx_organization_members_user_id;

CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(org_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);