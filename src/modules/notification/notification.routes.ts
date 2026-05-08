import { Hono } from 'hono';
import { NotificationController } from './notification.controller';

const notification = new Hono();

const controller = new NotificationController();

notification.post('/subscribe', controller.subscribe.bind(controller));
notification.post('/send', controller.send.bind(controller));

export default notification;