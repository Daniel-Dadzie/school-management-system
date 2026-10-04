import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';
import type { NotificationRecord } from '../types';

export class NotificationService {
  /** Returns all notifications for the currently authenticated user (own data only). */
  static getMyNotifications(): NotificationRecord[] {
    const user = useAuthStore.getState().user;
    if (!user) return [];
    const store = MockDatabase.getStore();
    return (store.notifications ?? [])
      .filter((n) => n.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Returns the count of UNREAD notifications for the current user. */
  static getUnreadCount(): number {
    return this.getMyNotifications().filter((n) => n.status === 'UNREAD').length;
  }

  /** Marks a single notification as READ. No-op if already read. */
  static markAsRead(notificationId: string): void {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const store = MockDatabase.getStore();
    const notif = store.notifications?.find(
      (n) => n.id === notificationId && n.userId === user.id,
    );
    if (notif && notif.status === 'UNREAD') {
      notif.status = 'READ';
      MockDatabase.saveStore(store);
    }
  }

  /** Marks all of the current user's notifications as READ. */
  static markAllAsRead(): void {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const store = MockDatabase.getStore();
    let changed = false;
    (store.notifications ?? []).forEach((n) => {
      if (n.userId === user.id && n.status === 'UNREAD') {
        n.status = 'READ';
        changed = true;
      }
    });
    if (changed) MockDatabase.saveStore(store);
  }
}

