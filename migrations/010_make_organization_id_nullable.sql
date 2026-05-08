-- Migration: 010_make_organization_id_nullable
-- Description: Make organization_id nullable in organizations_stores

CREATE TABLE organizations_stores_new (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  organization_id TEXT,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  link TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(user_id) ON DELETE CASCADE
);

INSERT INTO organizations_stores_new (id, user_id, organization_id, b2_key, file_name, file_size, link, uploaded_at)
  SELECT id, user_id, organization_id, b2_key, file_name, file_size, link, uploaded_at
  FROM organizations_stores;

DROP TABLE organizations_stores;

ALTER TABLE organizations_stores_new RENAME TO organizations_stores;

CREATE INDEX IF NOT EXISTS idx_organizations_stores_organization_id ON organizations_stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stores_user_id ON organizations_stores(user_id);
