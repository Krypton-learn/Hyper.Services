-- Migration: 005_make_assigned_to_required.sql
-- Makes assigned_to column NOT NULL in tasks table

-- First, set a default value for any NULL assigned_to (use first user as placeholder)
UPDATE tasks SET assigned_to = (SELECT id FROM users LIMIT 1) WHERE assigned_to IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE tasks ADD COLUMN assigned_to TEXT NOT NULL;