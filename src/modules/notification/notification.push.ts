import { buildPushHTTPRequest } from '@pushforge/builder';
import type { PushSubscription, NotificationPayload, VapidKeys } from './notification.types';

export interface NotificationEnv {
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
}

export class PushService {
  private vapidKeys: VapidKeys;

  constructor(env: NotificationEnv) {
    this.vapidKeys = {
      publicKey: env.VAPID_PUBLIC_KEY || '',
      privateKey: env.VAPID_PRIVATE_KEY || '',
      subject: env.VAPID_SUBJECT || 'mailto:example@example.com',
    };
  }

  async send(subscription: PushSubscription, payload: NotificationPayload): Promise<void> {
    const { headers, body } = await buildPushHTTPRequest({
      privateJWK: JSON.parse(this.vapidKeys.privateKey),
      subscription,
      message: {
        notification: {
          title: payload.title,
          body: payload.body,
        },
      },
      adminContact: this.vapidKeys.subject,
    });

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (response.status === 410 || response.status === 404) {
      throw new Error('Subscription gone');
    }

    if (!response.ok) {
      throw new Error(`Push failed with status: ${response.status}`);
    }
  }
}

export function createPushService(env: NotificationEnv): PushService {
  return new PushService(env);
}