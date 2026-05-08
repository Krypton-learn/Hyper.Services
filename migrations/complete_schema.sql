-- Complete Schema for Hyper Revise
-- Run these in order on a fresh D1 database

-- 001: Initial tables
-- ============================================
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  account_type TEXT DEFAULT 'Personal' CHECK (account_type IN ('Personal', 'Organization')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT,
  assignedTo TEXT,
  startingDate TEXT,
  deadline TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'Common' CHECK (status IN ('Urgent', 'Common')),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_createdBy ON tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE TABLE IF NOT EXISTS organizations (
  user_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Organization',
  is_admin INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  link TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

-- 002: Organization Tasks
-- ============================================
CREATE TABLE IF NOT EXISTS organizations_tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT NOT NULL,
  assignedTo TEXT,
  startingDate TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Common' CHECK (status IN ('Urgent', 'Common')),
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_tasks_createdBy ON organizations_tasks(createdBy);
CREATE INDEX IF NOT EXISTS idx_organizations_tasks_assignedTo ON organizations_tasks(assignedTo);

-- 003: Organization Stores
-- ============================================
CREATE TABLE IF NOT EXISTS organizations_stores (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  link TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_organizations_stores_organization_id ON organizations_stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stores_user_id ON organizations_stores(user_id);

-- 004: Waitlist
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "desc" TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);