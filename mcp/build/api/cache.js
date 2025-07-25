export class ApiCache {
    cache = new Map();
    defaultTtl = 60 * 60 * 1000; // 1 hour in milliseconds
    constructor(defaultTtl) {
        if (defaultTtl) {
            this.defaultTtl = defaultTtl;
        }
    }
    set(key, data, ttl) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTtl
        };
        this.cache.set(key, entry);
    }
    get(key) {
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
        return entry.data;
    }
    has(key) {
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
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    // Generate cache key from parameters
    static generateKey(endpoint, params) {
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
