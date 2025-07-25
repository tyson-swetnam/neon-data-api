import { formatLocation } from '../utils/formatters.js';
import { validateInput, ValidationError } from '../utils/validators.js';
import { z } from 'zod';
export function createLocationTools(client) {
    return [
        {
            name: 'neon_get_location',
            description: 'Get detailed information about a specific NEON location',
            inputSchema: {
                type: 'object',
                properties: {
                    locationName: {
                        type: 'string',
                        description: 'Location identifier (e.g., "TOWER104454", "SRER", "D14")'
                    },
                    hierarchy: {
                        type: 'boolean',
                        description: 'Include location hierarchy information (parent/children)',
                        default: false
                    },
                    history: {
                        type: 'boolean',
                        description: 'Include location history information',
                        default: false
                    },
                    locationType: {
                        type: 'string',
                        description: 'When getting hierarchy, filter children by type (e.g., "TOWER", "HUT")'
                    }
                },
                required: ['locationName']
            }
        },
        {
            name: 'neon_list_site_locations',
            description: 'List all site-level locations across NEON',
            inputSchema: {
                type: 'object',
                properties: {
                    locationType: {
                        type: 'string',
                        description: 'Filter by location type (e.g., "TOWER", "HUT", "MEGAPIT")'
                    }
                }
            }
        },
        {
            name: 'neon_find_towers',
            description: 'Find all tower locations at a site or across NEON',
            inputSchema: {
                type: 'object',
                properties: {
                    siteCode: {
                        type: 'string',
                        description: 'Specific site code to search (4 letters, e.g., "SRER")',
                        pattern: '^[A-Z]{4}$'
                    },
                    towerType: {
                        type: 'string',
                        description: 'Type of tower to find (e.g., "flux", "meteorological")'
                    }
                }
            }
        },
        {
            name: 'neon_get_location_hierarchy',
            description: 'Get the complete location hierarchy for a site or location',
            inputSchema: {
                type: 'object',
                properties: {
                    locationName: {
                        type: 'string',
                        description: 'Parent location to explore (e.g., "SRER", "D14")'
                    },
                    locationType: {
                        type: 'string',
                        description: 'Filter children by location type (e.g., "TOWER")'
                    },
                    maxDepth: {
                        type: 'number',
                        description: 'Maximum hierarchy depth to traverse',
                        default: 3
                    }
                },
                required: ['locationName']
            }
        },
        {
            name: 'neon_search_locations',
            description: 'Search locations by name, type, or proximity',
            inputSchema: {
                type: 'object',
                properties: {
                    searchTerm: {
                        type: 'string',
                        description: 'Text to search in location names and descriptions'
                    },
                    locationType: {
                        type: 'string',
                        description: 'Filter by location type (e.g., "TOWER", "HUT")'
                    },
                    siteCode: {
                        type: 'string',
                        description: 'Limit search to specific site (4 letters)',
                        pattern: '^[A-Z]{4}$'
                    },
                    latitude: {
                        type: 'number',
                        description: 'Center latitude for proximity search',
                        minimum: -90,
                        maximum: 90
                    },
                    longitude: {
                        type: 'number',
                        description: 'Center longitude for proximity search',
                        minimum: -180,
                        maximum: 180
                    },
                    radius: {
                        type: 'number',
                        description: 'Search radius in kilometers (used with lat/lon)',
                        default: 50
                    }
                }
            }
        }
    ];
}
export async function handleLocationTool(name, args, client) {
    try {
        switch (name) {
            case 'neon_get_location': {
                const schema = z.object({
                    locationName: z.string().min(1),
                    hierarchy: z.boolean().default(false),
                    history: z.boolean().default(false),
                    locationType: z.string().optional()
                });
                const { locationName, hierarchy, history, locationType } = validateInput(schema, args);
                const location = await client.getLocation(locationName, hierarchy, history, locationType);
                let result = formatLocation(location);
                // Add hierarchy information if requested
                if (hierarchy && location.locationChildren && location.locationChildren.length > 0) {
                    result += '\n\n## Child Locations\n\n';
                    location.locationChildren.forEach(child => {
                        result += `- ${child}\n`;
                    });
                }
                if (hierarchy && location.locationParent) {
                    result += `\n**Parent Location**: ${location.locationParent}\n`;
                }
                // Add history information if requested
                if (history && location.locationHistory && location.locationHistory.length > 0) {
                    result += '\n\n## Location History\n\n';
                    location.locationHistory.forEach((hist, index) => {
                        result += `### Period ${index + 1}\n`;
                        result += `- **Dates**: ${hist.locationStartDate} to ${hist.locationEndDate || 'present'}\n`;
                        result += `- **Current**: ${hist.current ? 'Yes' : 'No'}\n`;
                        if (hist.locationDecimalLatitude && hist.locationDecimalLongitude) {
                            result += `- **Coordinates**: ${hist.locationDecimalLatitude.toFixed(6)}, ${hist.locationDecimalLongitude.toFixed(6)}\n`;
                        }
                        result += '\n';
                    });
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_list_site_locations': {
                const schema = z.object({
                    locationType: z.string().optional()
                });
                const { locationType } = validateInput(schema, args);
                const locations = await client.getSiteLocations();
                let filteredLocations = locations;
                if (locationType) {
                    filteredLocations = locations.filter(loc => loc.locationType.toLowerCase().includes(locationType.toLowerCase()));
                }
                let result = `# NEON Site Locations (${filteredLocations.length} locations)\n\n`;
                // Group by site for better organization
                const locationsBySite = filteredLocations.reduce((acc, loc) => {
                    if (!acc[loc.siteCode]) {
                        acc[loc.siteCode] = [];
                    }
                    acc[loc.siteCode].push(loc);
                    return acc;
                }, {});
                Object.keys(locationsBySite).sort().forEach(siteCode => {
                    const siteLocations = locationsBySite[siteCode];
                    result += `## ${siteCode} (${siteLocations.length} locations)\n\n`;
                    siteLocations.forEach(loc => {
                        result += `- **${loc.locationName}**: ${loc.locationDescription}\n`;
                        result += `  - **Type**: ${loc.locationType}\n`;
                        result += `  - **Coordinates**: ${loc.locationDecimalLatitude.toFixed(6)}, ${loc.locationDecimalLongitude.toFixed(6)}\n`;
                        result += `  - **Elevation**: ${loc.locationElevation}m\n\n`;
                    });
                });
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_find_towers': {
                const schema = z.object({
                    siteCode: z.string().length(4).regex(/^[A-Z]{4}$/).optional(),
                    towerType: z.string().optional()
                });
                const { siteCode, towerType } = validateInput(schema, args);
                let towers = [];
                if (siteCode) {
                    towers = await client.findTowersAtSite(siteCode);
                }
                else {
                    towers = await client.searchLocationsByType('TOWER');
                }
                // Filter by tower type if specified
                if (towerType) {
                    const searchTerm = towerType.toLowerCase();
                    towers = towers.filter(tower => tower.locationDescription.toLowerCase().includes(searchTerm) ||
                        tower.locationName.toLowerCase().includes(searchTerm));
                }
                let result = `# NEON Tower Locations (${towers.length} towers)\n\n`;
                if (towers.length === 0) {
                    result += 'No towers found matching your criteria.\n\n';
                    result += '**Suggestions:**\n';
                    result += '- Try different search criteria\n';
                    result += '- Use neon_list_site_locations to see all available locations\n';
                    result += '- Check if the site code is correct\n';
                }
                else {
                    towers.forEach(tower => {
                        result += formatLocation(tower) + '\n\n---\n\n';
                    });
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_get_location_hierarchy': {
                const schema = z.object({
                    locationName: z.string().min(1),
                    locationType: z.string().optional(),
                    maxDepth: z.number().min(1).max(5).default(3)
                });
                const { locationName, locationType, maxDepth } = validateInput(schema, args);
                const location = await client.getLocationHierarchy(locationName, locationType);
                let result = `# Location Hierarchy for ${locationName}\n\n`;
                result += formatLocation(location) + '\n\n';
                // Display hierarchy structure
                if (location.locationChildren && location.locationChildren.length > 0) {
                    result += `## Child Locations (${location.locationChildren.length})\n\n`;
                    for (const childName of location.locationChildren.slice(0, 20)) { // Limit to first 20
                        try {
                            const childLocation = await client.getLocation(childName);
                            result += `### ${childName}\n`;
                            result += `- **Type**: ${childLocation.locationType}\n`;
                            result += `- **Description**: ${childLocation.locationDescription}\n`;
                            if (childLocation.locationDecimalLatitude && childLocation.locationDecimalLongitude) {
                                result += `- **Coordinates**: ${childLocation.locationDecimalLatitude.toFixed(6)}, ${childLocation.locationDecimalLongitude.toFixed(6)}\n`;
                            }
                            result += '\n';
                        }
                        catch (error) {
                            result += `### ${childName}\n`;
                            result += `- **Error**: Could not fetch details\n\n`;
                        }
                    }
                    if (location.locationChildren.length > 20) {
                        result += `... and ${location.locationChildren.length - 20} more child locations\n\n`;
                    }
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_search_locations': {
                const schema = z.object({
                    searchTerm: z.string().optional(),
                    locationType: z.string().optional(),
                    siteCode: z.string().length(4).regex(/^[A-Z]{4}$/).optional(),
                    latitude: z.number().min(-90).max(90).optional(),
                    longitude: z.number().min(-180).max(180).optional(),
                    radius: z.number().positive().default(50)
                });
                const { searchTerm, locationType, siteCode, latitude, longitude, radius } = validateInput(schema, args);
                // Get base set of locations
                let locations = await client.getSiteLocations();
                // Filter by site if specified
                if (siteCode) {
                    locations = locations.filter(loc => loc.siteCode === siteCode);
                }
                // Filter by location type
                if (locationType) {
                    locations = locations.filter(loc => loc.locationType.toLowerCase().includes(locationType.toLowerCase()));
                }
                // Filter by search term
                if (searchTerm) {
                    const searchLower = searchTerm.toLowerCase();
                    locations = locations.filter(loc => loc.locationName.toLowerCase().includes(searchLower) ||
                        loc.locationDescription.toLowerCase().includes(searchLower));
                }
                // Filter by proximity if coordinates provided
                if (latitude !== undefined && longitude !== undefined) {
                    locations = locations.filter(loc => {
                        const distance = calculateDistance(latitude, longitude, loc.locationDecimalLatitude, loc.locationDecimalLongitude);
                        return distance <= (radius || 50);
                    });
                    // Sort by distance
                    locations.sort((a, b) => {
                        const distA = calculateDistance(latitude, longitude, a.locationDecimalLatitude, a.locationDecimalLongitude);
                        const distB = calculateDistance(latitude, longitude, b.locationDecimalLatitude, b.locationDecimalLongitude);
                        return distA - distB;
                    });
                }
                let result = `# Location Search Results (${locations.length} matches)\n\n`;
                if (locations.length === 0) {
                    result += 'No locations found matching your criteria.\n\n';
                    result += '**Suggestions:**\n';
                    result += '- Try broader search terms\n';
                    result += '- Increase search radius for proximity searches\n';
                    result += '- Use neon_list_site_locations to see all available locations\n';
                }
                else {
                    locations.forEach(loc => {
                        result += formatLocation(loc);
                        // Add distance if proximity search was used
                        if (latitude !== undefined && longitude !== undefined) {
                            const distance = calculateDistance(latitude, longitude, loc.locationDecimalLatitude, loc.locationDecimalLongitude);
                            result += `\n**Distance**: ${distance.toFixed(2)} km`;
                        }
                        result += '\n\n---\n\n';
                    });
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            default:
                throw new Error(`Unknown location tool: ${name}`);
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
