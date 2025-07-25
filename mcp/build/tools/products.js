import { formatProduct } from '../utils/formatters.js';
import { validateInput, ValidationError } from '../utils/validators.js';
import { z } from 'zod';
export function createProductTools(client) {
    return [
        {
            name: 'neon_list_products',
            description: 'List all available NEON data products with optional release filtering',
            inputSchema: {
                type: 'object',
                properties: {
                    release: {
                        type: 'string',
                        description: 'Optional release tag to filter products (e.g., "RELEASE-2024")'
                    }
                }
            }
        },
        {
            name: 'neon_get_product',
            description: 'Get detailed information about a specific NEON data product',
            inputSchema: {
                type: 'object',
                properties: {
                    productCode: {
                        type: 'string',
                        description: 'NEON product code (e.g., "DP1.10003.001")',
                        pattern: '^DP\\d\\.\\d{5}\\.\\d{3}$'
                    },
                    release: {
                        type: 'string',
                        description: 'Optional release tag to get product info for specific release'
                    }
                },
                required: ['productCode']
            }
        },
        {
            name: 'neon_search_products',
            description: 'Search NEON data products by keyword, theme, or science team',
            inputSchema: {
                type: 'object',
                properties: {
                    keyword: {
                        type: 'string',
                        description: 'Search keyword to match in product names, descriptions, or keywords'
                    },
                    theme: {
                        type: 'string',
                        description: 'Theme to filter by (e.g., "Biogeochemistry", "Hydrology")'
                    },
                    scienceTeam: {
                        type: 'string',
                        description: 'Science team to filter by'
                    },
                    release: {
                        type: 'string',
                        description: 'Release tag to filter by'
                    }
                }
            }
        }
    ];
}
export async function handleProductTool(name, args, client) {
    try {
        switch (name) {
            case 'neon_list_products': {
                const schema = z.object({
                    release: z.string().optional()
                });
                const { release } = validateInput(schema, args);
                const products = await client.getProducts(release);
                let result = `# NEON Data Products (${products.length} products)\n\n`;
                products.forEach(product => {
                    result += `**${product.productCode}**: ${product.productName}\n`;
                    result += `  - **Team**: ${product.productScienceTeam}\n`;
                    result += `  - **Sites**: ${product.siteCodes.length}\n`;
                    result += `  - **Themes**: ${product.themes.join(', ')}\n\n`;
                });
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            case 'neon_get_product': {
                const schema = z.object({
                    productCode: z.string().regex(/^DP\d\.\d{5}\.\d{3}$/, 'Invalid product code format'),
                    release: z.string().optional()
                });
                const { productCode, release } = validateInput(schema, args);
                const product = await client.getProduct(productCode, release);
                const result = formatProduct(product);
                // Add site availability summary
                let siteInfo = '\n\n## Site Availability\n\n';
                product.siteCodes.forEach(site => {
                    const monthsCount = site.availableMonths.length;
                    siteInfo += `- **${site.siteCode}**: ${monthsCount} months available\n`;
                });
                return {
                    content: [{ type: 'text', text: result + siteInfo }]
                };
            }
            case 'neon_search_products': {
                const schema = z.object({
                    keyword: z.string().optional(),
                    theme: z.string().optional(),
                    scienceTeam: z.string().optional(),
                    release: z.string().optional()
                });
                const { keyword, theme, scienceTeam, release } = validateInput(schema, args);
                const products = await client.getProducts(release);
                // Filter products based on search criteria
                let filteredProducts = products;
                if (keyword) {
                    const searchTerm = keyword.toLowerCase();
                    filteredProducts = filteredProducts.filter(product => product.productName.toLowerCase().includes(searchTerm) ||
                        product.productDescription.toLowerCase().includes(searchTerm) ||
                        product.keywords.some(k => k.toLowerCase().includes(searchTerm)));
                }
                if (theme) {
                    filteredProducts = filteredProducts.filter(product => product.themes.some(t => t.toLowerCase().includes(theme.toLowerCase())));
                }
                if (scienceTeam) {
                    filteredProducts = filteredProducts.filter(product => product.productScienceTeam.toLowerCase().includes(scienceTeam.toLowerCase()));
                }
                let result = `# Product Search Results (${filteredProducts.length} matches)\n\n`;
                if (filteredProducts.length === 0) {
                    result += 'No products found matching your criteria.\n\n';
                    result += '**Suggestions:**\n';
                    result += '- Try broader search terms\n';
                    result += '- Check spelling\n';
                    result += '- Use neon_list_products to see all available products\n';
                }
                else {
                    filteredProducts.forEach(product => {
                        result += formatProduct(product) + '\n\n---\n\n';
                    });
                }
                return {
                    content: [{ type: 'text', text: result }]
                };
            }
            default:
                throw new Error(`Unknown product tool: ${name}`);
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
