-- Migration: 002_tasks_schema.sql
-- Creates the tasks table

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL,
  token TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starting_date TEXT,
  due_date TEXT,
  priority TEXT,
  team TEXT DEFAULT '[]',
  temp_team TEXT DEFAULT '[]',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_token ON tasks(token);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);