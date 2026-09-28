import { UserRepository } from '../repositories/user-repository';
import { AuditRepository } from '../repositories/audit-repository';
import { SessionRepository } from '../repositories/session-repository';
import { UserRecord, AuthSession } from '../types';

export class AuthService {
  private static withoutPassword(
    user: UserRecord,
  ): Omit<UserRecord, 'password'> {
    const { password, ...userWithoutPassword } = user;
    void password;
    return userWithoutPassword;
  }

  static async login(
    username: string,
    password?: string,
  ): Promise<AuthSession> {
    const user = UserRepository.findByUsername(username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!password || !user.password || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    user.lastLoginAt = new Date().toISOString();
    UserRepository.save(user);

    AuditRepository.create({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
    });

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    SessionRepository.save({
      token,
      userId: user.id,
    });

    return {
      user: this.withoutPassword(user),
      token,
    };
  }

  static async logout(userId?: string, tenantId?: string): Promise<void> {
    try {
      if (userId && tenantId) {
        AuditRepository.create({
          tenantId,
          userId,
          action: 'LOGOUT',
          entityType: 'USER',
          entityId: userId,
        });
      }
    } finally {
      SessionRepository.clear();
    }
  }

  static async validateToken(
    token?: string | null,
  ): Promise<Omit<UserRecord, 'password'> | null> {
    const session = SessionRepository.find();
    const sessionToken = token ?? session?.token;

    if (
      !sessionToken ||
      !sessionToken.startsWith('mock-jwt-token-')
    ) {
      return null;
    }

    const parts = sessionToken.split('-');

    if (parts.length < 4) {
      return null;
    }

    const userId = parts.slice(3, parts.length - 1).join('-');

    if (session && session.token !== sessionToken) {
      return null;
    }

    const user = UserRepository.findById(userId);

    if (!user || !user.isActive) {
      SessionRepository.clear();
      return null;
    }

    return this.withoutPassword(user);
  }
}
