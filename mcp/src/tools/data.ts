import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { NeonApiClient } from '../api/client.js';
import { formatDataQueryResult, createDataSummary, formatDownloadInfo } from '../utils/formatters.js';
import { validateInput, ValidationError, validateDateRange } from '../utils/validators.js';
import { z } from 'zod';

export function createDataTools(client: NeonApiClient): Tool[] {
  return [
    {
      name: 'neon_query_data',
      description: 'Query for available NEON data files with flexible filtering options',
      inputSchema: {
        type: 'object',
        properties: {
          productCode: {
            type: 'string',
            description: 'NEON product code (e.g., "DP1.10003.001")',
            pattern: '^DP\\d\\.\\d{5}\\.\\d{3}$'
          },
          siteCode: {
            type: 'string',
            description: 'Single site code (4 letters, e.g., "HARV")',
            pattern: '^[A-Z]{4}$'
          },
          siteCodes: {
            type: 'array',
            items: {
              type: 'string',
              pattern: '^[A-Z]{4}$'
            },
            description: 'Multiple site codes (alternative to siteCode)'
          },
          startDateMonth: {
            type: 'string',
            description: 'Start date in YYYY-MM format',
            pattern: '^\\d{4}-\\d{2}$'
          },
          endDateMonth: {
            type: 'string',
            description: 'End date in YYYY-MM format',
            pattern: '^\\d{4}-\\d{2}$'
          },
          package: {
            type: 'string',
            enum: ['basic', 'expanded'],
            description: 'Data package type (basic or expanded)'
          },
          release: {
            type: 'string',
            description: 'Specific release tag (e.g., "RELEASE-2024")'
          },
          includeProvisional: {
            type: 'boolean',
            description: 'Include provisional data (default: false)'
          }
        },
        required: ['productCode', 'startDateMonth', 'endDateMonth'],
        anyOf: [
          { required: ['siteCode'] },
          { required: ['siteCodes'] }
        ]
      }
    },
    {
      name: 'neon_get_download_url',
      description: 'Get download URL and metadata for a specific data file',
      inputSchema: {
        type: 'object',
        properties: {
          productCode: {
            type: 'string',
            description: 'NEON product code (e.g., "DP1.10003.001")',
            pattern: '^DP\\d\\.\\d{5}\\.\\d{3}$'
          },
          siteCode: {
            type: 'string',
            description: 'Site code (4 letters, e.g., "HARV")',
            pattern: '^[A-Z]{4}$'
          },
          yearMonth: {
            type: 'string',
            description: 'Year-month in YYYY-MM format',
            pattern: '^\\d{4}-\\d{2}$'
          },
          filename: {
            type: 'string',
            description: 'Name of the file to download'
          }
        },
        required: ['productCode', 'siteCode', 'yearMonth', 'filename']
      }
    },
    {
      name: 'neon_summarize_data_availability',
      description: 'Get a summary of data availability for a product across sites and time',
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
            description: 'Optional release tag to filter by'
          }
        },
        required: ['productCode']
      }
    }
  ];
}

