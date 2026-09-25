import { UserRepository } from '../repositories/user-repository';
import { AuditRepository } from '../repositories/audit-repository';
import { UserRecord, AuthSession } from '../types';

export class AuthService {
  static async login(username: string, password?: string): Promise<AuthSession> {
    const user = UserRepository.findByUsername(username);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (password && user.password && user.password !== password) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    UserRepository.save(user);

    AuditRepository.create({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: `mock-jwt-token-${user.id}-${Date.now()}`
    };
  }

  static async logout(userId: string, tenantId: string): Promise<void> {
    AuditRepository.create({
      tenantId,
      userId,
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: userId,
    });
  }

  static async validateToken(token?: string | null): Promise<Omit<UserRecord, 'password'> | null> {
    // Basic mock token parsing
    if (!token || !token.startsWith('mock-jwt-token-')) return null;
    
    const parts = token.split('-');
    if (parts.length < 4) return null;
    
    const userId = parts.slice(3, parts.length - 1).join('-');
    
    const user = UserRepository.findById(userId);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
