/**
 * Unit Tests for Formatters
 */

import {
  formatProduct,
  formatSite,
  formatDataQueryResult,
  formatLocation,
  formatTaxonomyEntries,
  formatSamples,
  formatRelease,
  formatFileSize,
  formatDownloadInfo,
  createDataSummary,
} from '../../../utils/formatters.js';
import { mockProduct, mockProductList } from '../../fixtures/products.fixture.js';
import { mockSiteHARV, mockSiteSRER } from '../../fixtures/sites.fixture.js';
import { mockDataQueryResult } from '../../fixtures/data.fixture.js';
import { mockLocationHARV, mockLocationTower } from '../../fixtures/locations.fixture.js';
import { TaxonomyEntry, Sample, Release } from '../../../api/types.js';

describe('Formatters', () => {
  describe('formatProduct', () => {
    it('should format product with all fields', () => {
      const result = formatProduct(mockProduct);

      expect(result).toContain(mockProduct.productCode);
      expect(result).toContain(mockProduct.productName);
      expect(result).toContain(mockProduct.productDescription);
      expect(result).toContain(mockProduct.productScienceTeam);
      expect(result).toContain('2 sites'); // siteCodes.length
      expect(result).toContain('Yes'); // productHasExpanded
    });

    it('should format product without expanded package', () => {
      const productWithoutExpanded = { ...mockProductList[1] };
      const result = formatProduct(productWithoutExpanded);

      expect(result).toContain('No'); // productHasExpanded
    });

    it('should include themes', () => {
      const result = formatProduct(mockProduct);
      mockProduct.themes.forEach(theme => {
        expect(result).toContain(theme);
      });
    });

    it('should truncate keywords to first 5', () => {
      const result = formatProduct(mockProduct);
      const keywordsToShow = mockProduct.keywords.slice(0, 5);
      keywordsToShow.forEach(keyword => {
        expect(result).toContain(keyword);
      });
    });
  });

  describe('formatSite', () => {
    it('should format site with all fields', () => {
      const result = formatSite(mockSiteHARV);

      expect(result).toContain(mockSiteHARV.siteCode);
      expect(result).toContain(mockSiteHARV.siteName);
      expect(result).toContain(mockSiteHARV.siteDescription);
      expect(result).toContain(mockSiteHARV.siteType);
      expect(result).toContain(mockSiteHARV.stateName);
      expect(result).toContain(mockSiteHARV.stateCode);
      expect(result).toContain(mockSiteHARV.domainName);
      expect(result).toContain(mockSiteHARV.domainCode);
    });

    it('should include coordinates with proper precision', () => {
      const result = formatSite(mockSiteHARV);

      expect(result).toContain('42.536900');
      expect(result).toContain('-72.172700');
    });

    it('should include product count', () => {
      const result = formatSite(mockSiteHARV);
      expect(result).toContain(`${mockSiteHARV.dataProducts.length}`);
    });

    it('should format site with no products', () => {
      const siteNoProducts = { ...mockSiteSRER, dataProducts: [] };
      const result = formatSite(siteNoProducts);
      expect(result).toContain('0');
    });
  });

  describe('formatDataQueryResult', () => {
    it('should format data query result header', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      expect(result).toContain('Data Query Results');
    });

    it('should include site codes', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      mockDataQueryResult.siteCodes.forEach(site => {
        expect(result).toContain(site.siteCode);
      });
    });

    it('should include months', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      expect(result).toContain('2022-01');
      expect(result).toContain('2022-02');
    });

    it('should include release information', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      expect(result).toContain('RELEASE-2024');
    });

    it('should include package information', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      expect(result).toContain('basic');
    });

    it('should show file names', () => {
      const result = formatDataQueryResult(mockDataQueryResult);

      expect(result).toContain('csv');
    });

    it('should handle empty result', () => {
      const emptyResult = { siteCodes: [] };
      const result = formatDataQueryResult(emptyResult);

      expect(result).toContain('Data Query Results');
    });
  });

  describe('formatLocation', () => {
    it('should format location with all fields', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain(mockLocationHARV.locationName);
      expect(result).toContain(mockLocationHARV.locationDescription);
      expect(result).toContain(mockLocationHARV.locationType);
      expect(result).toContain(mockLocationHARV.siteCode);
    });

    it('should include coordinates with proper precision', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain('42.536900');
      expect(result).toContain('-72.172700');
    });

    it('should include elevation', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain(`${mockLocationHARV.locationElevation}m`);
    });

    it('should include UTM coordinates', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain(mockLocationHARV.locationUtmZone);
    });

    it('should include parent location when present', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain(mockLocationHARV.locationParent);
    });

    it('should include child location count when present', () => {
      const result = formatLocation(mockLocationHARV);

      expect(result).toContain(`${mockLocationHARV.locationChildren?.length} locations`);
    });

    it('should format tower location', () => {
      const result = formatLocation(mockLocationTower);

      expect(result).toContain('TOWER');
      expect(result).toContain(mockLocationTower.siteCode);
    });
  });

  describe('formatTaxonomyEntries', () => {
    const mockEntries: TaxonomyEntry[] = [
      {
        taxonID: 'BIRD123',
        scientificName: 'Cardinalis cardinalis',
        taxonRank: 'species',
        kingdom: 'Animalia',
        phylum: 'Chordata',
        class: 'Aves',
        order: 'Passeriformes',
        family: 'Cardinalidae',
        genus: 'Cardinalis',
        vernacularName: 'Northern Cardinal',
        taxonTypeCode: 'BIRD',
      },
    ];

    it('should format taxonomy entries with header', () => {
      const result = formatTaxonomyEntries(mockEntries, 100);

      expect(result).toContain('Taxonomy Results');
      expect(result).toContain('1 of 100');
    });

    it('should include scientific name', () => {
      const result = formatTaxonomyEntries(mockEntries, 1);

      expect(result).toContain('Cardinalis cardinalis');
    });

    it('should include common name', () => {
      const result = formatTaxonomyEntries(mockEntries, 1);

      expect(result).toContain('Northern Cardinal');
    });

    it('should include taxonomic hierarchy', () => {
      const result = formatTaxonomyEntries(mockEntries, 1);

      expect(result).toContain('Kingdom: Animalia');
      expect(result).toContain('Family: Cardinalidae');
    });

    it('should handle entries without vernacular name', () => {
      const entryWithoutCommonName = [{ ...mockEntries[0], vernacularName: undefined }];
      const result = formatTaxonomyEntries(entryWithoutCommonName, 1);

      expect(result).not.toContain('Common Name');
    });
  });

  describe('formatSamples', () => {
    const mockSamples: Sample[] = [
      {
        sampleUuid: 'uuid-123',
        sampleTag: 'SAMPLE001',
        sampleClass: 'soil',
        barcode: 'BC123',
        archiveGuid: 'archive-456',
        events: [
          {
            eventDate: '2022-06-15',
            eventType: 'collection',
            eventLocation: 'HARV',
            eventDescription: 'Soil sample collection',
            eventPersonnel: ['John Doe', 'Jane Smith'],
          },
        ],
      },
    ];

    it('should format sample header', () => {
      const result = formatSamples(mockSamples);

      expect(result).toContain('Sample Tracking Results');
      expect(result).toContain('1 samples');
    });

    it('should include sample tag and class', () => {
      const result = formatSamples(mockSamples);

      expect(result).toContain('SAMPLE001');
      expect(result).toContain('soil');
    });

    it('should include barcode', () => {
      const result = formatSamples(mockSamples);

      expect(result).toContain('BC123');
    });

    it('should include events', () => {
      const result = formatSamples(mockSamples);

      expect(result).toContain('2022-06-15');
      expect(result).toContain('collection');
      expect(result).toContain('Soil sample collection');
    });

    it('should include personnel', () => {
      const result = formatSamples(mockSamples);

      expect(result).toContain('John Doe');
      expect(result).toContain('Jane Smith');
    });
  });

  describe('formatRelease', () => {
    const mockRelease: Release = {
      releaseTag: 'RELEASE-2024',
      releaseUuid: 'uuid-789',
      releaseGenerationDate: '2024-01-15',
      releaseDescription: 'Annual data release for 2024',
      releaseDOI: '10.5678/release-2024',
      associatedProducts: ['DP1.10003.001', 'DP1.00001.001'],
      associatedSites: ['HARV', 'SRER'],
    };

    it('should format release tag', () => {
      const result = formatRelease(mockRelease);

      expect(result).toContain('RELEASE-2024');
    });

    it('should include generation date', () => {
      const result = formatRelease(mockRelease);

      expect(result).toContain('2024-01-15');
    });

    it('should include DOI', () => {
      const result = formatRelease(mockRelease);

      expect(result).toContain('10.5678/release-2024');
    });

    it('should include product count', () => {
      const result = formatRelease(mockRelease);

      expect(result).toContain('2');
    });

    it('should include site count', () => {
      const result = formatRelease(mockRelease);

      expect(result).toContain('2');
    });
  });

  describe('formatFileSize', () => {
    it('should format zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512.00 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });

    it('should format fractional sizes', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('should format large files', () => {
      expect(formatFileSize(5368709120)).toBe('5.00 GB');
    });
  });

  describe('formatDownloadInfo', () => {
    it('should include download URL', () => {
      const result = formatDownloadInfo('https://example.com/file.csv', 1024, 'abc123');

      expect(result).toContain('https://example.com/file.csv');
    });

    it('should include formatted file size', () => {
      const result = formatDownloadInfo('https://example.com/file.csv', 1048576, 'abc123');

      expect(result).toContain('1.00 MB');
    });

    it('should include checksum', () => {
      const result = formatDownloadInfo('https://example.com/file.csv', 1024, 'checksumvalue');

      expect(result).toContain('checksumvalue');
    });

    it('should include expiration note', () => {
      const result = formatDownloadInfo('https://example.com/file.csv', 1024, 'abc123');

      expect(result).toContain('expire');
    });
  });

  describe('createDataSummary', () => {
    it('should include site count', () => {
      const result = createDataSummary(mockDataQueryResult);

      expect(result).toContain('Sites');
      expect(result).toContain('1');
    });

    it('should include month count', () => {
      const result = createDataSummary(mockDataQueryResult);

      expect(result).toContain('Months');
    });

    it('should include release count', () => {
      const result = createDataSummary(mockDataQueryResult);

      expect(result).toContain('Releases');
    });

    it('should include file count', () => {
      const result = createDataSummary(mockDataQueryResult);

      expect(result).toContain('Total Files');
    });

    it('should include total size', () => {
      const result = createDataSummary(mockDataQueryResult);

      expect(result).toContain('Total Size');
    });

    it('should handle empty result', () => {
      const emptyResult = { siteCodes: [] };
      const result = createDataSummary(emptyResult);

      expect(result).toContain('Sites');
      expect(result).toContain('0');
    });
  });
});
