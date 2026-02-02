/**
 * Site Fixtures for Unit Tests
 */

import { Site } from '../../api/types.js';

export const mockSiteHARV: Site = {
  siteCode: 'HARV',
  siteName: 'Harvard Forest',
  siteDescription: 'A deciduous temperate forest in central Massachusetts',
  siteType: 'CORE',
  siteLatitude: 42.5369,
  siteLongitude: -72.1727,
  domainCode: 'D01',
  domainName: 'Northeast',
  stateCode: 'MA',
  stateName: 'Massachusetts',
  dataProducts: [
    {
      dataProductCode: 'DP1.10003.001',
      availableMonths: ['2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06'],
    },
    {
      dataProductCode: 'DP1.00001.001',
      availableMonths: ['2022-01', '2022-02'],
    },
  ],
};

export const mockSiteSRER: Site = {
  siteCode: 'SRER',
  siteName: 'Santa Rita Experimental Range',
  siteDescription: 'A desert grassland and shrubland site in southern Arizona',
  siteType: 'CORE',
  siteLatitude: 31.9107,
  siteLongitude: -110.8355,
  domainCode: 'D14',
  domainName: 'Desert Southwest',
  stateCode: 'AZ',
  stateName: 'Arizona',
  dataProducts: [
    {
      dataProductCode: 'DP1.10003.001',
      availableMonths: ['2022-01', '2022-02', '2022-03'],
    },
  ],
};

export const mockSiteCPER: Site = {
  siteCode: 'CPER',
  siteName: 'Central Plains Experimental Range',
  siteDescription: 'A shortgrass steppe site in northeastern Colorado',
  siteType: 'CORE',
  siteLatitude: 40.8155,
  siteLongitude: -104.7456,
  domainCode: 'D10',
  domainName: 'Central Plains',
  stateCode: 'CO',
  stateName: 'Colorado',
  dataProducts: [],
};

export const mockSiteRelocatable: Site = {
  siteCode: 'PUUM',
  siteName: 'Puʻu Makaʻala Natural Area Reserve',
  siteDescription: 'A tropical wet forest in Hawaii',
  siteType: 'RELOCATABLE',
  siteLatitude: 19.5531,
  siteLongitude: -155.3173,
  domainCode: 'D20',
  domainName: 'Pacific Tropical',
  stateCode: 'HI',
  stateName: 'Hawaii',
  dataProducts: [],
};

export const mockSiteList: Site[] = [
  mockSiteHARV,
  mockSiteSRER,
  mockSiteCPER,
  mockSiteRelocatable,
];

export const mockSitesByDomain: Record<string, Site[]> = {
  D01: [mockSiteHARV],
  D10: [mockSiteCPER],
  D14: [mockSiteSRER],
  D20: [mockSiteRelocatable],
};
