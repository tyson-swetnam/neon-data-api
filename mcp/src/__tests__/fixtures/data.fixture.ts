/**
 * Data Query Fixtures for Unit Tests
 */

import { DataQueryResult, DataQueryParams } from '../../api/types.js';

export const mockDataQueryParams: DataQueryParams = {
  productCode: 'DP1.10003.001',
  siteCode: 'HARV',
  startDateMonth: '2022-01',
  endDateMonth: '2022-06',
  package: 'basic',
};

export const mockDataQueryParamsMultipleSites: DataQueryParams = {
  productCode: 'DP1.10003.001',
  siteCodes: ['HARV', 'SRER'],
  startDateMonth: '2022-01',
  endDateMonth: '2022-06',
};

export const mockDataQueryResult: DataQueryResult = {
  siteCodes: [
    {
      siteCode: 'HARV',
      availableMonths: [
        {
          month: '2022-01',
          availableDataUrls: [
            {
              release: 'RELEASE-2024',
              packages: [
                {
                  package: 'basic',
                  files: [
                    {
                      name: 'NEON.D01.HARV.DP1.10003.001.brd_countdata.2022-01.basic.csv',
                      size: 1048576,
                      md5: 'abc123def456',
                      crc32c: 'xyz789',
                      url: 'https://data.neonscience.org/api/v0/data/DP1.10003.001/HARV/2022-01/file.csv',
                    },
                    {
                      name: 'NEON.D01.HARV.DP1.10003.001.variables.csv',
                      size: 524288,
                      md5: 'def456ghi789',
                      crc32c: 'abc123',
                      url: 'https://data.neonscience.org/api/v0/data/DP1.10003.001/HARV/2022-01/variables.csv',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          month: '2022-02',
          availableDataUrls: [
            {
              release: 'RELEASE-2024',
              packages: [
                {
                  package: 'basic',
                  files: [
                    {
                      name: 'NEON.D01.HARV.DP1.10003.001.brd_countdata.2022-02.basic.csv',
                      size: 2097152,
                      md5: 'ghi789jkl012',
                      crc32c: 'mno345',
                      url: 'https://data.neonscience.org/api/v0/data/DP1.10003.001/HARV/2022-02/file.csv',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const mockDataQueryResultMultipleSites: DataQueryResult = {
  siteCodes: [
    {
      siteCode: 'HARV',
      availableMonths: [
        {
          month: '2022-01',
          availableDataUrls: [
            {
              release: 'RELEASE-2024',
              packages: [
                {
                  package: 'basic',
                  files: [
                    {
                      name: 'file1.csv',
                      size: 1048576,
                      md5: 'abc123',
                      crc32c: 'xyz789',
                      url: 'https://example.com/file1.csv',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      siteCode: 'SRER',
      availableMonths: [
        {
          month: '2022-01',
          availableDataUrls: [
            {
              release: 'RELEASE-2024',
              packages: [
                {
                  package: 'basic',
                  files: [
                    {
                      name: 'file2.csv',
                      size: 2097152,
                      md5: 'def456',
                      crc32c: 'uvw123',
                      url: 'https://example.com/file2.csv',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const mockEmptyDataQueryResult: DataQueryResult = {
  siteCodes: [],
};
