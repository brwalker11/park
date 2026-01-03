const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const XLSX = require('xlsx');

const ROOT_DIR = path.join(__dirname, '..');
const DOMAIN = 'https://monetize-parking.com';

// Find all HTML files
function findHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and hidden directories
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                findHtmlFiles(fullPath, files);
            }
        } else if (entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Extract metadata from HTML file
function extractMetadata(filePath) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    // Get URL path
    let urlPath = '/' + relativePath.replace(/\\/g, '/');
    if (urlPath.endsWith('/index.html')) {
        urlPath = urlPath.replace('/index.html', '/');
    }

    // Title
    const title = $('title').text().trim() || '';

    // Meta description
    const description = $('meta[name="description"]').attr('content') || '';

    // Meta keywords
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    // OG tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    // Twitter tags
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';

    // JSON-LD Schema
    let schemaName = '';
    let schemaDescription = '';
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json.name && !schemaName) schemaName = json.name;
            if (json.description && !schemaDescription) schemaDescription = json.description;
            // Check for @graph array
            if (json['@graph']) {
                for (const item of json['@graph']) {
                    if (item.name && !schemaName) schemaName = item.name;
                    if (item.description && !schemaDescription) schemaDescription = item.description;
                }
            }
        } catch (e) {
            // Invalid JSON-LD
        }
    });

    // H1 tag
    const h1 = $('h1').first().text().trim() || '';

    // Canonical URL
    const canonical = $('link[rel="canonical"]').attr('href') || '';

    return {
        filePath: relativePath,
        urlPath,
        title,
        titleLength: title.length,
        description,
        descriptionLength: description.length,
        keywords,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        schemaName,
        schemaDescription,
        h1,
        canonical
    };
}

// Identify issues with a page's metadata
function findIssues(meta, allMeta) {
    const issues = [];

    // Missing title or description
    if (!meta.title) issues.push('Missing title');
    if (!meta.description) issues.push('Missing description');

    // Title length issues
    if (meta.title && meta.titleLength < 30) {
        issues.push(`Title too short (${meta.titleLength} chars, min 30)`);
    }
    if (meta.title && meta.titleLength > 60) {
        issues.push(`Title too long (${meta.titleLength} chars, max 60)`);
    }

    // Description length issues
    if (meta.description && meta.descriptionLength < 120) {
        issues.push(`Description too short (${meta.descriptionLength} chars, min 120)`);
    }
    if (meta.description && meta.descriptionLength > 160) {
        issues.push(`Description too long (${meta.descriptionLength} chars, max 160)`);
    }

    // Mismatched titles
    if (meta.title && meta.ogTitle && meta.title !== meta.ogTitle) {
        issues.push('Title vs og:title mismatch');
    }
    if (meta.title && meta.twitterTitle && meta.title !== meta.twitterTitle) {
        issues.push('Title vs twitter:title mismatch');
    }

    // Mismatched descriptions
    if (meta.description && meta.ogDescription && meta.description !== meta.ogDescription) {
        issues.push('Description vs og:description mismatch');
    }
    if (meta.description && meta.twitterDescription && meta.description !== meta.twitterDescription) {
        issues.push('Description vs twitter:description mismatch');
    }

    // Missing OG image
    if (!meta.ogImage) {
        issues.push('Missing og:image');
    }

    // Missing H1 or H1 doesn't match title
    if (!meta.h1) {
        issues.push('Missing H1');
    } else if (meta.title) {
        // Check if H1 roughly matches title (allow for brand suffix)
        const titleBase = meta.title.split('|')[0].split('-')[0].trim().toLowerCase();
        const h1Lower = meta.h1.toLowerCase();
        if (!h1Lower.includes(titleBase.substring(0, 20)) && !titleBase.includes(h1Lower.substring(0, 20))) {
            issues.push('H1 doesn\'t match title');
        }
    }

    // Missing canonical
    if (!meta.canonical) {
        issues.push('Missing canonical URL');
    }

    return issues;
}

// Find duplicate titles and descriptions
function findDuplicates(allMeta) {
    const titleMap = {};
    const descMap = {};
    const duplicateIssues = [];

    for (const meta of allMeta) {
        if (meta.title) {
            if (!titleMap[meta.title]) titleMap[meta.title] = [];
            titleMap[meta.title].push(meta.urlPath);
        }
        if (meta.description) {
            if (!descMap[meta.description]) descMap[meta.description] = [];
            descMap[meta.description].push(meta.urlPath);
        }
    }

    // Mark duplicates
    for (const meta of allMeta) {
        if (meta.title && titleMap[meta.title].length > 1) {
            duplicateIssues.push({
                urlPath: meta.urlPath,
                issue: `Duplicate title (shared with ${titleMap[meta.title].filter(p => p !== meta.urlPath).join(', ')})`
            });
        }
        if (meta.description && descMap[meta.description].length > 1) {
            duplicateIssues.push({
                urlPath: meta.urlPath,
                issue: `Duplicate description (shared with ${descMap[meta.description].filter(p => p !== meta.urlPath).join(', ')})`
            });
        }
    }

    return duplicateIssues;
}

// Main execution
console.log('Finding HTML files...');
const htmlFiles = findHtmlFiles(ROOT_DIR);
console.log(`Found ${htmlFiles.length} HTML files`);

