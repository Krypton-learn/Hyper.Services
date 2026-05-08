-- Migration: 003_add_status_to_tasks
-- Description: Add status column to tasks table with default value 'Common'

ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'Common' CHECK (status IN ('Urgent', 'Common'));

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);