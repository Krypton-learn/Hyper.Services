-- Migration: 006_create_organizations_tasks
-- Description: Create organizations_tasks table for organization-specific tasks

CREATE TABLE IF NOT EXISTS organizations_tasks (
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

CREATE INDEX IF NOT EXISTS idx_organizations_tasks_createdBy ON organizations_tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_organizations_tasks_assignedTo ON organizations_tasks(assignedTo);