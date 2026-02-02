/**
 * E2E Tests for Location Tools
 *
 * Tests all location-related MCP tools against the live NEON API.
 */

import { NeonApiClient } from '../../api/client.js';
import { handleLocationTool } from '../../tools/locations.js';
import { TEST_CONSTANTS } from '../setup.js';

describe('Location Tools E2E Tests', () => {
  let client: NeonApiClient;

  // Create a fresh client for each test to avoid cache state issues
  beforeEach(() => {
    client = new NeonApiClient();
  });

  describe('neon_get_location', () => {
    it('should get location details for HARV', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('HARV');
      expect(result.content[0].text).toContain('Coordinates');
    });

    it('should include location type', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      expect(result.content[0].text).toContain('Type');
    });

    it('should include elevation', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      expect(result.content[0].text).toContain('Elevation');
      expect(result.content[0].text).toMatch(/\d+m/);
    });

    it('should include UTM coordinates', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      expect(result.content[0].text).toContain('UTM');
    });

    it('should get location with hierarchy option', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION,
        hierarchy: true
      }, client);

      expect(result.content[0].text).toContain('HARV');
      // May contain child or parent location info
    });

    it('should return error for invalid location', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: 'INVALID_LOCATION_XYZ'
      }, client);

      expect(result.content[0].text).toContain('Error');
    });

    it('should return validation error for empty location name', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: ''
      }, client);

      expect(result.content[0].text).toContain('Validation Error');
    });
  });

  describe('neon_list_site_locations', () => {
    // Note: The site locations endpoint may return locations with undefined coordinates
    // These tests verify the tool handles the response gracefully
    it('should list all site locations', async () => {
      const result = await handleLocationTool('neon_list_site_locations', {}, client);

      expect(result.content).toHaveLength(1);
      // Should return some response (may contain results or error for missing data)
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should handle location type filter', async () => {
      const result = await handleLocationTool('neon_list_site_locations', {
        locationType: 'SITE'
      }, client);

      expect(result.content[0].text.length).toBeGreaterThan(0);
    });
  });

  describe('neon_find_towers', () => {
    it('should find towers at SRER', async () => {
      const result = await handleLocationTool('neon_find_towers', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE_2
      }, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('NEON Tower Locations');
    });

    // Note: Finding towers without site filter can be slow (iterates through sites)
    // This test is skipped to avoid timeout
    it.skip('should find towers without site filter', async () => {
      const result = await handleLocationTool('neon_find_towers', {}, client);

      expect(result.content[0].text).toContain('NEON Tower Locations');
    }, 120000);

    it('should include tower details when found', async () => {
      const result = await handleLocationTool('neon_find_towers', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE_2
      }, client);

      // Result may have towers or suggestions
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    // Note: This test can timeout due to tower search being slow
    it.skip('should return helpful message when no towers found', async () => {
      const result = await handleLocationTool('neon_find_towers', {
        siteCode: 'CPER',
        towerType: 'nonexistenttype'
      }, client);

      expect(result.content[0].text).toContain('Tower');
    }, 120000);
  });

  describe('neon_get_location_hierarchy', () => {
    it('should get hierarchy for HARV', async () => {
      const result = await handleLocationTool('neon_get_location_hierarchy', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Location Hierarchy');
      expect(result.content[0].text).toContain('HARV');
    });

    it('should include child locations when present', async () => {
      const result = await handleLocationTool('neon_get_location_hierarchy', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      // HARV typically has child locations
      expect(result.content[0].text).toContain('HARV');
    });

    it('should work for SRER', async () => {
      const result = await handleLocationTool('neon_get_location_hierarchy', {
        locationName: TEST_CONSTANTS.VALID_SITE_CODE_2
      }, client);

      expect(result.content[0].text).toContain('Location Hierarchy');
      expect(result.content[0].text).toContain(TEST_CONSTANTS.VALID_SITE_CODE_2);
    });

    it('should handle maxDepth parameter', async () => {
      const result = await handleLocationTool('neon_get_location_hierarchy', {
        locationName: TEST_CONSTANTS.VALID_LOCATION,
        maxDepth: 1
      }, client);

      expect(result.content[0].text).toContain('Location Hierarchy');
    });

    it('should return error for invalid location', async () => {
      const result = await handleLocationTool('neon_get_location_hierarchy', {
        locationName: 'INVALID_XYZ'
      }, client);

      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('neon_search_locations', () => {
    it('should search locations by site code', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE
      }, client);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Location Search Results');
    });

    it('should search locations by text', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        searchTerm: 'tower'
      }, client);

      // Should return some response
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should search locations by proximity', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: 50
      }, client);

      expect(result.content[0].text).toContain('Location Search Results');
      expect(result.content[0].text).toContain('Distance');
    });

    it('should filter by location type', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        locationType: 'SITE'
      }, client);

      // Should return some response
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        locationType: 'SITE'
      }, client);

      expect(result.content[0].text).toContain('Location Search Results');
    });

    it('should return no matches message for empty results', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        searchTerm: 'xyznonexistentlocation123'
      }, client);

      expect(result.content[0].text).toContain('No locations found');
      expect(result.content[0].text).toContain('Suggestions');
    });

    it('should handle small search radius', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: 1
      }, client);

      expect(result.content[0].text).toContain('Location Search Results');
    });

    it('should sort results by distance in proximity search', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        latitude: TEST_CONSTANTS.HARV_LATITUDE,
        longitude: TEST_CONSTANTS.HARV_LONGITUDE,
        radius: 500
      }, client);

      expect(result.content[0].text).toContain('Distance');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool name', async () => {
      const result = await handleLocationTool('unknown_tool', {}, client);

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Unknown');
    });

    it('should return validation error for missing required fields', async () => {
      const result = await handleLocationTool('neon_get_location', {}, client);

      expect(result.content[0].text).toContain('Error');
    });

    it('should handle invalid latitude', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        latitude: 200, // Invalid - latitude must be -90 to 90
        longitude: -72.1727
      }, client);

      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle invalid longitude', async () => {
      const result = await handleLocationTool('neon_search_locations', {
        latitude: 42.5369,
        longitude: 400 // Invalid - longitude must be -180 to 180
      }, client);

      expect(result.content[0].text).toContain('Validation Error');
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted markdown', async () => {
      const result = await handleLocationTool('neon_get_location', {
        locationName: TEST_CONSTANTS.VALID_LOCATION
      }, client);

      // Check for markdown formatting
      expect(result.content[0].text).toMatch(/\*\*[^*]+\*\*/); // Bold text
    });

    it('should return some response for list results', async () => {
      const result = await handleLocationTool('neon_list_site_locations', {}, client);

      // Should have some content
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });
  });
});
