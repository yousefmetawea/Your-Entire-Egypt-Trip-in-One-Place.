export interface MockStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorage(): MockStorage {
  const values = new Map<string, string>();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

export function createBrowserStorage(): MockStorage {
  if (typeof window === 'undefined') {
    return createMemoryStorage();
  }

  try {
    const storage = window.localStorage;
    const probeKey = '__discover_cairo_storage_probe__';

    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);

    return {
      getItem(key) {
        return storage.getItem(key);
      },
      setItem(key, value) {
        storage.setItem(key, value);
      },
      removeItem(key) {
        storage.removeItem(key);
      },
    };
  } catch {
    return createMemoryStorage();
  }
}
