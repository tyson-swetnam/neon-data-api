import fetch from 'node-fetch';
import { ApiCache } from './cache.js';
export class NeonApiClient {
    baseUrl = 'https://data.neonscience.org';
    cache;
    retryAttempts = 3;
    retryDelay = 1000; // 1 second
    constructor() {
        this.cache = new ApiCache();
        // Run cache cleanup every 10 minutes
        setInterval(() => {
            this.cache.cleanup();
        }, 10 * 60 * 1000);
    }
    async makeRequest(endpoint, params, cacheEnabled = true, cacheTtl) {
        const cacheKey = ApiCache.generateKey(endpoint, params);
        // Check cache first
        if (cacheEnabled) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        let url = `${this.baseUrl}${endpoint}`;
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => searchParams.append(key, String(v)));
                    }
                    else {
                        searchParams.append(key, String(value));
                    }
                }
            });
            url += `?${searchParams.toString()}`;
        }
        let lastError = null;
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`NEON API Error: ${errorData.detail} (Status: ${errorData.status})`);
                }
                const data = await response.json();
                // Cache successful responses
                if (cacheEnabled) {
                    this.cache.set(cacheKey, data.data, cacheTtl);
                }
                return data.data;
            }
            catch (error) {
                lastError = error;
                // Don't retry on 4xx errors
                if (error instanceof Error && error.message.includes('Status: 4')) {
                    throw error;
                }
                // Wait before retrying
                if (attempt < this.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                }
            }
        }
        throw lastError || new Error('Failed to make request after retries');
    }
    // Product API methods
    async getProducts(release) {
        const params = release ? { release } : undefined;
        return this.makeRequest('/api/v0/products', params);
    }
    async getProduct(productCode, release) {
        const params = release ? { release } : undefined;
        return this.makeRequest(`/api/v0/products/${productCode}`, params);
    }
    // Site API methods
    async getSites(release) {
        const params = release ? { release } : undefined;
        return this.makeRequest('/api/v0/sites', params);
    }
    async getSite(siteCode) {
        return this.makeRequest(`/api/v0/sites/${siteCode}`);
    }
    // Data Query API methods
    async queryData(params) {
        const endpoint = '/api/v0/data/query';
        // Use POST for multiple sites, GET for single site
        if (params.siteCodes && params.siteCodes.length > 1) {
            // For POST requests, we can't use the standard caching mechanism
            // as it's based on URL parameters
            const cacheKey = ApiCache.generateKey(endpoint, params);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`NEON API Error: ${errorData.detail} (Status: ${errorData.status})`);
            }
            const data = await response.json();
            this.cache.set(cacheKey, data.data);
            return data.data;
        }
        else {
            // Use GET for single site
            const queryParams = { ...params };
            if (params.siteCodes) {
                queryParams.siteCode = params.siteCodes[0];
                delete queryParams.siteCodes;
            }
            return this.makeRequest(endpoint, queryParams, true, 30 * 60 * 1000); // 30 min cache
        }
    }
    // Location API methods
    async getSiteLocations() {
        return this.makeRequest('/api/v0/locations/sites');
    }
    async getLocation(locationName, hierarchy, history, locationType) {
        const params = {};
        if (hierarchy)
            params.hierarchy = true;
        if (history)
            params.history = true;
        if (locationType)
            params.locationType = locationType;
        return this.makeRequest(`/api/v0/locations/${locationName}`, params);
    }
    async getLocationHierarchy(locationName, locationType) {
        const params = { hierarchy: true };
        if (locationType)
            params.locationType = locationType;
        return this.makeRequest(`/api/v0/locations/${locationName}`, params);
    }
    async findTowersAtSite(siteCode) {
        try {
            // For SRER, we know the tower is TOWER104454 - try direct access first
            if (siteCode === 'SRER') {
                try {
                    const tower = await this.getLocation('TOWER104454');
                    if (tower.siteCode === siteCode) {
                        return [tower];
                    }
                }
                catch (error) {
                    // Continue with general approach if direct access fails
                }
            }
            // Get all site locations and filter for towers at this site
            const siteLocations = await this.getSiteLocations();
            const towers = siteLocations.filter(loc => loc.siteCode === siteCode &&
                (loc.locationType === 'TOWER' ||
                    loc.locationName.toUpperCase().includes('TOWER') ||
                    loc.locationDescription.toLowerCase().includes('tower') ||
                    loc.locationDescription.toLowerCase().includes('flux')));
            // If we didn't find any towers in site locations, try a known pattern
            if (towers.length === 0) {
                // Many NEON sites have towers with predictable naming patterns
                const possibleTowerNames = [
                    `TOWER${siteCode}`,
                    `${siteCode}_TOWER`,
                    `${siteCode}.TOWER`,
                    // Try with common tower IDs (these are just examples, actual IDs vary)
                    'TOWER104454', // SRER
                    'TOWER103029', // Common pattern
                    'TOWER102755', // Common pattern
                ];
                for (const towerName of possibleTowerNames) {
                    try {
                        const tower = await this.getLocation(towerName);
                        if (tower.siteCode === siteCode) {
                            towers.push(tower);
                        }
                    }
                    catch (error) {
                        // Continue trying other names
                    }
                }
            }
            return towers;
        }
        catch (error) {
            console.warn(`Error finding towers at ${siteCode}:`, error);
            return [];
        }
    }
    async searchLocationsByType(locationType, siteCode) {
        try {
            // If searching within a specific site
            if (siteCode) {
                return this.findTowersAtSite(siteCode);
            }
            // For broader search, get all site locations and check each
            const siteLocations = await this.getSiteLocations();
            const matchingLocations = [];
            for (const site of siteLocations.slice(0, 10)) { // Limit to first 10 sites to avoid rate limits
                try {
                    const towers = await this.findTowersAtSite(site.siteCode);
                    matchingLocations.push(...towers);
                }
                catch (error) {
                    // Continue with other sites
                }
            }
            return matchingLocations;
        }
        catch (error) {
            console.warn('Error searching locations by type:', error);
            return [];
        }
    }
    // Taxonomy API methods
    async searchTaxonomy(params) {
        return this.makeRequest('/api/v0/taxonomy', params);
    }
    // Sample API methods
    async trackSample(params) {
        const endpoint = '/api/v0/samples/view';
        return this.makeRequest(endpoint, params, false); // Don't cache sample data
    }
    // Release API methods
    async getReleases() {
        return this.makeRequest('/api/v0/releases');
    }
    async getRelease(releaseTag) {
        return this.makeRequest(`/api/v0/releases/${releaseTag}`);
    }
    // Download methods
    async getDownloadUrl(productCode, siteCode, yearMonth, filename) {
        const endpoint = `/api/v0/data/${productCode}/${siteCode}/${yearMonth}/${filename}`;
        // Don't cache download URLs as they expire
        const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`File not found: ${filename}`);
        }
        return {
            url: response.url,
            size: parseInt(response.headers.get('content-length') || '0'),
            checksum: response.headers.get('etag') || ''
        };
    }
}
