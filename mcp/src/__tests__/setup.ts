/**
 * Test Setup and Constants
 *
 * Provides shared test constants and configuration for the NEON MCP Server test suite.
 */

// Known valid NEON test data
export const TEST_CONSTANTS = {
  // Products
  VALID_PRODUCT_CODE: 'DP1.10003.001', // Breeding landbird point counts
  VALID_PRODUCT_CODE_2: 'DP1.00001.001', // 2D wind speed and direction
  INVALID_PRODUCT_CODE: 'INVALID.CODE',
  MALFORMED_PRODUCT_CODE: 'DP1.123.001', // Wrong format

  // Sites
  VALID_SITE_CODE: 'HARV', // Harvard Forest
  VALID_SITE_CODE_2: 'SRER', // Santa Rita Experimental Range
  VALID_SITE_CODE_3: 'CPER', // Central Plains Experimental Range
  INVALID_SITE_CODE: 'XXXX',
  MALFORMED_SITE_CODE: 'H', // Too short

  // Domains
  VALID_DOMAIN: 'D01', // Northeast
  VALID_STATE: 'MA', // Massachusetts

  // Dates
  VALID_START_DATE: '2022-01',
  VALID_END_DATE: '2022-06',
  INVALID_DATE_FORMAT: '2022/01',
  FUTURE_DATE: '2099-12',

  // Locations
  VALID_LOCATION: 'HARV', // Harvard Forest site
  VALID_TOWER: 'TOWER104454', // Known SRER tower

  // Coordinates for proximity search (near Harvard Forest)
  HARV_LATITUDE: 42.5369,
  HARV_LONGITUDE: -72.1727,
  SEARCH_RADIUS_KM: 100,

  // Search keywords
  SEARCH_KEYWORD_BIRD: 'bird',
  SEARCH_KEYWORD_NO_MATCH: 'xyznonexistentkeyword123',

  // API timeouts
  API_TIMEOUT_MS: 60000,
  CACHE_SHORT_TTL_MS: 100,
  CACHE_DEFAULT_TTL_MS: 60 * 60 * 1000, // 1 hour
} as const;

// Cache test TTL values
export const CACHE_TEST_TTL = {
  SHORT: 100,
  MEDIUM: 1000,
  DEFAULT: 60 * 60 * 1000,
} as const;

// Helper to wait for a specified number of milliseconds
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to check if a string matches the product code format
export function isValidProductCodeFormat(code: string): boolean {
  return /^DP\d\.\d{5}\.\d{3}$/.test(code);
}

// Helper to check if a string matches the site code format
export function isValidSiteCodeFormat(code: string): boolean {
  return /^[A-Z]{4}$/.test(code);
}

// Helper to check if a string matches the year-month format
export function isValidYearMonthFormat(date: string): boolean {
  return /^\d{4}-\d{2}$/.test(date);
}

// Type guard for API response structure
export function hasDataProperty<T>(obj: unknown): obj is { data: T } {
  return typeof obj === 'object' && obj !== null && 'data' in obj;
}
