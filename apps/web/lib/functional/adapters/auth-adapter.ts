import { AuthService } from '../services/auth-service';
import { SessionRepository } from '../repositories/session-repository';
import { UserRecord } from '../types';

export class AuthAdapter {
  static async login(
    identifier: string,
    password?: string,
  ): Promise<{
    session: { accessToken: string };
    user: Omit<UserRecord, 'password'>;
  }> {
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
    return AuthService.logout(userId, tenantId);
  }

  static async refresh(
    token?: string | null,
  ): Promise<{ user: Omit<UserRecord, 'password'>; accessToken: string } | null> {
    const user = await AuthService.validateToken(token);
    if (!user) return null;
    
    // In Mock Mode, if no token was passed, retrieve it from the session storage
    // to emulate receiving a refreshed token or using an HttpOnly cookie
    const session = SessionRepository.find();
    const actualToken = token ?? session?.token;
    
    if (!actualToken) return null;
    
    return { user, accessToken: actualToken };
  }
}
