-- Migration: 004_add_tasks_completion.sql
-- Adds isCompleted and assignedTo fields to tasks table

-- Add assigned_to column
ALTER TABLE tasks ADD COLUMN assigned_to TEXT;

-- Add is_completed column with default 0
ALTER TABLE tasks ADD COLUMN is_completed INTEGER DEFAULT 0;

-- Add foreign key constraint for assigned_to (optional, only if users table exists)
-- FOREIGN KEY (assigned_to) REFERENCES users(id)