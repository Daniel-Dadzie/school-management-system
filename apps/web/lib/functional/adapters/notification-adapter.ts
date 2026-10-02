import { isMockMode } from '../config';
import { NotificationService } from '../services/notification-service';
import type { NotificationRecord } from '../types';

export class NotificationAdapter {
  static async getMyNotifications(): Promise<NotificationRecord[]> {
    if (!isMockMode) throw new Error('Notification API integration is not available yet.');
    return NotificationService.getMyNotifications();
  }

  static async getUnreadCount(): Promise<number> {
    if (!isMockMode) throw new Error('Notification API integration is not available yet.');
    return NotificationService.getUnreadCount();
  }

  static async markAsRead(notificationId: string): Promise<void> {
    if (!isMockMode) throw new Error('Notification API integration is not available yet.');
    return NotificationService.markAsRead(notificationId);
  }

  static async markAllAsRead(): Promise<void> {
    if (!isMockMode) throw new Error('Notification API integration is not available yet.');
    return NotificationService.markAllAsRead();
  }
}

