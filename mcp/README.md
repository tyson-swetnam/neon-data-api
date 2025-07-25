# NEON MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with access to the NEON (National Ecological Observatory Network) Data API. This server enables natural language queries for ecological data discovery, site information, and data downloads.

## Features

- **Product Discovery**: Search and explore NEON's 180+ data products
- **Site Information**: Access details about NEON's 81 field sites across the US
- **Data Queries**: Find and download ecological data files
- **Smart Caching**: Optimized performance with intelligent response caching
- **Error Handling**: Robust error handling with helpful user feedback

## Installation

```bash
# Clone the repository
cd mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the server
npm start
```

## MCP Client Configuration

### Claude Desktop

Add this configuration to your Claude Desktop settings file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%/Claude/claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/neon-data-api/mcp"
    }
  }
}
```

### Cline (VS Code Extension)

Add this configuration to your Cline MCP settings file (`.vscode/settings.json` or global settings):

```json
{
  "cline.mcp.servers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/neon-data-api/mcp"
    }
  }
}
```

### Other MCP Clients

For any MCP-compatible client, use this configuration:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/neon-data-api/mcp",
      "env": {}
    }
  }
}
```

**Important Notes:**
- Replace `/absolute/path/to/neon-data-api/mcp` with the actual absolute path to your MCP server directory
- Ensure the server is built (`npm run build`) before configuring the client
- The server will automatically start when the MCP client connects

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run linter
npm run lint

# Run tests
npm test
```

## Available Tools

### Product Tools

#### `neon_list_products`
List all available NEON data products with optional release filtering.

**Parameters:**
- `release` (optional): Release tag to filter products

#### `neon_get_product`
Get detailed information about a specific NEON data product.

**Parameters:**
- `productCode` (required): NEON product code (e.g., "DP1.10003.001")
- `release` (optional): Specific release version

#### `neon_search_products`
Search NEON data products by keyword, theme, or science team.

**Parameters:**
- `keyword` (optional): Search term for names/descriptions
- `theme` (optional): Theme filter (e.g., "Biogeochemistry")
- `scienceTeam` (optional): Science team filter
- `release` (optional): Release filter

### Site Tools

#### `neon_list_sites`
List all NEON field sites with optional filtering.

**Parameters:**
- `release` (optional): Release tag filter
- `domain` (optional): Domain code filter (e.g., "D01")
- `state` (optional): State code filter (e.g., "MA")
- `siteType` (optional): Site type filter

#### `neon_get_site`
Get detailed information about a specific NEON field site.

**Parameters:**
- `siteCode` (required): 4-letter site code (e.g., "HARV")

#### `neon_search_sites`
Search NEON field sites by name, location, or proximity.

**Parameters:**
- `name` (optional): Search term for site names
- `latitude` (optional): Latitude for proximity search
- `longitude` (optional): Longitude for proximity search
- `radius` (optional): Search radius in km (default: 100)

#### `neon_get_site_products`
Get all data products available at a specific site.

**Parameters:**
- `siteCode` (required): 4-letter site code

### Data Tools

#### `neon_query_data`
Query for available NEON data files with flexible filtering.

**Parameters:**
- `productCode` (required): Product code
- `siteCode` OR `siteCodes` (required): Site(s) to query
- `startDateMonth` (required): Start date (YYYY-MM)
- `endDateMonth` (required): End date (YYYY-MM)
- `package` (optional): "basic" or "expanded"
- `release` (optional): Specific release
- `includeProvisional` (optional): Include provisional data

#### `neon_get_download_url`
Get download URL and metadata for a specific data file.

**Parameters:**
- `productCode` (required): Product code
- `siteCode` (required): Site code
- `yearMonth` (required): Year-month (YYYY-MM)
- `filename` (required): File name

#### `neon_summarize_data_availability`
Get a summary of data availability for a product across sites and time.

**Parameters:**
- `productCode` (required): Product code
- `release` (optional): Release filter

### Location Tools

#### `neon_get_location`
Get detailed information about a specific NEON location.

**Parameters:**
- `locationName` (required): Location identifier (e.g., "TOWER104454", "SRER")
- `hierarchy` (optional): Include location hierarchy information
- `history` (optional): Include location history information
- `locationType` (optional): Filter children by type when getting hierarchy

#### `neon_list_site_locations`
List all site-level locations across NEON.

**Parameters:**
- `locationType` (optional): Filter by location type (e.g., "TOWER", "HUT")

#### `neon_find_towers`
Find all tower locations at a site or across NEON.

**Parameters:**
- `siteCode` (optional): Specific site code to search (4 letters)
- `towerType` (optional): Type of tower to find (e.g., "flux", "meteorological")

#### `neon_get_location_hierarchy`
Get the complete location hierarchy for a site or location.

**Parameters:**
- `locationName` (required): Parent location to explore
- `locationType` (optional): Filter children by location type
- `maxDepth` (optional): Maximum hierarchy depth to traverse

#### `neon_search_locations`
Search locations by name, type, or proximity.

**Parameters:**
- `searchTerm` (optional): Text to search in names and descriptions
- `locationType` (optional): Filter by location type  
- `siteCode` (optional): Limit search to specific site
- `latitude` (optional): Center latitude for proximity search
- `longitude` (optional): Center longitude for proximity search
- `radius` (optional): Search radius in km (default: 50)

## Usage Examples

### Finding Bird Data
```javascript
// Search for bird-related products
await neon_search_products({ keyword: "bird" });