export async function handleDataTool(
  name: string, 
  args: any, 
  client: NeonApiClient
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    switch (name) {
      case 'neon_query_data': {
        const schema = z.object({
          productCode: z.string().regex(/^DP\d\.\d{5}\.\d{3}$/),
          siteCode: z.string().length(4).regex(/^[A-Z]{4}$/).optional(),
          siteCodes: z.array(z.string().length(4).regex(/^[A-Z]{4}$/)).optional(),
          startDateMonth: z.string().regex(/^\d{4}-\d{2}$/),
          endDateMonth: z.string().regex(/^\d{4}-\d{2}$/),
          package: z.enum(['basic', 'expanded']).optional(),
          release: z.string().optional(),
          includeProvisional: z.boolean().optional()
        }).refine(
          (data) => data.siteCode || (data.siteCodes && data.siteCodes.length > 0),
          { message: 'Either siteCode or siteCodes must be provided' }
        );
        
        const validated = validateInput(schema, args);
        
        // Validate date range
        validateDateRange(validated.startDateMonth, validated.endDateMonth);
        
        // Prepare query parameters
        const queryParams = {
          productCode: validated.productCode,
          startDateMonth: validated.startDateMonth,
          endDateMonth: validated.endDateMonth,
          package: validated.package,
          release: validated.release,
          includeProvisional: validated.includeProvisional
        };
        
        // Add site information
        if (validated.siteCode) {
          Object.assign(queryParams, { siteCode: validated.siteCode });
        } else if (validated.siteCodes) {
          Object.assign(queryParams, { siteCodes: validated.siteCodes });
        }
        
        const result = await client.queryData(queryParams);
        
        let output = formatDataQueryResult(result);
        output += '\n\n' + createDataSummary(result);
        
        return {
          content: [{ type: 'text', text: output }]
        };
      }

      case 'neon_get_download_url': {
        const schema = z.object({
          productCode: z.string().regex(/^DP\d\.\d{5}\.\d{3}$/),
          siteCode: z.string().length(4).regex(/^[A-Z]{4}$/),
          yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
          filename: z.string().min(1)
        });
        
        const { productCode, siteCode, yearMonth, filename } = validateInput(schema, args);
        
        const downloadInfo = await client.getDownloadUrl(productCode, siteCode, yearMonth, filename);
        const result = formatDownloadInfo(downloadInfo.url, downloadInfo.size, downloadInfo.checksum);
        
        return {
          content: [{ type: 'text', text: result }]
        };
      }

      case 'neon_summarize_data_availability': {
        const schema = z.object({
          productCode: z.string().regex(/^DP\d\.\d{5}\.\d{3}$/),
          release: z.string().optional()
        });
        
        const { productCode, release } = validateInput(schema, args);
        
        // Get product details to see which sites have this product
        const product = await client.getProduct(productCode, release);
        
        let result = `# Data Availability Summary for ${product.productName}\n\n`;
        result += `**Product Code**: ${productCode}\n`;
        result += `**Science Team**: ${product.productScienceTeam}\n`;
        result += `**Total Sites**: ${product.siteCodes.length}\n\n`;
        
        // Calculate summary statistics
        let totalMonths = 0;
        let earliestDate = '';
        let latestDate = '';
        const allDates: string[] = [];
        
        product.siteCodes.forEach(site => {
          totalMonths += site.availableMonths.length;
          allDates.push(...site.availableMonths);
        });
        
        if (allDates.length > 0) {
          const sortedDates = allDates.sort();
          earliestDate = sortedDates[0];
          latestDate = sortedDates[sortedDates.length - 1];
        }
        
        result += `## Overall Statistics\n\n`;
        result += `- **Total Data Months**: ${totalMonths}\n`;
        result += `- **Date Range**: ${earliestDate} to ${latestDate}\n`;
        result += `- **Average Months per Site**: ${(totalMonths / product.siteCodes.length).toFixed(1)}\n\n`;
        
        // Site-by-site breakdown
        result += `## Site-by-Site Availability\n\n`;
        
        // Sort sites by number of available months (descending)
        const sortedSites = product.siteCodes
          .slice()
          .sort((a, b) => b.availableMonths.length - a.availableMonths.length);
        
        sortedSites.forEach(site => {
          const monthCount = site.availableMonths.length;
          const dateRange = getDateRange(site.availableMonths);
          
          result += `- **${site.siteCode}**: ${monthCount} months (${dateRange})\n`;
        });
        
        // Data availability by year
        const monthsByYear = allDates.reduce((acc, month) => {
          const year = month.substring(0, 4);
          if (!acc[year]) {
            acc[year] = 0;
          }
          acc[year]++;
          return acc;
        }, {} as Record<string, number>);
        
        if (Object.keys(monthsByYear).length > 1) {
          result += `\n## Data Availability by Year\n\n`;
          Object.keys(monthsByYear).sort().forEach(year => {
            const count = monthsByYear[year];
            const avgPerSite = (count / product.siteCodes.length).toFixed(1);
            result += `- **${year}**: ${count} site-months (avg ${avgPerSite} per site)\n`;
          });
        }
        
        return {
          content: [{ type: 'text', text: result }]
        };
      }

      default:
        throw new Error(`Unknown data tool: ${name}`);
    }
  } catch (error) {
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

// Helper function to get date range from available months
function getDateRange(months: string[]): string {
  if (months.length === 0) return 'No data available';
  
  const sortedMonths = months.sort();
  const first = sortedMonths[0];
  const last = sortedMonths[sortedMonths.length - 1];
  
  return first === last ? first : `${first} to ${last}`;
}