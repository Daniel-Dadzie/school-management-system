import { LocalStorageAdapter } from '../storage/local-storage-adapter';

interface StoredSession {
  token: string;
  userId: string;
}

const SESSION_KEY = 'carepoint_mock_session';

const isStoredSession = (value: unknown): value is StoredSession => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.token === 'string' &&
    session.token.length > 0 &&
    typeof session.userId === 'string' &&
    session.userId.length > 0
  );
};

export class SessionRepository {
  static save(session: StoredSession): void {
    LocalStorageAdapter.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static find(): StoredSession | null {
    const raw = LocalStorageAdapter.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      const data: unknown = JSON.parse(raw);
      return isStoredSession(data) ? data : null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    LocalStorageAdapter.removeItem(SESSION_KEY);
  }
}