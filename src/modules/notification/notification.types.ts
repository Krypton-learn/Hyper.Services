export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SubscriptionRecord {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
  created_at: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}