/**
 * Shopify App Store API Service
 *
 * This service provides access to Shopify App Store data by calling
 * the backend scraper or using cached/mock data.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Execute backend scraper and return parsed results
 */
async function runScraper(command, param) {
  try {
    const scriptPath = './scripts/shopifyAppStoreScraper.js';
    const { stdout, stderr } = await execAsync(`node ${scriptPath} ${command} "${param}"`);

    if (stderr) {
      console.error('Scraper stderr:', stderr);
    }

    // Parse JSON from output (look for JSON in the output)
    const jsonMatch = stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('No JSON output from scraper');
  } catch (error) {
    console.error(`Error running scraper:`, error.message);
    return null;
  }
}

/**
 * Get detailed information about a specific app
 * @param {string} appSlug - App URL slug
 * @returns {Promise<Object>} App details
 */
export async function getAppDetails(appSlug) {
  return await runScraper('app', appSlug);
}

/**
 * Search for apps by keyword
 * Note: Search functionality is limited due to dynamic content loading
 * Falls back to mock data for now
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of apps
 */
export async function searchApps(query, options = {}) {
  const { limit = 20 } = options;

  // For now, use mock data for search since dynamic content is challenging
  return getMockAppData(query, limit);
}

/**
 * Find competitors for a given category
 * Uses a curated list of known competitor slugs
 * @param {string} category - Category keyword
 * @param {Object} options - Options
 * @returns {Promise<Array>} Competitor apps with full details
 */
