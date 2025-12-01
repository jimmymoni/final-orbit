#!/usr/bin/env node

/**
 * Shopify App Store Scraper (Backend)
 *
 * Scrapes app data from apps.shopify.com including:
 * - App details (name, developer, description)
 * - Ratings and reviews
 * - Pricing information
 * - Features list
 * - Competitor discovery
 *
 * Usage:
 *   node scripts/shopifyAppStoreScraper.js search "subscription"
 *   node scripts/shopifyAppStoreScraper.js app "recharge-subscriptions"
 */

// Node v18+ has native fetch
import * as cheerio from 'cheerio';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const CACHE_DIR = join(process.cwd(), '.cache');
const CACHE_FILE = join(CACHE_DIR, 'shopify-apps-cache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Cache management
 */
class Cache {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (existsSync(CACHE_FILE)) {
        const content = readFileSync(CACHE_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading cache:', error.message);
    }
    return {};
  }

  save() {
    try {
      writeFileSync(CACHE_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error.message);
    }
  }

  get(key) {
    const entry = this.data[key];
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL) {
      delete this.data[key];
      this.save();
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    this.data[key] = {
      timestamp: Date.now(),
      value
    };
    this.save();
  }
}

const cache = new Cache();

/**
 * Fetch HTML from Shopify App Store
 */
async function fetchPage(url) {
  const cacheKey = `page:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`✓ Using cached data for ${url}`);
    return cached;
  }

  console.log(`→ Fetching ${url}...`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    cache.set(cacheKey, html);

    return html;
  } catch (error) {
    console.error(`✗ Error fetching ${url}:`, error.message);
    throw error;
  }
}

/**
 * Parse JSON-LD structured data from app page
 */
function parseJsonLd(html) {
  const $ = cheerio.load(html);
  const jsonLdScript = $('script[type="application/ld+json"]').html();

  if (!jsonLdScript) return null;

  try {
    return JSON.parse(jsonLdScript);
  } catch (error) {
    console.error('Error parsing JSON-LD:', error.message);
    return null;
  }
}

/**
 * Scrape app detail page
 */
export async function scrapeAppDetails(appSlug) {
  const url = `https://apps.shopify.com/${appSlug}`;

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // Parse JSON-LD structured data (most reliable)
    const jsonLd = parseJsonLd(html);

    // Extract data from page
    const app = {
      slug: appSlug,
      url,
      name: null,
      developer: null,
      rating: null,
      reviewCount: null,
      pricing: null,
      features: [],
      description: null,
      categories: [],
      launchDate: null,
    };

    // Try to get data from JSON-LD first
    if (jsonLd) {
      app.name = jsonLd.name || app.name;

      if (jsonLd.aggregateRating) {
        app.rating = parseFloat(jsonLd.aggregateRating.ratingValue);
        app.reviewCount = parseInt(jsonLd.aggregateRating.ratingCount);
      }

      if (jsonLd.author) {
        app.developer = jsonLd.author.name || jsonLd.author;
      }
    }

    // Fallback to HTML parsing if JSON-LD doesn't have everything

    // App name
    if (!app.name) {
      app.name = $('h1').first().text().trim() ||
                 $('[data-app-name]').first().text().trim();
    }

    // Developer name
    if (!app.developer) {
      app.developer = $('[class*="developer"], [class*="author"]').first().text().trim() ||
                      $('a[href*="/partners/"]').first().text().trim();
    }

    // Rating and reviews (look for common patterns)
    if (!app.rating) {
      const ratingText = $('[class*="rating"]').first().text();
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        app.rating = parseFloat(ratingMatch[1]);
      }
    }

    if (!app.reviewCount) {
      const reviewText = $('[class*="review"]').text();
      const reviewMatch = reviewText.match(/(\d+(?:,\d+)*)/);
      if (reviewMatch) {
        app.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }
    }

    // Pricing
    const pricingSection = $('[class*="pricing"], [class*="price"]').text();
    if (pricingSection) {
      // Look for pricing patterns like "$99/month" or "From $99"
      const priceMatch = pricingSection.match(/(?:From\s+)?\$\d+(?:\.\d{2})?(?:\/mo|\/month)?/i);
      if (priceMatch) {
        app.pricing = priceMatch[0];
      } else if (pricingSection.toLowerCase().includes('free')) {
        app.pricing = 'Free plan available';
      }
    }

    // Features
    $('ul li, [class*="feature"]').each((i, elem) => {
      const feature = $(elem).text().trim();
      if (feature && feature.length > 5 && feature.length < 150) {
        app.features.push(feature);
      }
    });

    // Limit features to top 10
    app.features = [...new Set(app.features)].slice(0, 10);

    // Description
    app.description = $('[class*="description"]').first().text().trim() ||
                     $('p').first().text().trim();
    if (app.description.length > 500) {
      app.description = app.description.substring(0, 500) + '...';
    }

    // Categories
    $('[class*="category"], [class*="tag"]').each((i, elem) => {
      const category = $(elem).text().trim();
      if (category && !app.categories.includes(category)) {
        app.categories.push(category);
      }
    });

    console.log(`✓ Scraped app: ${app.name || appSlug}`);

    return app;
  } catch (error) {
    console.error(`✗ Error scraping app ${appSlug}:`, error.message);
    return null;
  }
}