// Get details about breeding landbird counts
await neon_get_product({ productCode: "DP1.10003.001" });

// Query bird data for Harvard Forest
await neon_query_data({
  productCode: "DP1.10003.001",
  siteCode: "HARV",
  startDateMonth: "2023-05",
  endDateMonth: "2023-08"
});
```

### Exploring Sites
```javascript
// Find sites in Massachusetts
await neon_search_sites({ name: "Massachusetts" });

// Get details about Harvard Forest
await neon_get_site({ siteCode: "HARV" });

// Find sites within 50km of a location
await neon_search_sites({
  latitude: 42.5378,
  longitude: -72.1715,
  radius: 50
});
```

### Data Discovery
```javascript
// Summarize availability of soil temperature data
await neon_summarize_data_availability({ 
  productCode: "DP1.00041.001" 
});

// Get download URL for a specific file
await neon_get_download_url({
  productCode: "DP1.10003.001",
  siteCode: "HARV",
  yearMonth: "2023-06",
  filename: "NEON.D01.HARV.DP1.10003.001.brd_countdata.2023-06.basic.csv"
});
```

### Finding Tower Locations
```javascript
// Find the eddy covariance tower at SRER
await neon_find_towers({ siteCode: "SRER" });

// Get detailed tower information with coordinates
await neon_get_location({ 
  locationName: "TOWER104454",
  hierarchy: true 
});

// Search for all flux towers across NEON
await neon_find_towers({ towerType: "flux" });
```

### Location Exploration
```javascript
// Get the location hierarchy for a site
await neon_get_location_hierarchy({ 
  locationName: "SRER",
  locationType: "TOWER" 
});

// Search locations by proximity
await neon_search_locations({
  latitude: 31.91,
  longitude: -110.84,
  radius: 10
});

// Find all towers in a domain
await neon_search_locations({
  searchTerm: "tower",
  locationType: "TOWER"
});
```

## Configuration

The server uses the public NEON Data API at `https://data.neonscience.org`. No authentication is required.

### Caching

- Product and site data: 1 hour TTL
- Data query results: 30 minutes TTL
- Download URLs: Not cached (expire after 1 hour)

### Rate Limiting

The server implements retry logic with exponential backoff. No explicit rate limiting is enforced as the NEON API is publicly accessible.

## Error Handling

The server provides detailed error messages for:
- Invalid product codes or site codes
- Date format errors
- API connectivity issues
- Validation errors

## Architecture

```
src/
├── index.ts          # Main MCP server
├── api/
│   ├── client.ts     # NEON API client
│   ├── cache.ts      # Response caching
│   └── types.ts      # TypeScript interfaces
├── tools/
│   ├── products.ts   # Product-related tools
│   ├── sites.ts      # Site information tools
│   └── data.ts       # Data query tools
└── utils/
    ├── formatters.ts # Data formatting utilities
    └── validators.ts # Input validation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [NEON Data API documentation](https://data.neonscience.org/data-api)
- Review the tool descriptions and examples above
- Open an issue in this repository