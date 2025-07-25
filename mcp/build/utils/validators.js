import { z } from 'zod';
// Product validation schemas
export const ProductCodeSchema = z.string().regex(/^DP\d\.\d{5}\.\d{3}$/, 'Invalid product code format');
// Site validation schemas
export const SiteCodeSchema = z.string().length(4, 'Site code must be 4 characters');
// Date validation schemas
export const YearMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format');
// Data query validation schema
export const DataQuerySchema = z.object({
    productCode: ProductCodeSchema,
    siteCode: SiteCodeSchema.optional(),
    siteCodes: z.array(SiteCodeSchema).optional(),
    startDateMonth: YearMonthSchema,
    endDateMonth: YearMonthSchema,
    package: z.enum(['basic', 'expanded']).optional(),
    release: z.string().optional(),
    includeProvisional: z.boolean().optional()
}).refine((data) => data.siteCode || (data.siteCodes && data.siteCodes.length > 0), { message: 'Either siteCode or siteCodes must be provided' });
// Location validation schemas
export const LocationNameSchema = z.string().min(1, 'Location name is required');
// Taxonomy validation schemas
export const TaxonomySearchSchema = z.object({
    taxonTypeCode: z.string().optional(),
    scientificName: z.string().optional(),
    family: z.string().optional(),
    genus: z.string().optional(),
    kingdom: z.string().optional(),
    phylum: z.string().optional(),
    class: z.string().optional(),
    order: z.string().optional(),
    limit: z.number().int().min(1).max(1000).default(100),
    offset: z.number().int().min(0).default(0),
    verbose: z.boolean().optional()
});
// Sample tracking validation schemas
export const SampleTrackingSchema = z.object({
    sampleTag: z.string().optional(),
    sampleClass: z.string().optional(),
    barcode: z.string().optional(),
    sampleUuid: z.string().uuid().optional(),
    archiveGuid: z.string().optional(),
    degree: z.number().int().min(0).max(5).optional()
}).refine((data) => {
    // Either (sampleTag AND sampleClass) OR one of the other identifiers
    const hasSampleTagClass = data.sampleTag && data.sampleClass;
    const hasOtherIdentifier = data.barcode || data.sampleUuid || data.archiveGuid;
    return hasSampleTagClass || hasOtherIdentifier;
}, { message: 'Must provide either (sampleTag AND sampleClass) OR one of: barcode, sampleUuid, archiveGuid' });
// Release validation schemas
export const ReleaseTagSchema = z.string().min(1, 'Release tag is required');
// Download validation schemas
export const DownloadSchema = z.object({
    productCode: ProductCodeSchema,
    siteCode: SiteCodeSchema,
    yearMonth: YearMonthSchema,
    filename: z.string().min(1, 'Filename is required')
});
// Utility functions for validation
export class ValidationError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
export function validateInput(schema, input) {
    try {
        return schema.parse(input);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new ValidationError(message);
        }
        throw error;
    }
}
// Helper function to validate date ranges
export function validateDateRange(startDate, endDate) {
    const start = new Date(startDate + '-01');
    const end = new Date(endDate + '-01');
    if (start > end) {
        throw new ValidationError('Start date must be before end date');
    }
    const now = new Date();
    const maxEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Next month
    if (end > maxEnd) {
        throw new ValidationError('End date cannot be in the future');
    }
}
// Helper function to validate product code format
export function isValidProductCode(code) {
    return ProductCodeSchema.safeParse(code).success;
}
// Helper function to validate site code format
export function isValidSiteCode(code) {
    return SiteCodeSchema.safeParse(code).success;
}