/**
 * Search for apps by keyword
 */
export async function searchApps(query, options = {}) {
  const { limit = 20 } = options;
  const url = `https://apps.shopify.com/search?q=${encodeURIComponent(query)}`;

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const apps = [];

    // Look for app cards/listings on the search page
    // The exact selectors may vary, so we try multiple patterns
    const selectors = [
      '[data-app-card]',
      '[class*="app-card"]',
      '[class*="search-result"]',
      'article',
      '[class*="grid"] > div'
    ];

    let foundApps = false;

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} apps using selector: ${selector}`);

        elements.each((i, elem) => {
          if (apps.length >= limit) return false;

          const $elem = $(elem);

          // Extract app slug from link
          const link = $elem.find('a[href^="/"]').first().attr('href');
          if (!link || !link.includes('/')) return;

          const slug = link.split('/').filter(Boolean)[0];
          if (!slug || slug === 'search') return;

          // Extract basic info
          const name = $elem.find('h3, h4, [class*="title"], [class*="name"]').first().text().trim();
          const developer = $elem.find('[class*="developer"], [class*="author"]').first().text().trim();
          const ratingText = $elem.find('[class*="rating"]').text();
          const rating = ratingText.match(/(\d+\.?\d*)/)?.[1];

          if (name) {
            apps.push({
              slug,
              name,
              developer,
              rating: rating ? parseFloat(rating) : null,
              url: `https://apps.shopify.com/${slug}`
            });
          }
        });

        if (apps.length > 0) {
          foundApps = true;
          break;
        }
      }
    }

    if (!foundApps) {
      console.log('⚠ Could not find apps on search page, trying alternative method...');

      // Try to find any links to app pages
      $('a[href^="/"]').each((i, elem) => {
        if (apps.length >= limit) return false;

        const href = $(elem).attr('href');
        if (!href || href === '/' || href.startsWith('/search') || href.startsWith('/categories')) return;

        const slug = href.split('/').filter(Boolean)[0];
        const name = $(elem).text().trim();

        if (slug && name && name.length > 0 && name.length < 100) {
          // Check if this looks like an app link
          if (!apps.find(a => a.slug === slug)) {
            apps.push({
              slug,
              name,
              url: `https://apps.shopify.com/${slug}`
            });
          }
        }
      });
    }

    console.log(`✓ Found ${apps.length} apps for query: "${query}"`);

    return apps;
  } catch (error) {
    console.error(`✗ Error searching apps for "${query}":`, error.message);
    return [];
  }
}

/**
 * Find competitors for a given category/keyword
 */
export async function findCompetitors(category, options = {}) {
  const { limit = 10, detailed = false } = options;

  console.log(`\n🔍 Finding competitors in "${category}" category...`);

  // First, search for apps
  const apps = await searchApps(category, { limit });

  if (apps.length === 0) {
    console.log('⚠ No apps found');
    return [];
  }

  // Optionally fetch detailed info for each app
  if (detailed) {
    console.log(`\n📊 Fetching detailed info for ${apps.length} apps...`);

    const detailedApps = [];
    for (const app of apps) {
      const details = await scrapeAppDetails(app.slug);
      if (details) {
        detailedApps.push(details);
      }

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return detailedApps;
  }

  return apps;
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  if (!command) {
    console.log(`
Shopify App Store Scraper

Usage:
  node scripts/shopifyAppStoreScraper.js search <query>     Search for apps
  node scripts/shopifyAppStoreScraper.js app <slug>         Get app details
  node scripts/shopifyAppStoreScraper.js competitors <cat>  Find competitors

Examples:
  node scripts/shopifyAppStoreScraper.js search "subscription"
  node scripts/shopifyAppStoreScraper.js app recharge-subscriptions
  node scripts/shopifyAppStoreScraper.js competitors subscription
    `);
    process.exit(0);
  }

  try {
    let result;

    switch (command) {
      case 'search':
        if (!param) {
          console.error('Error: Please provide a search query');
          process.exit(1);
        }
        result = await searchApps(param, { limit: 20 });
        console.log('\n📱 Search Results:');
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'app':
        if (!param) {
          console.error('Error: Please provide an app slug');
          process.exit(1);
        }
        result = await scrapeAppDetails(param);
        console.log('\n📱 App Details:');
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'competitors':
        if (!param) {
          console.error('Error: Please provide a category');
          process.exit(1);
        }
        result = await findCompetitors(param, { limit: 10, detailed: true });
        console.log('\n🏆 Competitors:');
        console.log(JSON.stringify(result, null, 2));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    console.log(`\n✅ Done!`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
