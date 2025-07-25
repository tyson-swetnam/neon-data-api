// NEON API Type Definitions

export interface NeonApiResponse<T> {
  data: T;
}

export interface NeonErrorResponse {
  detail: string;
  status: number;
}

// Product Types
export interface Product {
  productCode: string;
  productName: string;
  productDescription: string;
  productScienceTeam: string;
  productHasExpanded: boolean;
  productBasicDescription: string;
  productExpandedDescription: string;
  productPublicationFormatType: string;
  keywords: string[];
  themes: string[];
  siteCodes: {
    siteCode: string;
    availableMonths: string[];
  }[];
}

// Site Types
export interface Site {
  siteCode: string;
  siteName: string;
  siteDescription: string;
  siteType: string;
  siteLatitude: number;
  siteLongitude: number;
  domainCode: string;
  domainName: string;
  stateCode: string;
  stateName: string;
  dataProducts: {
    dataProductCode: string;
    availableMonths: string[];
  }[];
}

// Data Query Types
export interface DataQueryParams {
  productCode: string;
  siteCode?: string;
  siteCodes?: string[];
  startDateMonth: string;
  endDateMonth: string;
  package?: 'basic' | 'expanded';
  release?: string;
  includeProvisional?: boolean;
}

export interface DataFile {
  name: string;
  size: number;
  md5: string;
  crc32c: string;
  url: string;
}

export interface DataPackage {
  package: string;
  files: DataFile[];
}

export interface DataRelease {
  release: string;
  packages: DataPackage[];
}

export interface DataQueryResult {
  siteCodes: {
    siteCode: string;
    availableMonths: {
      month: string;
      availableDataUrls: DataRelease[];
    }[];
  }[];
}

// Location Types
export interface LocationHistory {
  current: boolean;
  locationStartDate: string;
  locationEndDate?: string;
  locationDecimalLatitude?: number;
  locationDecimalLongitude?: number;
  locationElevation?: number;
  locationUtmEasting?: number;
  locationUtmNorthing?: number;
  locationUtmZone?: string;
  locationProperties?: Record<string, any>;
}

export interface Location {
  locationName: string;
  locationType: string;
  locationDescription: string;
  siteCode: string;
  locationDecimalLatitude: number;
  locationDecimalLongitude: number;
  locationElevation: number;
  locationUtmEasting: number;
  locationUtmNorthing: number;
  locationUtmZone: string;
  locationProperties: Record<string, any>;
  locationParent?: string;
  locationParentUrl?: string;
  locationChildren?: string[];
  locationChildrenUrls?: string[];
  locationHistory?: LocationHistory[];
}

// Taxonomy Types
export interface TaxonomyEntry {
  taxonID: string;
  scientificName: string;
  taxonRank: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  specificEpithet?: string;
  infraspecificEpithet?: string;
  vernacularName?: string;
  taxonTypeCode: string;
}

export interface TaxonomyResponse {
  data: TaxonomyEntry[];
  count: number;
  total: number;
}

// Sample Types
export interface SampleEvent {
  eventDate: string;
  eventType: string;
  eventLocation: string;
  eventDescription: string;
  eventPersonnel: string[];
}

export interface Sample {
  sampleUuid: string;
  sampleTag: string;
  sampleClass: string;
  barcode?: string;
  archiveGuid?: string;
  parentSampleUuid?: string;
  childSampleUuids?: string[];
  events: SampleEvent[];
}

// Release Types
export interface Release {
  releaseTag: string;
  releaseUuid: string;
  releaseGenerationDate: string;
  releaseDescription: string;
  releaseDOI: string;
  associatedProducts: string[];
  associatedSites: string[];
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type CacheKey = string;
export type CacheStore = Map<CacheKey, CacheEntry<any>>;