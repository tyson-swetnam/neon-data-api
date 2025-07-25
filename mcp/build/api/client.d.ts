import { Product, Site, DataQueryParams, DataQueryResult, Location, TaxonomyResponse, Sample, Release } from './types.js';
export declare class NeonApiClient {
    private baseUrl;
    private cache;
    private retryAttempts;
    private retryDelay;
    constructor();
    private makeRequest;
    getProducts(release?: string): Promise<Product[]>;
    getProduct(productCode: string, release?: string): Promise<Product>;
    getSites(release?: string): Promise<Site[]>;
    getSite(siteCode: string): Promise<Site>;
    queryData(params: DataQueryParams): Promise<DataQueryResult>;
    getSiteLocations(): Promise<Location[]>;
    getLocation(locationName: string, hierarchy?: boolean, history?: boolean, locationType?: string): Promise<Location>;
    getLocationHierarchy(locationName: string, locationType?: string): Promise<Location>;
    findTowersAtSite(siteCode: string): Promise<Location[]>;
    searchLocationsByType(locationType: string, siteCode?: string): Promise<Location[]>;
    searchTaxonomy(params: {
        taxonTypeCode?: string;
        scientificName?: string;
        family?: string;
        genus?: string;
        kingdom?: string;
        phylum?: string;
        class?: string;
        order?: string;
        limit?: number;
        offset?: number;
        verbose?: boolean;
    }): Promise<TaxonomyResponse>;
    trackSample(params: {
        sampleTag?: string;
        sampleClass?: string;
        barcode?: string;
        sampleUuid?: string;
        archiveGuid?: string;
        degree?: number;
    }): Promise<Sample[]>;
    getReleases(): Promise<Release[]>;
    getRelease(releaseTag: string): Promise<Release>;
    getDownloadUrl(productCode: string, siteCode: string, yearMonth: string, filename: string): Promise<{
        url: string;
        size: number;
        checksum: string;
    }>;
}
