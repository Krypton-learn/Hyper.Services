-- Migration: 007_create_organizations_stores
-- Description: Create organizations_stores table for PDF file storage with organization support

CREATE TABLE IF NOT EXISTS organizations_stores (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_organizations_stores_organization_id ON organizations_stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stores_user_id ON organizations_stores(user_id);