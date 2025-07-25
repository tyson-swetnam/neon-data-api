import { z } from 'zod';
export declare const ProductCodeSchema: z.ZodString;
export declare const SiteCodeSchema: z.ZodString;
export declare const YearMonthSchema: z.ZodString;
export declare const DataQuerySchema: z.ZodEffects<z.ZodObject<{
    productCode: z.ZodString;
    siteCode: z.ZodOptional<z.ZodString>;
    siteCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    startDateMonth: z.ZodString;
    endDateMonth: z.ZodString;
    package: z.ZodOptional<z.ZodEnum<["basic", "expanded"]>>;
    release: z.ZodOptional<z.ZodString>;
    includeProvisional: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    productCode: string;
    startDateMonth: string;
    endDateMonth: string;
    siteCode?: string | undefined;
    siteCodes?: string[] | undefined;
    package?: "basic" | "expanded" | undefined;
    release?: string | undefined;
    includeProvisional?: boolean | undefined;
}, {
    productCode: string;
    startDateMonth: string;
    endDateMonth: string;
    siteCode?: string | undefined;
    siteCodes?: string[] | undefined;
    package?: "basic" | "expanded" | undefined;
    release?: string | undefined;
    includeProvisional?: boolean | undefined;
}>, {
    productCode: string;
    startDateMonth: string;
    endDateMonth: string;
    siteCode?: string | undefined;
    siteCodes?: string[] | undefined;
    package?: "basic" | "expanded" | undefined;
    release?: string | undefined;
    includeProvisional?: boolean | undefined;
}, {
    productCode: string;
    startDateMonth: string;
    endDateMonth: string;
    siteCode?: string | undefined;
    siteCodes?: string[] | undefined;
    package?: "basic" | "expanded" | undefined;
    release?: string | undefined;
    includeProvisional?: boolean | undefined;
}>;
export declare const LocationNameSchema: z.ZodString;
export declare const TaxonomySearchSchema: z.ZodObject<{
    taxonTypeCode: z.ZodOptional<z.ZodString>;
    scientificName: z.ZodOptional<z.ZodString>;
    family: z.ZodOptional<z.ZodString>;
    genus: z.ZodOptional<z.ZodString>;
    kingdom: z.ZodOptional<z.ZodString>;
    phylum: z.ZodOptional<z.ZodString>;
    class: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    verbose: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    taxonTypeCode?: string | undefined;
    scientificName?: string | undefined;
    family?: string | undefined;
    genus?: string | undefined;
    kingdom?: string | undefined;
    phylum?: string | undefined;
    class?: string | undefined;
    order?: string | undefined;
    verbose?: boolean | undefined;
}, {
    taxonTypeCode?: string | undefined;
    scientificName?: string | undefined;
    family?: string | undefined;
    genus?: string | undefined;
    kingdom?: string | undefined;
    phylum?: string | undefined;
    class?: string | undefined;
    order?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    verbose?: boolean | undefined;
}>;
export declare const SampleTrackingSchema: z.ZodEffects<z.ZodObject<{
    sampleTag: z.ZodOptional<z.ZodString>;
    sampleClass: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodString>;
    sampleUuid: z.ZodOptional<z.ZodString>;
    archiveGuid: z.ZodOptional<z.ZodString>;
    degree: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sampleTag?: string | undefined;
    sampleClass?: string | undefined;
    barcode?: string | undefined;
    sampleUuid?: string | undefined;
    archiveGuid?: string | undefined;
    degree?: number | undefined;
}, {
    sampleTag?: string | undefined;
    sampleClass?: string | undefined;
    barcode?: string | undefined;
    sampleUuid?: string | undefined;
    archiveGuid?: string | undefined;
    degree?: number | undefined;
}>, {
    sampleTag?: string | undefined;
    sampleClass?: string | undefined;
    barcode?: string | undefined;
    sampleUuid?: string | undefined;
    archiveGuid?: string | undefined;
    degree?: number | undefined;
}, {
    sampleTag?: string | undefined;
    sampleClass?: string | undefined;
    barcode?: string | undefined;
    sampleUuid?: string | undefined;
    archiveGuid?: string | undefined;
    degree?: number | undefined;
}>;
export declare const ReleaseTagSchema: z.ZodString;
export declare const DownloadSchema: z.ZodObject<{
    productCode: z.ZodString;
    siteCode: z.ZodString;
    yearMonth: z.ZodString;
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productCode: string;
    siteCode: string;
    yearMonth: string;
    filename: string;
}, {
    productCode: string;
    siteCode: string;
    yearMonth: string;
    filename: string;
}>;
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T;
export declare function validateDateRange(startDate: string, endDate: string): void;
export declare function isValidProductCode(code: string): boolean;
export declare function isValidSiteCode(code: string): boolean;
