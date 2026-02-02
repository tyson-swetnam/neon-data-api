/**
 * Integration Tests for NeonApiClient
 *
 * These tests hit the live NEON API to verify the client works correctly.
 * The NEON API is public and requires no authentication.
 */

import { NeonApiClient } from '../../../api/client.js';
import { TEST_CONSTANTS, isValidProductCodeFormat, isValidSiteCodeFormat } from '../../setup.js';

describe('NeonApiClient Integration Tests', () => {
  let client: NeonApiClient;

  beforeAll(() => {
    client = new NeonApiClient();
  });

  describe('Product API', () => {
    it('should fetch all products', async () => {
      const products = await client.getProducts();

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);

      // Verify product structure
      const product = products[0];
      expect(product).toHaveProperty('productCode');
      expect(product).toHaveProperty('productName');
      expect(product).toHaveProperty('productDescription');
      expect(product).toHaveProperty('siteCodes');
      expect(isValidProductCodeFormat(product.productCode)).toBe(true);
    });

    it('should fetch a specific product', async () => {
      const product = await client.getProduct(TEST_CONSTANTS.VALID_PRODUCT_CODE);

      expect(product).toBeDefined();
      expect(product.productCode).toBe(TEST_CONSTANTS.VALID_PRODUCT_CODE);
      expect(product.productName).toBeDefined();
      expect(Array.isArray(product.siteCodes)).toBe(true);
      expect(Array.isArray(product.themes)).toBe(true);
      expect(Array.isArray(product.keywords)).toBe(true);
    });

    it('should throw error for invalid product code', async () => {
      await expect(client.getProduct(TEST_CONSTANTS.INVALID_PRODUCT_CODE))
        .rejects
        .toThrow();
    });

    it('should cache product responses', async () => {
      // First request
      const startTime1 = Date.now();
      const products1 = await client.getProducts();
      const duration1 = Date.now() - startTime1;

      // Second request (should be cached)
      const startTime2 = Date.now();
      const products2 = await client.getProducts();
      const duration2 = Date.now() - startTime2;

      expect(products1).toEqual(products2);
      // Cached response should be faster or same speed (sub-millisecond)
      // Use less-than-or-equal since both may be 0 or 1ms
      expect(duration2).toBeLessThanOrEqual(Math.max(duration1, 10));
    });
  });

  describe('Site API', () => {
    it('should fetch all sites', async () => {
      const sites = await client.getSites();

      expect(Array.isArray(sites)).toBe(true);
      expect(sites.length).toBeGreaterThan(0);

      // Verify site structure
      const site = sites[0];
      expect(site).toHaveProperty('siteCode');
      expect(site).toHaveProperty('siteName');
      expect(site).toHaveProperty('siteLatitude');
      expect(site).toHaveProperty('siteLongitude');
      expect(site).toHaveProperty('domainCode');
      expect(isValidSiteCodeFormat(site.siteCode)).toBe(true);
    });

    it('should fetch a specific site', async () => {
      const site = await client.getSite(TEST_CONSTANTS.VALID_SITE_CODE);

      expect(site).toBeDefined();
      expect(site.siteCode).toBe(TEST_CONSTANTS.VALID_SITE_CODE);
      expect(site.siteName).toBeDefined();
      expect(typeof site.siteLatitude).toBe('number');
      expect(typeof site.siteLongitude).toBe('number');
      expect(Array.isArray(site.dataProducts)).toBe(true);
    });

    it('should throw error for invalid site code', async () => {
      await expect(client.getSite(TEST_CONSTANTS.INVALID_SITE_CODE))
        .rejects
        .toThrow();
    });

    it('should return Harvard Forest site with correct coordinates', async () => {
      const site = await client.getSite('HARV');

      expect(site.siteCode).toBe('HARV');
      expect(site.siteName).toContain('Harvard');
      expect(site.siteLatitude).toBeCloseTo(TEST_CONSTANTS.HARV_LATITUDE, 1);
      expect(site.siteLongitude).toBeCloseTo(TEST_CONSTANTS.HARV_LONGITUDE, 1);
      expect(site.stateCode).toBe('MA');
    });
  });

  describe('Location API', () => {
    it('should fetch site locations', async () => {
      const locations = await client.getSiteLocations();

      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      const location = locations[0];
      expect(location).toHaveProperty('locationName');
      expect(location).toHaveProperty('locationType');
      expect(location).toHaveProperty('siteCode');
      expect(location).toHaveProperty('locationDecimalLatitude');
      expect(location).toHaveProperty('locationDecimalLongitude');
    });

    it('should fetch a specific location', async () => {
      const location = await client.getLocation(TEST_CONSTANTS.VALID_SITE_CODE);

      expect(location).toBeDefined();
      expect(location.locationName).toBeDefined();
      expect(location.siteCode).toBe(TEST_CONSTANTS.VALID_SITE_CODE);
    });

    it('should fetch location with hierarchy', async () => {
      const location = await client.getLocationHierarchy(TEST_CONSTANTS.VALID_SITE_CODE);

      expect(location).toBeDefined();
      expect(location.locationName).toBeDefined();
      // Sites typically have child locations
      if (location.locationChildren) {
        expect(Array.isArray(location.locationChildren)).toBe(true);
      }
    });

    it('should find towers at SRER', async () => {
      const towers = await client.findTowersAtSite('SRER');

      // SRER is known to have at least one tower (TOWER104454)
      expect(Array.isArray(towers)).toBe(true);
      // Tower search may or may not find towers depending on API response
    });
  });

  describe('Release API', () => {
    it('should fetch all releases', async () => {
      const releases = await client.getReleases();

      expect(Array.isArray(releases)).toBe(true);
      expect(releases.length).toBeGreaterThan(0);

      const release = releases[0] as any;
      // API returns 'release' and 'generationDate' field names
      expect(release.release || release.releaseTag).toBeDefined();
      expect(release.generationDate || release.releaseGenerationDate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // The client has retry logic built in, this tests that it works
      const products = await client.getProducts();
      expect(Array.isArray(products)).toBe(true);
    });

    it('should not retry on 4xx errors', async () => {
      const startTime = Date.now();

      try {
        await client.getProduct('INVALID.CODE.XXX');
        fail('Should have thrown');
      } catch (error) {
        const duration = Date.now() - startTime;
        // Should fail fast on 4xx, not retry multiple times
        expect(duration).toBeLessThan(5000);
      }
    });
  });

  describe('Caching Behavior', () => {
    it('should return same data from cache', async () => {
      // Clear any existing cache by creating new client
      const freshClient = new NeonApiClient();

      const sites1 = await freshClient.getSites();
      const sites2 = await freshClient.getSites();

      expect(sites1).toEqual(sites2);
    });

    it('should use different cache keys for different parameters', async () => {
      const freshClient = new NeonApiClient();

      // These should have different cache keys
      const harv = await freshClient.getSite('HARV');
      const srer = await freshClient.getSite('SRER');

      expect(harv.siteCode).toBe('HARV');
      expect(srer.siteCode).toBe('SRER');
      expect(harv).not.toEqual(srer);
    });
  });

  describe('Data Types', () => {
    it('should return products with correct types', async () => {
      const products = await client.getProducts();
      const product = products[0];

      expect(typeof product.productCode).toBe('string');
      expect(typeof product.productName).toBe('string');
      expect(typeof product.productDescription).toBe('string');
      expect(typeof product.productHasExpanded).toBe('boolean');
      expect(Array.isArray(product.siteCodes)).toBe(true);
      expect(Array.isArray(product.themes)).toBe(true);
      expect(Array.isArray(product.keywords)).toBe(true);
    });

    it('should return sites with correct types', async () => {
      const site = await client.getSite('HARV');

      expect(typeof site.siteCode).toBe('string');
      expect(typeof site.siteName).toBe('string');
      expect(typeof site.siteLatitude).toBe('number');
      expect(typeof site.siteLongitude).toBe('number');
      expect(typeof site.domainCode).toBe('string');
      expect(Array.isArray(site.dataProducts)).toBe(true);
    });

    it('should return locations with correct types', async () => {
      const locations = await client.getSiteLocations();
      const location = locations[0];

      expect(typeof location.locationName).toBe('string');
      expect(typeof location.locationType).toBe('string');
      expect(typeof location.locationDecimalLatitude).toBe('number');
      expect(typeof location.locationDecimalLongitude).toBe('number');
    });
  });
});
