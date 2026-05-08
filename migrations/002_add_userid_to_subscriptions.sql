-- Migration: Add userId to subscriptions table
-- Run with: wrangler d1 execute <database> --file=migrations/002_add_userid_to_subscriptions.sql

ALTER TABLE subscriptions ADD COLUMN user_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);