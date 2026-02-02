/**
 * Unit Tests for ApiCache
 */

import { ApiCache } from '../../../api/cache.js';
import { delay, CACHE_TEST_TTL } from '../../setup.js';

describe('ApiCache', () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache();
  });

  afterEach(() => {
    cache.clear();
  });

  describe('constructor', () => {
    it('should create cache with default TTL', () => {
      const defaultCache = new ApiCache();
      expect(defaultCache).toBeInstanceOf(ApiCache);
    });

    it('should create cache with custom TTL', () => {
      const customCache = new ApiCache(5000);
      expect(customCache).toBeInstanceOf(ApiCache);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve string data', () => {
      cache.set('key1', 'value1');
      const result = cache.get<string>('key1');
      expect(result).toBe('value1');
    });

    it('should store and retrieve object data', () => {
      const data = { name: 'test', value: 123 };
      cache.set('key2', data);
      const result = cache.get<typeof data>('key2');
      expect(result).toEqual(data);
    });

    it('should store and retrieve array data', () => {
      const data = [1, 2, 3, 4, 5];
      cache.set('key3', data);
      const result = cache.get<number[]>('key3');
      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should overwrite existing key', () => {
      cache.set('key', 'value1');
      cache.set('key', 'value2');
      const result = cache.get<string>('key');
      expect(result).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should return data before TTL expires', async () => {
      const shortTtlCache = new ApiCache(CACHE_TEST_TTL.SHORT);
      shortTtlCache.set('key', 'value', CACHE_TEST_TTL.MEDIUM);

      await delay(50);

      const result = shortTtlCache.get<string>('key');
      expect(result).toBe('value');
    });

    it('should return null after TTL expires', async () => {
      cache.set('expiring-key', 'expiring-value', CACHE_TEST_TTL.SHORT);

      // Wait for TTL to expire
      await delay(CACHE_TEST_TTL.SHORT + 50);

      const result = cache.get('expiring-key');
      expect(result).toBeNull();
    });

    it('should use custom TTL over default', async () => {
      const defaultTtlCache = new ApiCache(CACHE_TEST_TTL.MEDIUM);
      defaultTtlCache.set('key', 'value', CACHE_TEST_TTL.SHORT);

      // Wait for custom TTL to expire but not default
      await delay(CACHE_TEST_TTL.SHORT + 50);

      const result = defaultTtlCache.get('key');
      expect(result).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('exists', 'value');
      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      cache.set('expiring', 'value', CACHE_TEST_TTL.SHORT);

      await delay(CACHE_TEST_TTL.SHORT + 50);

      expect(cache.has('expiring')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      cache.set('to-delete', 'value');
      const result = cache.delete('to-delete');

      expect(result).toBe(true);
      expect(cache.get('to-delete')).toBeNull();
    });

    it('should return false when deleting non-existent key', () => {
      const result = cache.delete('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should return correct count after additions', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.size()).toBe(2);
    });

    it('should return correct count after deletions', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');

      expect(cache.size()).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cache.set('expires-soon', 'value1', CACHE_TEST_TTL.SHORT);
      cache.set('expires-later', 'value2', CACHE_TEST_TTL.MEDIUM);

      await delay(CACHE_TEST_TTL.SHORT + 50);

      cache.cleanup();

      expect(cache.size()).toBe(1);
      expect(cache.get('expires-soon')).toBeNull();
      expect(cache.get<string>('expires-later')).toBe('value2');
    });

    it('should not remove non-expired entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.cleanup();

      expect(cache.size()).toBe(2);
    });
  });

  describe('generateKey', () => {
    it('should return endpoint when no params', () => {
      const key = ApiCache.generateKey('/api/v0/products');
      expect(key).toBe('/api/v0/products');
    });

    it('should return endpoint when params is empty object', () => {
      const key = ApiCache.generateKey('/api/v0/products', {});
      expect(key).toBe('/api/v0/products');
    });

    it('should append sorted params to endpoint', () => {
      const key = ApiCache.generateKey('/api/v0/products', {
        release: 'RELEASE-2024',
        siteCode: 'HARV',
      });
      expect(key).toBe('/api/v0/products?release=RELEASE-2024&siteCode=HARV');
    });

    it('should sort params alphabetically', () => {
      const key = ApiCache.generateKey('/api/v0/data', {
        z: '3',
        a: '1',
        m: '2',
      });
      expect(key).toBe('/api/v0/data?a=1&m=2&z=3');
    });

    it('should handle arrays in params', () => {
      const key = ApiCache.generateKey('/api/v0/products', {
        siteCodes: ['HARV', 'SRER'],
      });
      expect(key).toBe('/api/v0/products?siteCodes=HARV,SRER');
    });

    it('should handle numeric values', () => {
      const key = ApiCache.generateKey('/api/v0/locations', {
        latitude: 42.5369,
        longitude: -72.1727,
      });
      expect(key).toBe('/api/v0/locations?latitude=42.5369&longitude=-72.1727');
    });

    it('should handle boolean values', () => {
      const key = ApiCache.generateKey('/api/v0/data', {
        includeProvisional: true,
      });
      expect(key).toBe('/api/v0/data?includeProvisional=true');
    });
  });
});
