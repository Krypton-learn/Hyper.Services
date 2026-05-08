-- Migration: Create subscriptions table for push notifications
-- Run with: wrangler d1 execute <database> --file=migrations/001_create_subscriptions.sql

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_endpoint ON subscriptions(endpoint);