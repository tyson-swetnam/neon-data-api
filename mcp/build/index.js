#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { NeonApiClient } from './api/client.js';
import { createProductTools, handleProductTool } from './tools/products.js';
import { createSiteTools, handleSiteTool } from './tools/sites.js';
import { createDataTools, handleDataTool } from './tools/data.js';
import { createLocationTools, handleLocationTool } from './tools/locations.js';
class NeonMcpServer {
    server;
    client;
    tools;
    constructor() {
        this.server = new Server({
            name: 'neon-data-api',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.client = new NeonApiClient();
        this.tools = [];
        this.setupTools();
        this.setupHandlers();
    }
    setupTools() {
        // Register all tool categories
        this.tools = [
            ...createProductTools(this.client),
            ...createSiteTools(this.client),
            ...createDataTools(this.client),
            ...createLocationTools(this.client),
        ];
    }
    setupHandlers() {
        // Handle tool listing
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.tools,
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                // Route to appropriate tool handler based on tool name
                if (name.startsWith('neon_list_products') ||
                    name.startsWith('neon_get_product') ||
                    name.startsWith('neon_search_products')) {
                    return await handleProductTool(name, args, this.client);
                }
                if (name.startsWith('neon_list_sites') ||
                    name.startsWith('neon_get_site') ||
                    name.startsWith('neon_search_sites') ||
                    name.startsWith('neon_get_site_products')) {
                    return await handleSiteTool(name, args, this.client);
                }
                if (name.startsWith('neon_query_data') ||
                    name.startsWith('neon_get_download_url') ||
                    name.startsWith('neon_summarize_data_availability')) {
                    return await handleDataTool(name, args, this.client);
                }
                if (name.startsWith('neon_get_location') ||
                    name.startsWith('neon_list_site_locations') ||
                    name.startsWith('neon_find_towers') ||
                    name.startsWith('neon_get_location_hierarchy') ||
                    name.startsWith('neon_search_locations')) {
                    return await handleLocationTool(name, args, this.client);
                }
                throw new Error(`Unknown tool: ${name}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing tool "${name}": ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        // Log server startup
        console.error('NEON MCP Server started successfully');
        console.error(`Available tools: ${this.tools.length}`);
        console.error('Tools:', this.tools.map(t => t.name).join(', '));
    }
}
// Start the server
async function main() {
    const server = new NeonMcpServer();
    await server.run();
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.error('Shutting down NEON MCP Server...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.error('Shutting down NEON MCP Server...');
    process.exit(0);
});
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Failed to start NEON MCP Server:', error);
        process.exit(1);
    });
}
