import { describe, expect, it } from 'vitest';
import { createMockAuth } from './auth';
import { createMemoryStorage } from './storage';

describe('createMockAuth', () => {
  it('registers, signs in, persists the session and signs out', async () => {
    const storage = createMemoryStorage();
    const auth = createMockAuth(storage);
    expect(await auth.me()).toBeNull();

    const user = await auth.register('Sara', 'Sara@Example.com', 'correct-horse');
    expect(user.email).toBe('sara@example.com');
    expect((await createMockAuth(storage).me())?.name).toBe('Sara');

    await auth.logout();
    expect(await auth.me()).toBeNull();

    const again = await auth.login('SARA@example.com', 'correct-horse');
    expect(again.id).toBe(user.id);
  });

  it('never stores the password in plain text', async () => {
    const storage = createMemoryStorage();
    await createMockAuth(storage).register('Sara', 'sara@example.com', 'correct-horse');
    expect(storage.getItem('yourtrip.mock-auth.v1')).not.toContain('correct-horse');
  });

  it('rejects wrong passwords, duplicates and weak input', async () => {
    const auth = createMockAuth(createMemoryStorage());
    await auth.register('Sara', 'sara@example.com', 'correct-horse');
    await expect(auth.login('sara@example.com', 'nope')).rejects.toThrow(
      'Invalid email or password',
    );
    await expect(auth.login('who@example.com', 'correct-horse')).rejects.toThrow();
    await expect(auth.register('Sara', 'sara@example.com', 'correct-horse')).rejects.toThrow(
      'already exists',
    );
    await expect(auth.register('S', 'bad-email', 'correct-horse')).rejects.toThrow('valid email');
    await expect(auth.register('S', 's@example.com', 'short')).rejects.toThrow('at least');
  });
});
