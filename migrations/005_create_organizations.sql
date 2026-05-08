-- Migration: 005_create_organizations
-- Description: Create organizations table with user_id as primary key

CREATE TABLE IF NOT EXISTS organizations (
  user_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Organization',
  account_type TEXT NOT NULL DEFAULT 'Personal' CHECK (account_type IN ('Personal', 'Organization')),
  is_admin INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);