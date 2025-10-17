#!/usr/bin/env node

/**
 * Sitemap Generator for Dózsa Apartman Szeged
 *
 * Generates Google-compliant sitemap.xml for static HTML pages.
 * Can be extended to support sitemap_index.xml for large sites.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://dozsa-apartman-szeged.hu',
  webDir: path.join(__dirname, 'web'),
  outputPath: path.join(__dirname, 'web', 'sitemap.xml'),

  // Default values for sitemap entries
  defaults: {
    changefreq: 'weekly',
    priority: '0.5'
  },

  // Custom settings per page
  pages: [
    {
      loc: '/',
      lastmod: null, // Will use file mtime
      changefreq: 'weekly',
      priority: '1.0',
      file: 'index.html'
    },
    {
      loc: '/contact.html',
      lastmod: null,
      changefreq: 'monthly',
      priority: '0.8',
      file: 'contact.html'
    },
    // Uncomment when these pages exist:
    // {
    //   loc: '/privacy.html',
    //   lastmod: null,
    //   changefreq: 'yearly',
    //   priority: '0.3',
    //   file: 'privacy.html'
    // },
    // {
    //   loc: '/terms.html',
    //   lastmod: null,
    //   changefreq: 'yearly',
    //   priority: '0.3',
    //   file: 'terms.html'
    // }
  ],

  // Exclude patterns (for auto-discovery)
  exclude: [
    /^error\//,           // error pages
    /^api\//,             // api templates
    /\/_legacy\//,        // legacy files
    /404\.html$/,
    /500\.html$/,
    /503\.html$/
  ]
};

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to W3C Datetime format (YYYY-MM-DD)
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get file modification time
 */
function getFileLastMod(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return formatDate(stats.mtime);
  } catch (err) {
    console.warn(`Warning: Could not read file stats for ${filePath}`);
    return formatDate(new Date());
  }
}

/**
 * Check if file should be excluded
 */
function shouldExclude(relativePath) {
  return CONFIG.exclude.some(pattern => pattern.test(relativePath));
}

/**
 * Auto-discover HTML files in web directory
 */
function discoverPages(dir, baseDir = dir) {
  const discovered = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      discovered.push(...discoverPages(fullPath, baseDir));
    } else if (file.endsWith('.html')) {
      const relativePath = path.relative(baseDir, fullPath);

      if (!shouldExclude(relativePath)) {
        discovered.push({
          file: relativePath,
          fullPath: fullPath
        });
      }
    }
  }

  return discovered;
}

/**
 * Generate sitemap URL entry
 */
function generateUrlEntry(page, filePath) {
  const lastmod = page.lastmod || getFileLastMod(filePath);
  const changefreq = page.changefreq || CONFIG.defaults.changefreq;
  const priority = page.priority || CONFIG.defaults.priority;
  const loc = CONFIG.baseUrl + page.loc;

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate complete sitemap XML
 */
function generateSitemap(pages) {
  const urlEntries = pages.map(page => {
    const filePath = path.join(CONFIG.webDir, page.file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File ${page.file} not found, skipping...`);
      return null;
    }

    return generateUrlEntry(page, filePath);
  }).filter(Boolean); // Remove null entries

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  return xml;
}

/**
 * Main execution
 */
function main() {
  console.log('🗺️  Generating sitemap for Dózsa Apartman Szeged...\n');

  // Check if web directory exists
  if (!fs.existsSync(CONFIG.webDir)) {
    console.error(`Error: Web directory not found: ${CONFIG.webDir}`);
    process.exit(1);
  }

  // Generate sitemap
  console.log('📄 Processing pages:');
  CONFIG.pages.forEach(page => {
    const filePath = path.join(CONFIG.webDir, page.file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✓' : '✗';
    console.log(`  ${status} ${page.loc} (${page.file})`);
  });

  const sitemap = generateSitemap(CONFIG.pages);

  // Write sitemap to file
  fs.writeFileSync(CONFIG.outputPath, sitemap, 'utf8');

  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${CONFIG.outputPath}`);
  console.log(`🔗 URL: ${CONFIG.baseUrl}/sitemap.xml`);

  // Display statistics
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`\n📊 Statistics:`);
  console.log(`  - Total URLs: ${urlCount}`);
  console.log(`  - File size: ${(sitemap.length / 1024).toFixed(2)} KB`);

  // Validation notes
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Upload sitemap.xml to your web root`);
  console.log(`  2. Submit to Google Search Console: https://search.google.com/search-console`);
  console.log(`  3. Add to robots.txt: Sitemap: ${CONFIG.baseUrl}/sitemap.xml`);
  console.log(`  4. Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, CONFIG };
