import { CacheEntry, CacheKey, CacheStore } from './types.js';

export class ApiCache {
  private cache: CacheStore = new Map();
  private defaultTtl: number = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(defaultTtl?: number) {
    if (defaultTtl) {
      this.defaultTtl = defaultTtl;
    }
  }

  set<T>(key: CacheKey, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    };
    this.cache.set(key, entry);
  }

  get<T>(key: CacheKey): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: CacheKey): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: CacheKey): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: CacheKey[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Generate cache key from parameters
  static generateKey(endpoint: string, params?: Record<string, any>): CacheKey {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${endpoint}?${sortedParams}`;
  }
}