-- Migration: 001_initial_schema.sql
-- Creates the initial database schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  organizations TEXT DEFAULT '[]',
  profile TEXT,
  createdAt TEXT NOT NULL
);

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  createdAt TEXT NOT NULL
);

-- Organization Members Junction Table
CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_founder INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  department TEXT,
  role TEXT DEFAULT 'Member',
  joined_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  budget REAL,
  category TEXT,
  org_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  starting_date TEXT,
  ending_date TEXT,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_org_id ON milestones(org_id);
CREATE INDEX IF NOT EXISTS idx_milestones_created_by ON milestones(created_by);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);