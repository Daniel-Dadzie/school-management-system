import { AuthService } from '../services/auth-service';
import { AuthSession, User } from '../types';
import { MockDatabase } from '../storage/database';

export class AuthAdapter {
  static async login(identifier: string, password?: string): Promise<{ session: { accessToken: string }, user: User }> {
    MockDatabase.initialize();
    
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

  static async refresh(token: string): Promise<User | null> {
    MockDatabase.initialize();
    return AuthService.validateToken(token);
  }
}
