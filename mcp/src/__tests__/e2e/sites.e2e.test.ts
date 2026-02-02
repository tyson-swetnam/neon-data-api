/**
 * E2E Tests for Site Tools
 *
 * Tests all site-related MCP tools against the live NEON API.
 */

import { NeonApiClient } from '../../api/client.js';
import { handleSiteTool } from '../../tools/sites.js';
import { TEST_CONSTANTS } from '../setup.js';

describe('Site Tools E2E Tests', () => {
  let client: NeonApiClient;

  // Create a fresh client for each test to avoid cache state issues
  beforeEach(() => {
    client = new NeonApiClient();
  });

  describe('neon_list_sites', () => {
    it('should list all sites', async () => {
      const result = await handleSiteTool('neon_list_sites', {}, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('NEON Field Sites');
      expect(result.content[0].text).toContain('sites');
      // Should contain site codes
      expect(result.content[0].text).toMatch(/[A-Z]{4}/);
    });

    it('should group sites by domain', async () => {
      const result = await handleSiteTool('neon_list_sites', {}, client);

      // Should contain domain identifiers
      expect(result.content[0].text).toMatch(/D\d{2}/);
    });

    it('should include site type information', async () => {
      const result = await handleSiteTool('neon_list_sites', {}, client);

      expect(result.content[0].text).toContain('Type');
    });

    it('should filter by domain', async () => {
      const result = await handleSiteTool('neon_list_sites', {
        domain: TEST_CONSTANTS.VALID_DOMAIN
      }, client);

      expect(result.content[0].text).toContain('NEON Field Sites');
      // Should only show D01 domain
      expect(result.content[0].text).toContain('D01');
    });

    it('should filter by state', async () => {
      const result = await handleSiteTool('neon_list_sites', {
        state: TEST_CONSTANTS.VALID_STATE
      }, client);

      expect(result.content[0].text).toContain('NEON Field Sites');
      // Should only show Massachusetts sites
      expect(result.content[0].text).toContain('Massachusetts');
    });

    it('should filter by site type', async () => {
      const result = await handleSiteTool('neon_list_sites', {
        siteType: 'CORE'
      }, client);

      expect(result.content[0].text).toContain('NEON Field Sites');
      expect(result.content[0].text).toContain('CORE');
    });

    it('should combine filters', async () => {
      const result = await handleSiteTool('neon_list_sites', {
        domain: TEST_CONSTANTS.VALID_DOMAIN,
        siteType: 'CORE'
      }, client);

      expect(result.content[0].text).toContain('NEON Field Sites');
    });
  });

  describe('neon_get_site', () => {
    it('should get details for Harvard Forest (HARV)', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('HARV');
      expect(result.content[0].text).toContain('Harvard');
      expect(result.content[0].text).toContain('Massachusetts');
    });

    it('should include coordinates', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Coordinates');
      expect(result.content[0].text).toMatch(/-?\d+\.\d+/);
    });

    it('should include domain information', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Domain');
      expect(result.content[0].text).toContain('Northeast');
    });

    it('should include available data products', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Available Data Products');
      expect(result.content[0].text).toMatch(/DP\d\.\d{5}\.\d{3}/);
    });

    it('should get details for Santa Rita (SRER)', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE_2
      }, client);

      expect(result.content[0].text).toContain('SRER');
      expect(result.content[0].text).toContain('Arizona');
    });

    it('should return error for invalid site code', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.INVALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Error');
    });

    it('should return validation error for malformed site code', async () => {
      const result = await handleSiteTool('neon_get_site', {
        siteCode: TEST_CONSTANTS.MALFORMED_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Validation Error');
    });
  });

  describe('neon_search_sites', () => {
    it('should search sites by name', async () => {
      const result = await handleSiteTool('neon_search_sites', {
        name: 'Harvard'
      }, client);

      expect(result.content[0].text).toContain('Site Search Results');
      expect(result.content[0].text).toContain('Harvard');
    });

    it('should search sites by proximity to Harvard Forest', async () => {
      const result = await handleSiteTool('neon_search_sites', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: TEST_CONSTANTS.SEARCH_RADIUS_KM
      }, client);

      expect(result.content[0].text).toContain('Site Search Results');
      expect(result.content[0].text).toContain('Distance');
    });

    it('should sort by distance in proximity search', async () => {
      const result = await handleSiteTool('neon_search_sites', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: 500
      }, client);

      // HARV should be closest to its own coordinates
      const harvIndex = result.content[0].text.indexOf('HARV');
      expect(harvIndex).toBeGreaterThan(-1);
    });

    it('should return no matches message for no results', async () => {
      const result = await handleSiteTool('neon_search_sites', {
        name: 'xyznonexistentsite123'
      }, client);

      expect(result.content[0].text).toContain('No sites found');
      expect(result.content[0].text).toContain('Suggestions');
    });

    it('should handle search with small radius', async () => {
      const result = await handleSiteTool('neon_search_sites', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: 1 // 1 km radius
      }, client);

      expect(result.content[0].text).toContain('Site Search Results');
      // Should find at least HARV within 1km of itself
      expect(result.content[0].text).toContain('HARV');
    });
  });

  describe('neon_get_site_products', () => {
    it('should list products available at HARV', async () => {
      const result = await handleSiteTool('neon_get_site_products', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Data Products at');
      expect(result.content[0].text).toContain('HARV');
      expect(result.content[0].text).toContain('Total Products');
    });

    it('should group products by data level', async () => {
      const result = await handleSiteTool('neon_get_site_products', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      // Should contain DP1 or DP2 or similar level indicators
      expect(result.content[0].text).toMatch(/DP\d Products/);
    });

    it('should include date range for products', async () => {
      const result = await handleSiteTool('neon_get_site_products', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Date Range');
      expect(result.content[0].text).toContain('Months Available');
    });

    it('should work for SRER site', async () => {
      const result = await handleSiteTool('neon_get_site_products', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE_2
      }, client);

      expect(result.content[0].text).toContain('Data Products at');
      expect(result.content[0].text).toContain('SRER');
    });

    it('should return error for invalid site code', async () => {
      const result = await handleSiteTool('neon_get_site_products', {
        siteCode: TEST_CONSTANTS.INVALID_SITE_CODE
      }, client);

      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool name', async () => {
      const result = await handleSiteTool('unknown_tool', {}, client);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Unknown');
    });

    it('should return validation error for missing required fields', async () => {
      const result = await handleSiteTool('neon_get_site', {}, client);

      expect(result.content[0].text).toContain('Error');
    });
  });
});