// Skip article body fragments (they don't have full HTML structure)
const fullPages = htmlFiles.filter(f => {
    const rel = path.relative(ROOT_DIR, f);
    // Skip article body fragments (not in subdirectories)
    if (rel.startsWith('articles/') && !rel.includes('/index.html') && !rel.includes('/index.backup.html')) {
        // Check if it's a body fragment (no <html> tag)
        const content = fs.readFileSync(f, 'utf-8');
        if (!content.toLowerCase().includes('<html')) {
            return false;
        }
    }
    // Skip backup files
    if (rel.includes('.backup.')) return false;
    return true;
});

console.log(`Analyzing ${fullPages.length} full HTML pages (excluding body fragments and backups)...`);

// Extract metadata from all pages
const allMeta = fullPages.map(f => extractMetadata(f));

// Sort by URL path
allMeta.sort((a, b) => a.urlPath.localeCompare(b.urlPath));

// Find issues for each page
const duplicateIssues = findDuplicates(allMeta);
const allIssues = [];

for (const meta of allMeta) {
    const issues = findIssues(meta, allMeta);

    // Add duplicate issues
    const dupes = duplicateIssues.filter(d => d.urlPath === meta.urlPath);
    for (const dupe of dupes) {
        issues.push(dupe.issue);
    }

    if (issues.length > 0) {
        allIssues.push({
            urlPath: meta.urlPath,
            filePath: meta.filePath,
            issues: issues.join('; '),
            issueCount: issues.length
        });
    }
}

// Create workbook
const wb = XLSX.utils.book_new();

// Tab 1: Full Audit
const fullAuditData = allMeta.map(m => ({
    'URL Path': m.urlPath,
    'File Path': m.filePath,
    'Title': m.title,
    'Title Length': m.titleLength,
    'Meta Description': m.description,
    'Description Length': m.descriptionLength,
    'Meta Keywords': m.keywords,
    'og:title': m.ogTitle,
    'og:description': m.ogDescription,
    'og:image': m.ogImage,
    'twitter:title': m.twitterTitle,
    'twitter:description': m.twitterDescription,
    'Schema Name': m.schemaName,
    'Schema Description': m.schemaDescription,
    'H1': m.h1,
    'Canonical URL': m.canonical
}));

const ws1 = XLSX.utils.json_to_sheet(fullAuditData);

// Set column widths
ws1['!cols'] = [
    { wch: 45 },  // URL Path
    { wch: 55 },  // File Path
    { wch: 60 },  // Title
    { wch: 12 },  // Title Length
    { wch: 80 },  // Meta Description
    { wch: 15 },  // Description Length
    { wch: 40 },  // Keywords
    { wch: 60 },  // og:title
    { wch: 80 },  // og:description
    { wch: 50 },  // og:image
    { wch: 60 },  // twitter:title
    { wch: 80 },  // twitter:description
    { wch: 50 },  // Schema Name
    { wch: 80 },  // Schema Description
    { wch: 60 },  // H1
    { wch: 50 },  // Canonical
];

XLSX.utils.book_append_sheet(wb, ws1, 'Full Audit');

// Tab 2: Issues Found
const issuesData = allIssues.map(i => ({
    'URL Path': i.urlPath,
    'File Path': i.filePath,
    'Issues': i.issues,
    'Issue Count': i.issueCount
}));

const ws2 = XLSX.utils.json_to_sheet(issuesData);
ws2['!cols'] = [
    { wch: 45 },
    { wch: 55 },
    { wch: 100 },
    { wch: 12 }
];
XLSX.utils.book_append_sheet(wb, ws2, 'Issues Found');

// Tab 3: Summary
// Count issue types
const issueCounts = {};
for (const item of allIssues) {
    const issues = item.issues.split('; ');
    for (const issue of issues) {
        // Normalize issue name for counting
        let issueType = issue;
        if (issue.includes('too short')) issueType = issue.includes('Title') ? 'Title too short' : 'Description too short';
        if (issue.includes('too long')) issueType = issue.includes('Title') ? 'Title too long' : 'Description too long';
        if (issue.includes('Duplicate title')) issueType = 'Duplicate title';
        if (issue.includes('Duplicate description')) issueType = 'Duplicate description';

        issueCounts[issueType] = (issueCounts[issueType] || 0) + 1;
    }
}

const pagesWithIssues = allIssues.length;
const pagesWithoutIssues = allMeta.length - pagesWithIssues;

const summaryData = [
    { 'Metric': 'Total Pages Audited', 'Value': allMeta.length },
    { 'Metric': 'Pages with 0 Issues', 'Value': pagesWithoutIssues },
    { 'Metric': 'Pages Needing Attention', 'Value': pagesWithIssues },
    { 'Metric': '', 'Value': '' },
    { 'Metric': '--- Issue Type Counts ---', 'Value': '' },
];

for (const [issue, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    summaryData.push({ 'Metric': issue, 'Value': count });
}

const ws3 = XLSX.utils.json_to_sheet(summaryData);
ws3['!cols'] = [
    { wch: 40 },
    { wch: 15 }
];
XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

// Write the file
const outputPath = path.join(ROOT_DIR, 'metadata-audit.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`\nAudit complete!`);
console.log(`Output: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`  Total pages: ${allMeta.length}`);
console.log(`  Pages with issues: ${pagesWithIssues}`);
console.log(`  Pages OK: ${pagesWithoutIssues}`);
console.log(`\nIssue breakdown:`);
for (const [issue, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${issue}: ${count}`);
}
