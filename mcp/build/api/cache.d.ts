import { CacheKey } from './types.js';
export declare class ApiCache {
    private cache;
    private defaultTtl;
    constructor(defaultTtl?: number);
    set<T>(key: CacheKey, data: T, ttl?: number): void;
    get<T>(key: CacheKey): T | null;
    has(key: CacheKey): boolean;
    delete(key: CacheKey): boolean;
    clear(): void;
    size(): number;
    cleanup(): void;
    static generateKey(endpoint: string, params?: Record<string, any>): CacheKey;
}
