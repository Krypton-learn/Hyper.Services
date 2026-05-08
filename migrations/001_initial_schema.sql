-- Migration: 001_initial_schema
-- Description: Create initial schema for users, tasks, and waitlist tables

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT,
  assignedTo TEXT,
  startingDate TEXT NOT NULL,
  deadline TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_createdBy ON tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_tasks_assignedTo ON tasks(assignedTo);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "desc" TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);