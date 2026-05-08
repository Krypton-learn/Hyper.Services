-- Migration: 009_remove_organization_id
-- Description: Remove organizationId from organizations_tasks (redundant — user_id IS the organization)

-- Recreate without organizationId
CREATE TABLE organizations_tasks_new (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  desc TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT NOT NULL,
  assignedTo TEXT,
  startingDate TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Common',
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO organizations_tasks_new (id, title, desc, isCompleted, createdBy, assignedTo, startingDate, deadline, status, createdAt)
  SELECT id, title, desc, isCompleted, createdBy, assignedTo, startingDate, deadline, status, createdAt
  FROM organizations_tasks;

DROP TABLE organizations_tasks;

ALTER TABLE organizations_tasks_new RENAME TO organizations_tasks;

CREATE INDEX IF NOT EXISTS idx_organizations_tasks_createdBy ON organizations_tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_organizations_tasks_assignedTo ON organizations_tasks(assignedTo);
