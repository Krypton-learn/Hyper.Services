-- Migration: 007_add_account_type_to_users
-- Description: Add account_type column to users table

ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'Personal' CHECK (account_type IN ('Personal', 'Organization'));