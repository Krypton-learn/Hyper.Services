import type { Context } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import { NotificationService } from './notification.service';
import { verifyAuth } from '@/lib/auth';
import type { PushSubscription, NotificationPayload } from './notification.types';
import type { NotificationEnv } from './notification.push';

export class NotificationController {
  async subscribe(c: Context) {
    try {
      const payload = await verifyAuth(c);
      if (!payload) {
        return c.json({ error: 'Authorization required' }, 401);
      }

      const userId = c.get('userId') as string;
      const body = await c.req.json<PushSubscription>();
      
      if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
        return c.json({ error: 'Invalid subscription data' }, 400);
      }

      const db = c.env.DB as D1Database;
      const env = c.env as NotificationEnv;
      const service = new NotificationService(db, env);
      
      const success = await service.subscribe(body, userId);
      
      if (success) {
        return c.json({ success: true, message: 'Subscription saved' }, 201);
      }
      
      return c.json({ success: false, message: 'Subscription already exists' }, 200);
    } catch (error) {
      console.error('Subscribe error:', error);
      return c.json({ error: 'Failed to subscribe' }, 500);
    }
  }

  async send(c: Context) {
    try {
      const body = await c.req.json<NotificationPayload>();
      
      if (!body.title || !body.body) {
        return c.json({ error: 'Invalid notification data' }, 400);
      }

      const db = c.env.DB as D1Database;
      const env = c.env as NotificationEnv;
      const service = new NotificationService(db, env);
      
      const result = await service.sendNotification(body);
      
      return c.json({
        success: true,
        message: `Sent to ${result.success} subscriptions`,
        details: result,
      }, 200);
    } catch (error) {
      console.error('Send error:', error);
      return c.json({ error: 'Failed to send notification' }, 500);
    }
  }
}