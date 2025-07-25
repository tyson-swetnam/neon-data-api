# NEON MCP Server Implementation Plan

## Executive Summary

This document outlines the design and implementation plan for a Model Context Protocol (MCP) server that interfaces with the NEON (National Ecological Observatory Network) Data API. The MCP server will enable AI assistants to query and retrieve ecological data from NEON's comprehensive data repository through a standardized protocol.

## Project Overview

### Objectives
- Create an MCP server that exposes NEON's ecological data to AI assistants
- Provide intuitive tools for querying products, sites, samples, and downloading data
- Enable efficient data exploration and retrieval for scientific research
- Implement proper caching and rate limiting to respect API resources

### Key Features
- Query NEON data products by code, site, and date range
- Browse and search taxonomic information
- Access location and site metadata
- Download data files and packages
- Track sample custody chains
- Access data releases with DOI citations

## Architecture Design

### MCP Server Structure

```
neon-mcp-server/
├── src/
│   ├── index.ts           # Main MCP server entry point
│   ├── tools/             # MCP tool implementations
│   │   ├── products.ts    # Product-related tools
│   │   ├── sites.ts       # Site information tools
│   │   ├── data.ts        # Data query and download tools
│   │   ├── locations.ts   # Location details tools
│   │   ├── taxonomy.ts    # Taxonomic search tools
│   │   ├── samples.ts     # Sample tracking tools
│   │   └── releases.ts    # Data release tools
│   ├── api/
│   │   ├── client.ts      # NEON API client wrapper
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── cache.ts       # Response caching logic
│   └── utils/
│       ├── formatters.ts  # Data formatting utilities
│       └── validators.ts  # Input validation
├── package.json
├── tsconfig.json
└── README.md
```

### Core Components

#### 1. MCP Server Core
- Implements the MCP protocol using the official SDK
- Manages tool registration and request routing
- Handles connection lifecycle and error management

#### 2. NEON API Client
- Centralized HTTP client for all NEON API calls
- Implements retry logic and error handling
- Manages base URL configuration (https://data.neonscience.org)
- Handles response parsing and type safety

#### 3. Caching Layer
- In-memory cache for frequently accessed data (products, sites, taxonomy)
- TTL-based expiration (1 hour for most endpoints)
- Cache invalidation strategies for data updates

#### 4. Tool Implementations
Each tool category will provide specific functionality mapped to NEON endpoints.

## MCP Tools Design

### 1. Product Tools

**Tool: `neon_list_products`**
- Description: List all available NEON data products
- Parameters:
  - `release` (optional): Filter by specific release
- Returns: Array of products with codes, names, and descriptions

**Tool: `neon_get_product`**
- Description: Get detailed information about a specific product
- Parameters:
  - `productCode` (required): 13-character product code
  - `release` (optional): Specific release version
- Returns: Product details including availability, documentation, keywords

### 2. Site Tools

**Tool: `neon_list_sites`**
- Description: List all NEON field sites
- Parameters:
  - `release` (optional): Filter by release
- Returns: Array of sites with codes, names, coordinates

**Tool: `neon_get_site`**
- Description: Get detailed information about a specific site
- Parameters:
  - `siteCode` (required): 4-letter site code
- Returns: Site details including domain, available products

### 3. Data Query Tools

**Tool: `neon_query_data`**
- Description: Query for available data files
- Parameters:
  - `productCode` (required): Product to query
  - `siteCode` or `siteCodes` (required): Site(s) to query
  - `startDateMonth` (required): Start date (YYYY-MM)
  - `endDateMonth` (required): End date (YYYY-MM)
  - `package` (optional): "basic" or "expanded"
  - `release` (optional): Specific release
  - `includeProvisional` (optional): Include provisional data
- Returns: Hierarchical structure of available files with URLs

**Tool: `neon_download_file`**
- Description: Get download URL for a specific data file
- Parameters:
  - `productCode` (required): Product code
  - `siteCode` (required): Site code
  - `yearMonth` (required): Year-month (YYYY-MM)
  - `filename` (required): File name
- Returns: Download URL and file metadata

### 4. Location Tools

**Tool: `neon_get_location`**
- Description: Get detailed location information
- Parameters:
  - `locationName` (required): Location identifier
  - `hierarchy` (optional): Include hierarchy info
  - `history` (optional): Include location history
- Returns: Location details with coordinates, elevation, properties

**Tool: `neon_list_site_locations`**
- Description: List all site-level locations
- Parameters:
  - `locationType` (optional): Filter by type (TOWER, HUT, etc.)
- Returns: Array of location information

**Tool: `neon_find_towers`**
- Description: Find all tower locations at a site or across NEON
- Parameters:
  - `siteCode` (optional): Specific site to search
  - `towerType` (optional): Type of tower (flux, meteorological, etc.)
- Returns: Array of tower locations with coordinates

**Tool: `neon_get_location_hierarchy`**
- Description: Get location hierarchy for a site or location
- Parameters:
  - `locationName` (required): Parent location to explore
  - `locationType` (optional): Filter children by type
  - `maxDepth` (optional): Maximum hierarchy depth
- Returns: Hierarchical structure of locations

**Tool: `neon_search_locations`**
- Description: Search locations by name, type, or proximity
- Parameters:
  - `searchTerm` (optional): Text search in names/descriptions
  - `locationType` (optional): Filter by location type
  - `siteCode` (optional): Limit to specific site
  - `latitude` (optional): Center latitude for proximity search
  - `longitude` (optional): Center longitude for proximity search  
  - `radius` (optional): Search radius in km
- Returns: Array of matching locations

### 5. Taxonomy Tools

**Tool: `neon_search_taxonomy`**
- Description: Search NEON's taxonomic lists
- Parameters:
  - `taxonTypeCode` (optional): Type filter (BIRD, PLANT, etc.)
  - `scientificName` (optional): Scientific name search
  - `family` (optional): Family name filter
  - `genus` (optional): Genus name filter
  - `limit` (optional): Results per page (default 100)
  - `offset` (optional): Pagination offset
- Returns: Paginated taxonomic records

### 6. Sample Tools

**Tool: `neon_track_sample`**
- Description: Track sample custody chain
- Parameters:
  - `sampleTag` + `sampleClass` OR
  - `barcode` OR
  - `sampleUuid` OR
  - `archiveGuid`
  - `degree` (optional): Search depth
- Returns: Sample metadata and custody events

### 7. Release Tools

**Tool: `neon_list_releases`**
- Description: List all NEON data releases
- Returns: Array of releases with tags, dates, DOIs

**Tool: `neon_get_release`**
- Description: Get specific release information
- Parameters:
  - `releaseTag` (required): Release identifier
- Returns: Release details, associated products and sites

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1)
1. Set up TypeScript project with MCP SDK
2. Implement basic MCP server structure
3. Create NEON API client with error handling
4. Add response caching layer

