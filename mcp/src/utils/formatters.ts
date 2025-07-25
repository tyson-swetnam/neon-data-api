import { 
  Product, 
  Site, 
  DataQueryResult, 
  Location, 
  TaxonomyEntry, 
  Sample, 
  Release 
} from '../api/types.js';

// Format product data for display
export function formatProduct(product: Product): string {
  const sitesCount = product.siteCodes.length;
  const themes = product.themes.join(', ');
  const keywords = product.keywords.slice(0, 5).join(', ');
  
  return `**${product.productCode}**: ${product.productName}
  
**Description**: ${product.productDescription}

**Science Team**: ${product.productScienceTeam}
**Available at**: ${sitesCount} sites
**Themes**: ${themes}
**Keywords**: ${keywords}
**Has Expanded Package**: ${product.productHasExpanded ? 'Yes' : 'No'}`;
}

// Format site data for display
export function formatSite(site: Site): string {
  const productsCount = site.dataProducts.length;
  
  return `**${site.siteCode}**: ${site.siteName}

**Description**: ${site.siteDescription}
**Type**: ${site.siteType}
**Location**: ${site.stateName} (${site.stateCode})
**Domain**: ${site.domainName} (${site.domainCode})
**Coordinates**: ${site.siteLatitude.toFixed(6)}, ${site.siteLongitude.toFixed(6)}
**Available Products**: ${productsCount}`;
}

// Format data query results for display
export function formatDataQueryResult(result: DataQueryResult): string {
  let output = '# Data Query Results\n\n';
  
  result.siteCodes.forEach(siteData => {
    output += `## Site: ${siteData.siteCode}\n\n`;
    
    siteData.availableMonths.forEach(monthData => {
      output += `### ${monthData.month}\n\n`;
      
      monthData.availableDataUrls.forEach(release => {
        output += `**Release**: ${release.release}\n\n`;
        
        release.packages.forEach(pkg => {
          output += `**Package**: ${pkg.package} (${pkg.files.length} files)\n`;
          
          // Show first few files as examples
          const filesToShow = pkg.files.slice(0, 3);
          filesToShow.forEach(file => {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            output += `  - ${file.name} (${sizeMB} MB)\n`;
          });
          
          if (pkg.files.length > 3) {
            output += `  - ... and ${pkg.files.length - 3} more files\n`;
          }
          output += '\n';
        });
      });
    });
  });
  
  return output;
}

// Format location data for display
export function formatLocation(location: Location): string {
  return `**${location.locationName}**: ${location.locationDescription}

**Type**: ${location.locationType}
**Site**: ${location.siteCode}
**Coordinates**: ${location.locationDecimalLatitude.toFixed(6)}, ${location.locationDecimalLongitude.toFixed(6)}
**Elevation**: ${location.locationElevation}m
**UTM**: Zone ${location.locationUtmZone}, E: ${location.locationUtmEasting}, N: ${location.locationUtmNorthing}
${location.locationParent ? `**Parent Location**: ${location.locationParent}` : ''}
${location.locationChildren && location.locationChildren.length > 0 ? 
  `**Child Locations**: ${location.locationChildren.length} locations` : ''}`;
}

// Format taxonomy entries for display
export function formatTaxonomyEntries(entries: TaxonomyEntry[], total: number): string {
  let output = `# Taxonomy Results (${entries.length} of ${total})\n\n`;
  
  entries.forEach(entry => {
    output += `**${entry.scientificName}** (${entry.taxonID})\n`;
    output += `  - **Rank**: ${entry.taxonRank}\n`;
    output += `  - **Type**: ${entry.taxonTypeCode}\n`;
    
    if (entry.vernacularName) {
      output += `  - **Common Name**: ${entry.vernacularName}\n`;
    }
    
    // Build taxonomic hierarchy
    const hierarchy = [
      entry.kingdom && `Kingdom: ${entry.kingdom}`,
      entry.phylum && `Phylum: ${entry.phylum}`,
      entry.class && `Class: ${entry.class}`,
      entry.order && `Order: ${entry.order}`,
      entry.family && `Family: ${entry.family}`,
      entry.genus && `Genus: ${entry.genus}`
    ].filter(Boolean);
    
    if (hierarchy.length > 0) {
      output += `  - **Taxonomy**: ${hierarchy.join(' > ')}\n`;
    }
    
    output += '\n';
  });
  
  return output;
}

// Format sample data for display
export function formatSamples(samples: Sample[]): string {
  let output = `# Sample Tracking Results (${samples.length} samples)\n\n`;
  
  samples.forEach(sample => {
    output += `## Sample: ${sample.sampleTag} (${sample.sampleClass})\n\n`;
    output += `**UUID**: ${sample.sampleUuid}\n`;
    if (sample.barcode) output += `**Barcode**: ${sample.barcode}\n`;
    if (sample.archiveGuid) output += `**Archive GUID**: ${sample.archiveGuid}\n`;
    if (sample.parentSampleUuid) output += `**Parent Sample**: ${sample.parentSampleUuid}\n`;
    if (sample.childSampleUuids && sample.childSampleUuids.length > 0) {
      output += `**Child Samples**: ${sample.childSampleUuids.length} samples\n`;
    }
    
    output += '\n**Events**:\n';
    sample.events.forEach((event, index) => {
      output += `${index + 1}. **${event.eventDate}** - ${event.eventType}\n`;
      output += `   Location: ${event.eventLocation}\n`;
      output += `   Description: ${event.eventDescription}\n`;
      if (event.eventPersonnel.length > 0) {
        output += `   Personnel: ${event.eventPersonnel.join(', ')}\n`;
      }
      output += '\n';
    });
  });
  
  return output;
}

// Format release data for display
export function formatRelease(release: Release): string {
  return `**${release.releaseTag}** (${release.releaseUuid})

**Generation Date**: ${release.releaseGenerationDate}
**Description**: ${release.releaseDescription}
**DOI**: ${release.releaseDOI}
**Products**: ${release.associatedProducts.length}
**Sites**: ${release.associatedSites.length}`;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Format download information
export function formatDownloadInfo(url: string, size: number, checksum: string): string {
  return `**Download URL**: ${url}
**File Size**: ${formatFileSize(size)}
**Checksum**: ${checksum}

Note: Download URLs expire after 1 hour.`;
}

// Create summary statistics
export function createDataSummary(result: DataQueryResult): string {
  let totalFiles = 0;
  let totalSize = 0;
  const months = new Set<string>();
  const releases = new Set<string>();
  
  result.siteCodes.forEach(siteData => {
    siteData.availableMonths.forEach(monthData => {
      months.add(monthData.month);
      monthData.availableDataUrls.forEach(release => {
        releases.add(release.release);
        release.packages.forEach(pkg => {
          totalFiles += pkg.files.length;
          totalSize += pkg.files.reduce((sum, file) => sum + file.size, 0);
        });
      });
    });
  });
  
  return `**Summary**:
- **Sites**: ${result.siteCodes.length}
- **Months**: ${months.size}
- **Releases**: ${releases.size}
- **Total Files**: ${totalFiles}
- **Total Size**: ${formatFileSize(totalSize)}`;
}