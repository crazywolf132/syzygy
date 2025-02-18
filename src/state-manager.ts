/**
 * Interface for managing agent state persistence.
 * Implementations can store state in memory, localStorage, Redis, etc.
 */
export interface StateManager {
  /**
   * Retrieve a value by key.
   * @param key The unique identifier for the stored value
   * @returns The stored value, or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value with the given key.
   * @param key The unique identifier for the value
   * @param value The value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value by key.
   * @param key The unique identifier to remove
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all stored values.
   */
  clear(): Promise<void>;

  /**
   * Get all stored keys.
   * @returns Array of stored keys
   */
  keys(): Promise<string[]>;
}

/**
 * Default in-memory implementation of StateManager.
 * Useful for development and testing.
 */
export class InMemoryStateManager implements StateManager {
  private store = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }
}

/**
 * Browser-specific implementation using localStorage.
 * Only available in browser environments.
 */
export class LocalStorageStateManager implements StateManager {
  private prefix: string;

  constructor(prefix = 'syzygy:') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const value = localStorage.getItem(fullKey);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = this.getFullKey(key);
    localStorage.setItem(fullKey, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    for (const key of keys) {
      await this.delete(key);
    }
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
} 