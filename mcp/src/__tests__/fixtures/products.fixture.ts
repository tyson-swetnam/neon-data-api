/**
 * Product Fixtures for Unit Tests
 */

import { Product } from '../../api/types.js';

export const mockProduct: Product = {
  productCode: 'DP1.10003.001',
  productName: 'Breeding landbird point counts',
  productDescription: 'Count, species identification, and distance estimates of all birds detected during point count surveys',
  productScienceTeam: 'Terrestrial Observation System (TOS)',
  productHasExpanded: true,
  productBasicDescription: 'Basic data package description',
  productExpandedDescription: 'Expanded data package description',
  productPublicationFormatType: 'TOS Protocol and calculation/transformation algorithm',
  keywords: ['birds', 'breeding', 'point count', 'landbirds', 'songbirds'],
  themes: ['Organisms, Populations, and Communities'],
  siteCodes: [
    {
      siteCode: 'HARV',
      availableMonths: ['2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06'],
    },
    {
      siteCode: 'SRER',
      availableMonths: ['2022-01', '2022-02', '2022-03'],
    },
  ],
};

export const mockProductList: Product[] = [
  mockProduct,
  {
    productCode: 'DP1.00001.001',
    productName: '2D wind speed and direction',
    productDescription: 'Two dimensional wind speed and direction, available as 30-minute averages and 2-minute maximums',
    productScienceTeam: 'Terrestrial Instrument System (TIS)',
    productHasExpanded: false,
    productBasicDescription: 'Basic wind data',
    productExpandedDescription: 'Expanded wind data',
    productPublicationFormatType: 'TIS Data',
    keywords: ['wind', 'meteorology', 'atmosphere'],
    themes: ['Atmosphere'],
    siteCodes: [
      {
        siteCode: 'HARV',
        availableMonths: ['2022-01', '2022-02'],
      },
    ],
  },
  {
    productCode: 'DP1.20288.001',
    productName: 'Water quality',
    productDescription: 'Water quality measurements',
    productScienceTeam: 'Aquatic Observation System (AOS)',
    productHasExpanded: true,
    productBasicDescription: 'Basic water quality data',
    productExpandedDescription: 'Expanded water quality data',
    productPublicationFormatType: 'AOS Protocol',
    keywords: ['water', 'quality', 'hydrology'],
    themes: ['Hydrology', 'Biogeochemistry'],
    siteCodes: [],
  },
];

export const mockProductSearchResults = {
  byKeywordBird: mockProductList.filter(p =>
    p.keywords.some(k => k.toLowerCase().includes('bird'))
  ),
  byThemeAtmosphere: mockProductList.filter(p =>
    p.themes.some(t => t.toLowerCase().includes('atmosphere'))
  ),
  noMatches: [],
};
