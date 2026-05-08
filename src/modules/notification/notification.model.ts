import type { D1Database } from '@cloudflare/workers-types';
import type { SubscriptionRecord } from './notification.types';

export class NotificationModel {
  constructor(private db: D1Database) {}

  async createSubscription(endpoint: string, p256dh: string, auth: string, userId: string): Promise<SubscriptionRecord | null> {
    try {
      const result = await this.db.prepare(
        'INSERT INTO subscriptions (endpoint, p256dh, auth, user_id) VALUES (?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET user_id = ? RETURNING *'
      ).bind(endpoint, p256dh, auth, userId, userId).first<SubscriptionRecord>();
      return result ?? null;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  async getAllSubscriptions(): Promise<SubscriptionRecord[]> {
    try {
      const result = await this.db.prepare('SELECT * FROM subscriptions').all<SubscriptionRecord>();
      return result.results;
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  async deleteSubscription(endpoint: string): Promise<boolean> {
    try {
      await this.db.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(endpoint).run();
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }

  async getSubscriptionByEndpoint(endpoint: string): Promise<SubscriptionRecord | null> {
    try {
      const result = await this.db.prepare('SELECT * FROM subscriptions WHERE endpoint = ?').bind(endpoint).first<SubscriptionRecord>();
      return result ?? null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  async getSubscriptionsByUserId(userId: string): Promise<SubscriptionRecord[]> {
    try {
      const result = await this.db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').bind(userId).all<SubscriptionRecord>();
      return result.results;
    } catch (error) {
      console.error('Error getting subscriptions by userId:', error);
      return [];
    }
  }
}