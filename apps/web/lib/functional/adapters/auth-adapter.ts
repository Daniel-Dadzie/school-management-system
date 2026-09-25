import { AuthService } from '../services/auth-service';
import { UserRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class AuthAdapter {
  static async login(identifier: string, password?: string): Promise<{ session: { accessToken: string }, user: Omit<UserRecord, 'password'> }> {
    MockDatabase.initializeStore();
    
    if (!identifier) {
      throw new Error('Username or email is required');
    }

    const authSession = await AuthService.login(identifier, password);
    return {
      session: {
        accessToken: authSession.token,
      },
      user: authSession.user,
    };
  }

  static async logout(userId?: string, tenantId?: string): Promise<void> {
    if (userId && tenantId) {
      return AuthService.logout(userId, tenantId);
    }
  }

  static async refresh(token?: string | null): Promise<Omit<UserRecord, 'password'> | null> {
    MockDatabase.initializeStore();
    return AuthService.validateToken(token);
  }
}
