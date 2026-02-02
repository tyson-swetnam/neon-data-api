import fetch from 'node-fetch';
import { ApiCache } from './cache.js';
import {
  NeonApiResponse,
  NeonErrorResponse,
  Product,
  Site,
  DataQueryParams,
  DataQueryResult,
  DataFile,
  DataPackage,
  Location,
  TaxonomyResponse,
  Sample,
  Release
} from './types.js';

export class NeonApiClient {
  private baseUrl: string = 'https://data.neonscience.org';
  private cache: ApiCache;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.cache = new ApiCache();
    
    // Run cache cleanup every 10 minutes
    setInterval(() => {
      this.cache.cleanup();
    }, 10 * 60 * 1000);
  }

  private async makeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>,
    cacheEnabled: boolean = true,
    cacheTtl?: number
  ): Promise<T> {
    const cacheKey = ApiCache.generateKey(endpoint, params);
    
    // Check cache first
    if (cacheEnabled) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let url = `${this.baseUrl}${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      url += `?${searchParams.toString()}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json() as NeonErrorResponse;
          throw new Error(`NEON API Error: ${errorData.detail} (Status: ${errorData.status})`);
        }

        const data = await response.json() as NeonApiResponse<T>;
        
        // Cache successful responses
        if (cacheEnabled) {
          this.cache.set(cacheKey, data.data, cacheTtl);
        }
        
        return data.data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('Status: 4')) {
          throw error;
        }
        
        // Wait before retrying
        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to make request after retries');
  }

  // Product API methods
  async getProducts(release?: string): Promise<Product[]> {
    const params = release ? { release } : undefined;
    return this.makeRequest<Product[]>('/api/v0/products', params);
  }

  async getProduct(productCode: string, release?: string): Promise<Product> {
    const params = release ? { release } : undefined;
    return this.makeRequest<Product>(`/api/v0/products/${productCode}`, params);
  }

  // Site API methods
  async getSites(release?: string): Promise<Site[]> {
    const params = release ? { release } : undefined;
    return this.makeRequest<Site[]>('/api/v0/sites', params);
  }

  async getSite(siteCode: string): Promise<Site> {
    return this.makeRequest<Site>(`/api/v0/sites/${siteCode}`);
  }

  // Data Query API methods
  async queryData(params: DataQueryParams): Promise<DataQueryResult> {
    // Generate list of months in the date range
    const months = this.generateMonthRange(params.startDateMonth, params.endDateMonth);

    // Determine which sites to query
    const sites: string[] = params.siteCodes || (params.siteCode ? [params.siteCode] : []);

    if (sites.length === 0) {
      throw new Error('Either siteCode or siteCodes must be provided');
    }

    const result: DataQueryResult = { siteCodes: [] };

    // Query each site
    for (const siteCode of sites) {
      const siteData: DataQueryResult['siteCodes'][0] = {
        siteCode,
        availableMonths: []
      };

      // Query each month for this site
      for (const month of months) {
        try {
          const monthData = await this.getDataForMonth(
            params.productCode,
            siteCode,
            month,
            params.package,
            params.release,
            params.includeProvisional
          );

          if (monthData) {
            siteData.availableMonths.push(monthData);
          }
        } catch (error) {
          // Skip months with no data (404 errors)
          if (error instanceof Error && !error.message.includes('Status: 404')) {
            console.warn(`Error fetching data for ${siteCode}/${month}:`, error);
          }
        }
      }

      // Only include site if it has data
      if (siteData.availableMonths.length > 0) {
        result.siteCodes.push(siteData);
      }
    }

    return result;
  }

  // Helper to generate month range
  private generateMonthRange(startMonth: string, endMonth: string): string[] {
    const months: string[] = [];
    const [startYear, startMon] = startMonth.split('-').map(Number);
    const [endYear, endMon] = endMonth.split('-').map(Number);

    let year = startYear;
    let month = startMon;

    while (year < endYear || (year === endYear && month <= endMon)) {
      months.push(`${year}-${month.toString().padStart(2, '0')}`);
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return months;
  }

  // Helper to get data for a specific month
  private async getDataForMonth(
    productCode: string,
    siteCode: string,
    yearMonth: string,
    packageType?: 'basic' | 'expanded',
    release?: string,
    includeProvisional?: boolean
  ): Promise<DataQueryResult['siteCodes'][0]['availableMonths'][0] | null> {
    const endpoint = `/api/v0/data/${productCode}/${siteCode}/${yearMonth}`;
    const params: Record<string, any> = {};

    if (packageType) params.package = packageType;
    if (release) params.release = release;
    if (includeProvisional) params.includeProvisional = includeProvisional;

    interface MonthDataResponse {
      files?: Array<{
        name: string;
        size: number;
        md5?: string;
        crc32c?: string;
        url: string;
      }>;
      packages?: Array<{
        type: string;
        url: string;
      }>;
      release?: string;
    }

    const data = await this.makeRequest<MonthDataResponse>(endpoint, Object.keys(params).length > 0 ? params : undefined);

    if (!data || (!data.files && !data.packages)) {
      return null;
    }

    // Transform the response to match expected structure
    const releaseName = data.release || release || 'PROVISIONAL';

    // Group files by package type (basic/expanded)
    const packages: DataPackage[] = [];

    if (data.files && data.files.length > 0) {
      // Files are returned directly - group by package type based on filename
      const basicFiles: DataFile[] = [];
      const expandedFiles: DataFile[] = [];

      data.files.forEach(file => {
        const dataFile: DataFile = {
          name: file.name,
          size: file.size || 0,
          md5: file.md5 || '',
          crc32c: file.crc32c || '',
          url: file.url
        };

        // Check if file belongs to expanded package
        if (file.name.includes('.expanded.') || file.name.includes('_expanded_')) {
          expandedFiles.push(dataFile);
        } else {
          basicFiles.push(dataFile);
        }
      });

      if (basicFiles.length > 0) {
        packages.push({ package: 'basic', files: basicFiles });
      }
      if (expandedFiles.length > 0) {
        packages.push({ package: 'expanded', files: expandedFiles });
      }
    }

    if (packages.length === 0) {
      return null;
    }

    return {
      month: yearMonth,
      availableDataUrls: [{
        release: releaseName,
        packages
      }]
    };
  }

  // Location API methods
  async getSiteLocations(): Promise<Location[]> {
    return this.makeRequest<Location[]>('/api/v0/locations/sites');
  }

  async getLocation(locationName: string, hierarchy?: boolean, history?: boolean, locationType?: string): Promise<Location> {
    const params: Record<string, any> = {};
    if (hierarchy) params.hierarchy = true;
    if (history) params.history = true;
    if (locationType) params.locationType = locationType;
    
    return this.makeRequest<Location>(`/api/v0/locations/${locationName}`, params);
  }

  async getLocationHierarchy(locationName: string, locationType?: string): Promise<Location> {
    const params: Record<string, any> = { hierarchy: true };
    if (locationType) params.locationType = locationType;
    
    return this.makeRequest<Location>(`/api/v0/locations/${locationName}`, params);
  }

  async findTowersAtSite(siteCode: string): Promise<Location[]> {
    try {
      // For SRER, we know the tower is TOWER104454 - try direct access first
      if (siteCode === 'SRER') {
        try {
          const tower = await this.getLocation('TOWER104454');
          if (tower.siteCode === siteCode) {
            return [tower];
          }
        } catch (error) {
          // Continue with general approach if direct access fails
        }
      }
      
      // Get all site locations and filter for towers at this site
      const siteLocations = await this.getSiteLocations();
      const towers = siteLocations.filter(loc => 
        loc.siteCode === siteCode && 
        (loc.locationType === 'TOWER' || 
         loc.locationName.toUpperCase().includes('TOWER') ||
         loc.locationDescription.toLowerCase().includes('tower') ||
         loc.locationDescription.toLowerCase().includes('flux'))
      );
      
      // If we didn't find any towers in site locations, try a known pattern
      if (towers.length === 0) {
        // Many NEON sites have towers with predictable naming patterns
        const possibleTowerNames = [
          `TOWER${siteCode}`,
          `${siteCode}_TOWER`,
          `${siteCode}.TOWER`,
          // Try with common tower IDs (these are just examples, actual IDs vary)
          'TOWER104454', // SRER
          'TOWER103029', // Common pattern
          'TOWER102755', // Common pattern
        ];
        
        for (const towerName of possibleTowerNames) {
          try {
            const tower = await this.getLocation(towerName);
            if (tower.siteCode === siteCode) {
              towers.push(tower);
            }
          } catch (error) {
            // Continue trying other names
          }
        }
      }
      
      return towers;
    } catch (error) {
      console.warn(`Error finding towers at ${siteCode}:`, error);
      return [];
    }
  }

  async searchLocationsByType(locationType: string, siteCode?: string): Promise<Location[]> {
    try {
      // If searching within a specific site
      if (siteCode) {
        return this.findTowersAtSite(siteCode);
      }
      
      // For broader search, get all site locations and check each
      const siteLocations = await this.getSiteLocations();
      const matchingLocations: Location[] = [];
      
      for (const site of siteLocations.slice(0, 10)) { // Limit to first 10 sites to avoid rate limits
        try {
          const towers = await this.findTowersAtSite(site.siteCode);
          matchingLocations.push(...towers);
        } catch (error) {
          // Continue with other sites
        }
      }
      
      return matchingLocations;
    } catch (error) {
      console.warn('Error searching locations by type:', error);
      return [];
    }
  }

  // Taxonomy API methods
  async searchTaxonomy(params: {
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
  }): Promise<TaxonomyResponse> {
    return this.makeRequest<TaxonomyResponse>('/api/v0/taxonomy', params);
  }

  // Sample API methods
  async trackSample(params: {
    sampleTag?: string;
    sampleClass?: string;
    barcode?: string;
    sampleUuid?: string;
    archiveGuid?: string;
    degree?: number;
  }): Promise<Sample[]> {
    const endpoint = '/api/v0/samples/view';
    return this.makeRequest<Sample[]>(endpoint, params, false); // Don't cache sample data
  }

  // Release API methods
  async getReleases(): Promise<Release[]> {
    return this.makeRequest<Release[]>('/api/v0/releases');
  }

  async getRelease(releaseTag: string): Promise<Release> {
    return this.makeRequest<Release>(`/api/v0/releases/${releaseTag}`);
  }

  // Download methods
  async getDownloadUrl(
    productCode: string, 
    siteCode: string, 
    yearMonth: string, 
    filename: string
  ): Promise<{ url: string; size: number; checksum: string }> {
    const endpoint = `/api/v0/data/${productCode}/${siteCode}/${yearMonth}/${filename}`;
    
    // Don't cache download URLs as they expire
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error(`File not found: ${filename}`);
    }

    return {
      url: response.url,
      size: parseInt(response.headers.get('content-length') || '0'),
      checksum: response.headers.get('etag') || ''
    };
  }
}