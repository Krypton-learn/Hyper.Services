import type { D1Database } from '@cloudflare/workers-types';
import { NotificationModel } from './notification.model';
import { PushService, type NotificationEnv } from './notification.push';
import type { PushSubscription, NotificationPayload } from './notification.types';

export class NotificationService {
  private model: NotificationModel;
  private pushService: PushService;

  constructor(db: D1Database, env: NotificationEnv) {
    this.model = new NotificationModel(db);
    this.pushService = new PushService(env);
  }

  async subscribe(subscription: PushSubscription, userId: string): Promise<boolean> {
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    const result = await this.model.createSubscription(endpoint, p256dh, auth, userId);
    return result !== null;
  }

  async sendNotificationToUser(userId: string, payload: NotificationPayload): Promise<{ success: number; failed: number }> {
    const subscriptions = await this.model.getSubscriptionsByUserId(userId);
    return this.sendToSubscriptions(subscriptions, payload);
  }

  async sendNotification(payload: NotificationPayload): Promise<{ success: number; failed: number }> {
    const subscriptions = await this.model.getAllSubscriptions();
    return this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(subscriptions: { endpoint: string; p256dh: string; auth: string }[], payload: NotificationPayload): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await this.pushService.send(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        success++;
      } catch (error) {
        console.error(`Failed to send to ${sub.endpoint}:`, error);
        
        const isGone = error instanceof Error && 
          (error.message.includes('410') || error.message.includes('404') || error.message.includes('Subscription gone'));
        
        if (isGone) {
          await this.model.deleteSubscription(sub.endpoint);
        }
        
        failed++;
      }
    }

    return { success, failed };
  }
}