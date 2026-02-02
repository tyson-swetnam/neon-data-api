/**
 * Unit Tests for Validators
 */

import {
  ProductCodeSchema,
  SiteCodeSchema,
  YearMonthSchema,
  DataQuerySchema,
  LocationNameSchema,
  DownloadSchema,
  ValidationError,
  validateInput,
  validateDateRange,
  isValidProductCode,
  isValidSiteCode,
} from '../../../utils/validators.js';
import { TEST_CONSTANTS } from '../../setup.js';

describe('Validators', () => {
  describe('ProductCodeSchema', () => {
    it('should accept valid product code format', () => {
      const result = ProductCodeSchema.safeParse(TEST_CONSTANTS.VALID_PRODUCT_CODE);
      expect(result.success).toBe(true);
    });

    it('should accept another valid product code', () => {
      const result = ProductCodeSchema.safeParse('DP0.00001.001');
      expect(result.success).toBe(true);
    });

    it('should accept product code with level 4', () => {
      const result = ProductCodeSchema.safeParse('DP4.00200.001');
      expect(result.success).toBe(true);
    });

    it('should reject invalid format - wrong prefix', () => {
      const result = ProductCodeSchema.safeParse('XX1.10003.001');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format - wrong number of digits', () => {
      const result = ProductCodeSchema.safeParse('DP1.1003.001');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format - missing dots', () => {
      const result = ProductCodeSchema.safeParse('DP110003001');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = ProductCodeSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject lowercase letters', () => {
      const result = ProductCodeSchema.safeParse('dp1.10003.001');
      expect(result.success).toBe(false);
    });
  });

  describe('SiteCodeSchema', () => {
    it('should accept valid 4-letter site code', () => {
      const result = SiteCodeSchema.safeParse(TEST_CONSTANTS.VALID_SITE_CODE);
      expect(result.success).toBe(true);
    });

    it('should reject site code that is too short', () => {
      const result = SiteCodeSchema.safeParse('HAR');
      expect(result.success).toBe(false);
    });

    it('should reject site code that is too long', () => {
      const result = SiteCodeSchema.safeParse('HARVX');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = SiteCodeSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('YearMonthSchema', () => {
    it('should accept valid YYYY-MM format', () => {
      const result = YearMonthSchema.safeParse(TEST_CONSTANTS.VALID_START_DATE);
      expect(result.success).toBe(true);
    });

    it('should accept another valid date', () => {
      const result = YearMonthSchema.safeParse('2023-12');
      expect(result.success).toBe(true);
    });

    it('should reject invalid format - wrong separator', () => {
      const result = YearMonthSchema.safeParse('2022/01');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format - full date', () => {
      const result = YearMonthSchema.safeParse('2022-01-15');
      expect(result.success).toBe(false);
    });

    it('should reject invalid format - year only', () => {
      const result = YearMonthSchema.safeParse('2022');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = YearMonthSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('DataQuerySchema', () => {
    it('should accept valid query with siteCode', () => {
      const validQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
      };
      const result = DataQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should accept valid query with siteCodes array', () => {
      const validQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCodes: [TEST_CONSTANTS.VALID_SITE_CODE, TEST_CONSTANTS.VALID_SITE_CODE_2],
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
      };
      const result = DataQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should accept valid query with optional package', () => {
      const validQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
        package: 'expanded',
      };
      const result = DataQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should reject query without site information', () => {
      const invalidQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
      };
      const result = DataQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject query with empty siteCodes array', () => {
      const invalidQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCodes: [],
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
      };
      const result = DataQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject query with invalid product code', () => {
      const invalidQuery = {
        productCode: 'INVALID',
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
      };
      const result = DataQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject query with invalid package option', () => {
      const invalidQuery = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
        endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
        package: 'invalid',
      };
      const result = DataQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('LocationNameSchema', () => {
    it('should accept non-empty location name', () => {
      const result = LocationNameSchema.safeParse('HARV');
      expect(result.success).toBe(true);
    });

    it('should accept location name with numbers', () => {
      const result = LocationNameSchema.safeParse('TOWER104454');
      expect(result.success).toBe(true);
    });

    it('should reject empty string', () => {
      const result = LocationNameSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('DownloadSchema', () => {
    it('should accept valid download parameters', () => {
      const validParams = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        yearMonth: TEST_CONSTANTS.VALID_START_DATE,
        filename: 'data.csv',
      };
      const result = DownloadSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject empty filename', () => {
      const invalidParams = {
        productCode: TEST_CONSTANTS.VALID_PRODUCT_CODE,
        siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
        yearMonth: TEST_CONSTANTS.VALID_START_DATE,
        filename: '',
      };
      const result = DownloadSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create error with message', () => {
      const error = new ValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ValidationError');
    });

    it('should create error with field', () => {
      const error = new ValidationError('Field error', 'fieldName');
      expect(error.message).toBe('Field error');
      expect(error.field).toBe('fieldName');
    });

    it('should be instance of Error', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('validateInput', () => {
    it('should return parsed data for valid input', () => {
      const result = validateInput(ProductCodeSchema, TEST_CONSTANTS.VALID_PRODUCT_CODE);
      expect(result).toBe(TEST_CONSTANTS.VALID_PRODUCT_CODE);
    });

    it('should throw ValidationError for invalid input', () => {
      expect(() => {
        validateInput(ProductCodeSchema, 'INVALID');
      }).toThrow(ValidationError);
    });

    it('should include field path in error message', () => {
      try {
        validateInput(DataQuerySchema, {
          productCode: 'INVALID',
          siteCode: TEST_CONSTANTS.VALID_SITE_CODE,
          startDateMonth: TEST_CONSTANTS.VALID_START_DATE,
          endDateMonth: TEST_CONSTANTS.VALID_END_DATE,
        });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('productCode');
      }
    });
  });

  describe('validateDateRange', () => {
    it('should not throw for valid date range', () => {
      expect(() => {
        validateDateRange('2022-01', '2022-06');
      }).not.toThrow();
    });

    it('should not throw for same start and end date', () => {
      expect(() => {
        validateDateRange('2022-01', '2022-01');
      }).not.toThrow();
    });

    it('should throw ValidationError when start is after end', () => {
      expect(() => {
        validateDateRange('2022-06', '2022-01');
      }).toThrow(ValidationError);
    });

    it('should throw error with descriptive message for reversed dates', () => {
      try {
        validateDateRange('2022-06', '2022-01');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('Start date must be before end date');
      }
    });

    it('should throw ValidationError for future end date', () => {
      expect(() => {
        validateDateRange('2022-01', TEST_CONSTANTS.FUTURE_DATE);
      }).toThrow(ValidationError);
    });
  });

  describe('isValidProductCode', () => {
    it('should return true for valid product code', () => {
      expect(isValidProductCode(TEST_CONSTANTS.VALID_PRODUCT_CODE)).toBe(true);
    });

    it('should return false for invalid product code', () => {
      expect(isValidProductCode('INVALID')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidProductCode('')).toBe(false);
    });
  });

  describe('isValidSiteCode', () => {
    it('should return true for valid site code', () => {
      expect(isValidSiteCode(TEST_CONSTANTS.VALID_SITE_CODE)).toBe(true);
    });

    it('should return false for invalid site code', () => {
      expect(isValidSiteCode('HI')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidSiteCode('')).toBe(false);
    });
  });
});
