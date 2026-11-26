import type { User } from '../../types';
import { ServiceError } from '../errors';
import { createBrowserStorage } from './storage';
import type { MockStorage } from './storage';
import { DEMO_USER_ID } from './createMockServices';

/**
 * Demo-only authentication for VITE_DATA_SOURCE=mock.
 *
 * Accounts live in this browser's localStorage and never leave the device. There is no server,
 * so this is NOT real security: it only lets the demo show the signed-in experience. Passwords
 * are stored as a salted SHA-256 digest, never in plain text.
 *
 * Every mock account maps to DEMO_USER_ID, because the mock trip store is keyed to that single
 * id. Accounts therefore share the trips saved in the same browser.
 */

const STORE_KEY = 'yourtrip.mock-auth.v1';
const MIN_PASSWORD_LENGTH = 8;

interface StoredUser extends User {
  salt: string;
  hash: string;
}

interface AuthState {
  users: StoredUser[];
  sessionEmail: string | null;
}

export interface MockAuth {
  me(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  logout(): Promise<void>;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function digest(salt: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await crypto.subtle.digest('SHA-256', data));
}

function randomSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function read(storage: MockStorage): AuthState {
  try {
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return { users: [], sessionEmail: null };
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessionEmail: typeof parsed.sessionEmail === 'string' ? parsed.sessionEmail : null,
    };
  } catch {
    return { users: [], sessionEmail: null };
  }
}

function write(storage: MockStorage, state: AuthState): void {
  try {
    storage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    throw new ServiceError('STORAGE', 'Could not save your account in this browser.');
  }
}

export function createMockAuth(storage: MockStorage = createBrowserStorage()): MockAuth {
  return {
    async me() {
      const state = read(storage);
      const user = state.users.find((u) => u.email === state.sessionEmail);
      return user ? publicUser(user) : null;
    },

    async login(email, password) {
      const state = read(storage);
      const user = state.users.find((u) => u.email === normalizeEmail(email));
      if (!user || (await digest(user.salt, password)) !== user.hash) {
        throw new ServiceError('VALIDATION', 'Invalid email or password.');
      }
      write(storage, { ...state, sessionEmail: user.email });
      return publicUser(user);
    },

    async register(name, email, password) {
      const cleanEmail = normalizeEmail(email);
      const cleanName = name.trim();
      if (!cleanName) throw new ServiceError('VALIDATION', 'Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new ServiceError('VALIDATION', 'Please enter a valid email address.');
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ServiceError(
          'VALIDATION',
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
      }
      const state = read(storage);
      if (state.users.some((u) => u.email === cleanEmail)) {
        throw new ServiceError('VALIDATION', 'An account with this email already exists.');
      }
      const salt = randomSalt();
      const user: StoredUser = {
        id: DEMO_USER_ID,
        name: cleanName,
        email: cleanEmail,
        role: 'traveler',
        createdAt: new Date().toISOString(),
        salt,
        hash: await digest(salt, password),
      };
      write(storage, { users: [...state.users, user], sessionEmail: user.email });
      return publicUser(user);
    },

    async logout() {
      const state = read(storage);
      write(storage, { ...state, sessionEmail: null });
    },
  };
}