export async function findCompetitors(category, options = {}) {
  const { limit = 10, detailed = true } = options;

  // Known competitor slugs by category (verified and working)
  const competitorSlugs = {
    'subscription': [
      'subscription-payments',  // Recharge Subscriptions App - 4.8 ⭐ (1971 reviews)
      'recurring-orders',       // BOLD Subscriptions App - 4.3 ⭐ (376 reviews)
      'seal-subscriptions'      // Seal Subscriptions App - 4.9 ⭐ (2157 reviews)
    ],
    'shipping': [
      'shipstation',            // ShipStation - 3.9 ⭐ (565 reviews)
      'aftership'               // AfterShip Order Tracking - 4.4 ⭐ (1267 reviews)
    ],
    'upsell': [
      'frequently-bought-together',  // Frequently Bought Together CBB - 4.9 ⭐ (1016 reviews)
      'checkout-upsell'              // Checkout Upsell - 4.0 ⭐ (1 review)
    ],
    'discount': [
      'volume-discounts'        // OO - Volume + Bundle discounts - 5.0 ⭐ (2 reviews)
    ]
  };

  const categoryLower = category.toLowerCase();
  let slugs = [];

  // Find matching category
  for (const [cat, catSlugs] of Object.entries(competitorSlugs)) {
    if (categoryLower.includes(cat)) {
      slugs = catSlugs;
      break;
    }
  }

  // If no category match, try subscription as default
  if (slugs.length === 0) {
    slugs = competitorSlugs.subscription;
  }

  // Limit slugs
  slugs = slugs.slice(0, limit);

  if (!detailed) {
    // Return basic info only
    return slugs.map(slug => ({
      slug,
      url: `https://apps.shopify.com/${slug}`
    }));
  }

  // Fetch detailed info for each app
  console.log(`Fetching details for ${slugs.length} competitors...`);
  const competitors = [];

  for (const slug of slugs) {
    try {
      const details = await getAppDetails(slug);
      if (details) {
        competitors.push(details);
      }

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching ${slug}:`, error.message);
    }
  }

  return competitors;
}

/**
 * Get mock data for development/fallback
 * (Kept from original implementation)
 */
function getMockAppData(query, limit) {
  const queryLower = query.toLowerCase();

  // Real competitor database (scraped from Shopify App Store)
  const mockApps = {
    'subscription': [
      {
        name: 'Recharge Subscriptions App',
        slug: 'subscription-payments',
        developer: 'Recharge',
        rating: 4.8,
        reviewCount: 1971,
        pricing: 'From $50/mo',
        category: 'Subscriptions',
        features: ['Recurring payments', 'Customer portal', 'Subscription analytics', 'Auto-charging', 'Product swaps'],
        url: 'https://apps.shopify.com/subscription-payments'
      },
      {
        name: 'BOLD Subscriptions App',
        slug: 'recurring-orders',
        developer: 'BOLD',
        rating: 4.3,
        reviewCount: 376,
        pricing: 'From $100/mo',
        category: 'Subscriptions',
        features: ['Flexible subscriptions', 'Prepaid options', 'Cancellation management', 'Email notifications'],
        url: 'https://apps.shopify.com/recurring-orders'
      },
      {
        name: 'Seal Subscriptions App',
        slug: 'seal-subscriptions',
        developer: 'Seal Subscriptions',
        rating: 4.9,
        reviewCount: 2157,
        pricing: 'From $5.95/mo',
        category: 'Subscriptions',
        features: ['Easy setup', 'Customer management', 'Multi-language support', 'Tiered discounts', 'Product swap'],
        url: 'https://apps.shopify.com/seal-subscriptions'
      }
    ],
    'shipping': [
      {
        name: 'ShipStation',
        slug: 'shipstation',
        developer: 'ShipStation',
        rating: 3.9,
        reviewCount: 565,
        pricing: 'From $14.99/mo',
        category: 'Shipping',
        features: ['Multi-carrier shipping', 'Batch processing', 'Tracking', 'Label printing', 'Order management'],
        url: 'https://apps.shopify.com/shipstation'
      },
      {
        name: 'AfterShip Order Tracking',
        slug: 'aftership',
        developer: 'AfterShip',
        rating: 4.4,
        reviewCount: 1267,
        pricing: 'From $11/mo',
        category: 'Shipping',
        features: ['Order tracking', 'Branded tracking page', 'SMS notifications', '1100+ carriers', 'Analytics'],
        url: 'https://apps.shopify.com/aftership'
      }
    ],
    'upsell': [
      {
        name: 'Frequently Bought Together CBB',
        slug: 'frequently-bought-together',
        developer: 'Code Black Belt',
        rating: 4.9,
        reviewCount: 1016,
        pricing: 'From $9.99/mo',
        category: 'Upsell',
        features: ['Product bundles', 'Cross-sell recommendations', 'AI-powered suggestions', 'Custom discounts'],
        url: 'https://apps.shopify.com/frequently-bought-together'
      },
      {
        name: 'Checkout Upsell',
        slug: 'checkout-upsell',
        developer: 'Softpulse Infotech',
        rating: 4.0,
        reviewCount: 1,
        pricing: 'From $5/mo',
        category: 'Upsell',
        features: ['Checkout upsells', 'One-click offers', 'Revenue boost', 'Easy setup'],
        url: 'https://apps.shopify.com/checkout-upsell'
      }
    ],
    'discount': [
      {
        name: 'OO ‑ Volume + Bundle discounts',
        slug: 'volume-discounts',
        developer: 'Online Origins',
        rating: 5.0,
        reviewCount: 2,
        pricing: 'From $8/mo',
        category: 'Discounts',
        features: ['Volume discounts', 'Bundle discounts', 'Tiered pricing', 'BOGO deals', 'Bulk orders'],
        url: 'https://apps.shopify.com/volume-discounts'
      }
    ]
  };

  // Find matching category
  for (const [category, apps] of Object.entries(mockApps)) {
    if (queryLower.includes(category)) {
      return apps.slice(0, limit);
    }
  }

  // Default: return subscription apps
  return mockApps.subscription.slice(0, limit);
}

/**
 * Batch fetch app details for multiple slugs
 * @param {Array<string>} slugs - Array of app slugs
 * @returns {Promise<Array>} Array of app details
 */
export async function batchGetAppDetails(slugs) {
  const apps = [];

  for (const slug of slugs) {
    try {
      const details = await getAppDetails(slug);
      if (details) {
        apps.push(details);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching ${slug}:`, error.message);
    }
  }

  return apps;
}

export default {
  getAppDetails,
  searchApps,
  findCompetitors,
  batchGetAppDetails
};
