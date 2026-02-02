/**
 * Location Fixtures for Unit Tests
 */

import { Location } from '../../api/types.js';

export const mockLocationHARV: Location = {
  locationName: 'HARV',
  locationType: 'SITE',
  locationDescription: 'Harvard Forest NEON site',
  siteCode: 'HARV',
  locationDecimalLatitude: 42.5369,
  locationDecimalLongitude: -72.1727,
  locationElevation: 348,
  locationUtmEasting: 732183.2,
  locationUtmNorthing: 4713265.1,
  locationUtmZone: '18N',
  locationProperties: {},
  locationParent: 'D01',
  locationChildren: ['HARV_001', 'HARV_002', 'HARV_003'],
};

export const mockLocationTower: Location = {
  locationName: 'TOWER104454',
  locationType: 'TOWER',
  locationDescription: 'SRER flux tower',
  siteCode: 'SRER',
  locationDecimalLatitude: 31.9107,
  locationDecimalLongitude: -110.8355,
  locationElevation: 997,
  locationUtmEasting: 509150.8,
  locationUtmNorthing: 3530752.3,
  locationUtmZone: '12N',
  locationProperties: {
    towerType: 'flux',
    height: 20,
  },
};

export const mockLocationSRER: Location = {
  locationName: 'SRER',
  locationType: 'SITE',
  locationDescription: 'Santa Rita Experimental Range NEON site',
  siteCode: 'SRER',
  locationDecimalLatitude: 31.9107,
  locationDecimalLongitude: -110.8355,
  locationElevation: 997,
  locationUtmEasting: 509150.8,
  locationUtmNorthing: 3530752.3,
  locationUtmZone: '12N',
  locationProperties: {},
  locationParent: 'D14',
  locationChildren: ['TOWER104454', 'SRER_001', 'SRER_002'],
};

export const mockLocationWithHistory: Location = {
  ...mockLocationHARV,
  locationHistory: [
    {
      current: false,
      locationStartDate: '2017-01-01',
      locationEndDate: '2020-12-31',
      locationDecimalLatitude: 42.5365,
      locationDecimalLongitude: -72.1725,
      locationElevation: 347,
    },
    {
      current: true,
      locationStartDate: '2021-01-01',
      locationDecimalLatitude: 42.5369,
      locationDecimalLongitude: -72.1727,
      locationElevation: 348,
    },
  ],
};

export const mockSiteLocations: Location[] = [
  mockLocationHARV,
  mockLocationSRER,
  mockLocationTower,
  {
    locationName: 'CPER',
    locationType: 'SITE',
    locationDescription: 'Central Plains Experimental Range NEON site',
    siteCode: 'CPER',
    locationDecimalLatitude: 40.8155,
    locationDecimalLongitude: -104.7456,
    locationElevation: 1654,
    locationUtmEasting: 521725.4,
    locationUtmNorthing: 4519023.8,
    locationUtmZone: '13N',
    locationProperties: {},
  },
];

export const mockTowerLocations: Location[] = [
  mockLocationTower,
  {
    locationName: 'TOWER102755',
    locationType: 'TOWER',
    locationDescription: 'HARV flux tower',
    siteCode: 'HARV',
    locationDecimalLatitude: 42.5380,
    locationDecimalLongitude: -72.1730,
    locationElevation: 355,
    locationUtmEasting: 732200.0,
    locationUtmNorthing: 4713300.0,
    locationUtmZone: '18N',
    locationProperties: {},
  },
];