### Phase 2: Essential Tools (Week 2)
1. Implement product listing and detail tools
2. Add site information tools
3. Create data query tool
4. Test basic workflows

### Phase 3: Advanced Features (Week 3)
1. Add location and taxonomy tools
2. Implement sample tracking
3. Add release management tools
4. Create download helpers

### Phase 4: Polish and Testing (Week 4)
1. Comprehensive error handling
2. Rate limiting implementation
3. Documentation and examples
4. Performance optimization

## Technical Considerations

### Error Handling
- Graceful degradation for API failures
- Clear error messages for users
- Retry logic for transient failures

### Performance
- Response caching to minimize API calls
- Efficient data structures for large responses
- Pagination support for taxonomy queries

### Security
- No authentication required (public API)
- Input validation to prevent injection
- Secure handling of download URLs

### Usability
- Intuitive tool names and descriptions
- Smart parameter defaults
- Helpful error messages with suggestions
- Format data for readability in AI contexts

## Example Usage Scenarios

### Scenario 1: Finding Bird Population Data
```typescript
// Find bird population product
await neon_list_products({ filter: "bird" })
// Returns: DP1.10003.001 - Breeding landbird point counts

// Check available sites
await neon_get_product({ productCode: "DP1.10003.001" })

// Query specific site data
await neon_query_data({
  productCode: "DP1.10003.001",
  siteCode: "HARV",
  startDateMonth: "2023-05",
  endDateMonth: "2023-08"
})
```

### Scenario 2: Taxonomic Research
```typescript
// Search for all beetle species
await neon_search_taxonomy({
  taxonTypeCode: "BEETLE",
  limit: 50
})

// Get specific genus information
await neon_search_taxonomy({
  genus: "Carabus",
  taxonTypeCode: "BEETLE"
})
```

### Scenario 3: Sample Tracking
```typescript
// Track a soil sample
await neon_track_sample({
  barcode: "B12345678",
  degree: 2
})
```

## Success Metrics

1. **Functionality**: All major NEON API endpoints accessible via MCP tools
2. **Performance**: Average response time < 2 seconds for cached queries
3. **Reliability**: 99% uptime with graceful error handling
4. **Usability**: Clear documentation and intuitive tool interfaces
5. **Adoption**: Easy integration with Claude, ChatGPT, and other AI assistants

## Future Enhancements

1. **Batch Operations**: Support for multiple simultaneous queries
2. **Data Visualization**: Generate simple charts/graphs from data
3. **Export Formats**: Support for CSV, Excel exports
4. **Subscription Alerts**: Notify when new data becomes available
5. **GraphQL Integration**: Add support for NEON's GraphQL endpoint
6. **Local Caching**: Persistent cache for frequently accessed data

## Conclusion

This MCP server will bridge the gap between NEON's valuable ecological data and AI assistants, enabling researchers and scientists to efficiently explore and retrieve data through natural language interactions. The modular design allows for incremental development and easy maintenance while providing comprehensive access to NEON's data ecosystem.