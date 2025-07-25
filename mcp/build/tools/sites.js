import { formatSite } from '../utils/formatters.js';
import { validateInput, ValidationError } from '../utils/validators.js';
import { z } from 'zod';
export function createSiteTools(client) {
    return [
        {
            name: 'neon_list_sites',
            description: 'List all NEON field sites with optional release filtering',
            inputSchema: {
                type: 'object',
                properties: {
                    release: {
                        type: 'string',
                        description: 'Optional release tag to filter sites (e.g., "RELEASE-2024")'
                    },
                    domain: {
                        type: 'string',
                        description: 'Optional domain code to filter sites (e.g., "D01")'
                    },
                    state: {
                        type: 'string',
                        description: 'Optional state code to filter sites (e.g., "MA")'
                    },
                    siteType: {
                        type: 'string',
                        description: 'Optional site type to filter sites (e.g., "CORE", "RELOCATABLE")'
                    }
                }
            }
        },
        {
            name: 'neon_get_site',
            description: 'Get detailed information about a specific NEON field site',
            inputSchema: {
                type: 'object',
                properties: {
                    siteCode: {
                        type: 'string',
                        description: 'NEON site code (4 letters, e.g., "HARV")',
                        pattern: '^[A-Z]{4}$'
                    }
                },
                required: ['siteCode']
            }
        },
        {
            name: 'neon_search_sites',
            description: 'Search NEON field sites by name, location, or other criteria',
            inputSchema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Search term to match in site names or descriptions'
                    },
                    latitude: {
                        type: 'number',
                        description: 'Latitude for proximity search'
                    },
                    longitude: {
                        type: 'number',
                        description: 'Longitude for proximity search'
                    },
                    radius: {
                        type: 'number',
                        description: 'Search radius in kilometers (used with lat/lon)',
                        default: 100
                    }
                }
            }
        },
        {
            name: 'neon_get_site_products',
            description: 'Get all data products available at a specific site with availability info',
            inputSchema: {
                type: 'object',
                properties: {
                    siteCode: {
                        type: 'string',
                        description: 'NEON site code (4 letters, e.g., "HARV")',
                        pattern: '^[A-Z]{4}$'
                    }
                },
                required: ['siteCode']
            }
        }
    ];
}
export async function handleSiteTool(name, args, client) {
    try {
        switch (name) {
            case 'neon_list_sites': {
                const schema = z.object({
                    release: z.string().optional(),
                    domain: z.string().optional(),
                    state: z.string().optional(),
                    siteType: z.string().optional()
                });
                const { release, domain, state, siteType } = validateInput(schema, args);
                let sites = await client.getSites(release);
                // Apply filters
                if (domain) {
                    sites = sites.filter(site => site.domainCode === domain);
                }
                if (state) {
                    sites = sites.filter(site => site.stateCode === state);
                }
                if (siteType) {
                    sites = sites.filter(site => site.siteType.toLowerCase().includes(siteType.toLowerCase()));
                }
                let result = `# NEON Field Sites (${sites.length} sites)\n\n`;
                // Group by domain for better organization
                const sitesByDomain = sites.reduce((acc, site) => {
                    if (!acc[site.domainCode]) {
                        acc[site.domainCode] = [];
                    }
                    acc[site.domainCode].push(site);
                    return acc;
                }, {});
                Object.keys(sitesByDomain).sort().forEach(domainCode => {
                    const domainSites = sitesByDomain[domainCode];
                    result += `## ${domainCode}: ${domainSites[0].domainName}\n\n`;
                    domainSites.forEach(site => {
                        result += `- **${site.siteCode}**: ${site.siteName}\n`;
                        result += `  - **Type**: ${site.siteType}\n`;
                        result += `  - **Location**: ${site.stateName}\n`;
                        result += `  - **Products**: ${site.dataProducts.length}\n\n`;
                    });
                });
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_get_site': {
                const schema = z.object({
                    siteCode: z.string().length(4, 'Site code must be 4 characters').regex(/^[A-Z]{4}$/)
                });
                const { siteCode } = validateInput(schema, args);
                const site = await client.getSite(siteCode);
                let result = formatSite(site);
                // Add detailed product information
                result += '\n\n## Available Data Products\n\n';
                site.dataProducts.forEach(product => {
                    const monthsCount = product.availableMonths.length;
                    result += `- **${product.dataProductCode}**: ${monthsCount} months available\n`;
                });
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_search_sites': {
                const schema = z.object({
                    name: z.string().optional(),
                    latitude: z.number().min(-90).max(90).optional(),
                    longitude: z.number().min(-180).max(180).optional(),
                    radius: z.number().positive().default(100)
                });
                const { name, latitude, longitude, radius } = validateInput(schema, args);
                const sites = await client.getSites();
                let filteredSites = sites;
                // Filter by name
                if (name) {
                    const searchTerm = name.toLowerCase();
                    filteredSites = filteredSites.filter(site => site.siteName.toLowerCase().includes(searchTerm) ||
                        site.siteDescription.toLowerCase().includes(searchTerm) ||
                        site.siteCode.toLowerCase().includes(searchTerm));
                }
                // Filter by proximity
                if (latitude !== undefined && longitude !== undefined) {
                    filteredSites = filteredSites.filter(site => {
                        const distance = calculateDistance(latitude, longitude, site.siteLatitude, site.siteLongitude);
                        return distance <= (radius || 100);
                    });
                    // Sort by distance
                    filteredSites.sort((a, b) => {
                        const distA = calculateDistance(latitude, longitude, a.siteLatitude, a.siteLongitude);
                        const distB = calculateDistance(latitude, longitude, b.siteLatitude, b.siteLongitude);
                        return distA - distB;
                    });
                }
                let result = `# Site Search Results (${filteredSites.length} matches)\n\n`;
                if (filteredSites.length === 0) {
                    result += 'No sites found matching your criteria.\n\n';
                    result += '**Suggestions:**\n';
                    result += '- Try broader search terms\n';
                    result += '- Increase search radius for proximity searches\n';
                    result += '- Use neon_list_sites to see all available sites\n';
                }
                else {
                    filteredSites.forEach(site => {
                        result += formatSite(site);
                        // Add distance if proximity search was used
                        if (latitude !== undefined && longitude !== undefined) {
                            const distance = calculateDistance(latitude, longitude, site.siteLatitude, site.siteLongitude);
                            result += `\n**Distance**: ${distance.toFixed(2)} km`;
                        }
                        result += '\n\n---\n\n';
                    });
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_get_site_products': {
                const schema = z.object({
                    siteCode: z.string().length(4).regex(/^[A-Z]{4}$/)
                });
                const { siteCode } = validateInput(schema, args);
                const site = await client.getSite(siteCode);
                let result = `# Data Products at ${site.siteName} (${site.siteCode})\n\n`;
                result += `**Total Products**: ${site.dataProducts.length}\n\n`;
                // Group products by data level
                const productsByLevel = site.dataProducts.reduce((acc, product) => {
                    const level = product.dataProductCode.substring(0, 3); // DP0, DP1, etc.
                    if (!acc[level]) {
                        acc[level] = [];
                    }
                    acc[level].push(product);
                    return acc;
                }, {});
                Object.keys(productsByLevel).sort().forEach(level => {
                    const levelProducts = productsByLevel[level];
                    result += `## ${level} Products (${levelProducts.length})\n\n`;
                    levelProducts.forEach(product => {
                        const monthsCount = product.availableMonths.length;
                        const dateRange = getDateRange(product.availableMonths);
                        result += `- **${product.dataProductCode}**\n`;
                        result += `  - **Months Available**: ${monthsCount}\n`;
                        result += `  - **Date Range**: ${dateRange}\n\n`;
                    });
                });
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            default:
                throw new Error(`Unknown site tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof ValidationError) {
            return {
                content: [{
                        type: 'text',
                        text: `**Validation Error**: ${error.message}\n\nPlease check your input parameters and try again.`
                    }]
            };
        }
        return {
            content: [{
                    type: 'text',
                    text: `**Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or contact support if the issue persists.`
                }]
        };
    }
}
// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Helper function to get date range from available months
function getDateRange(months) {
    if (months.length === 0)
        return 'No data available';
    const sortedMonths = months.sort();
    const first = sortedMonths[0];
    const last = sortedMonths[sortedMonths.length - 1];
    return first === last ? first : `${first} to ${last}`;
}
