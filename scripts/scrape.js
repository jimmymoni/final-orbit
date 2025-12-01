#!/usr/bin/env node

/**
 * Automated Scraper Script
 * Run this script via cron to automatically scrape Shopify Community
 *
 * Usage: node scripts/scrape.js
 *
 * Requires Node.js v18+ (native fetch support)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

const SHOPIFY_COMMUNITY_BASE = 'https://community.shopify.com';

// Categories where merchants ask real questions and look for apps
const CATEGORIES = {
  SHOPIFY_APPS: 186,           // App recommendations & questions
  SHOPIFY_DISCUSSION: 95,       // General merchant discussions & problems
  TECHNICAL_QA: 133,            // Technical questions & troubleshooting
  PAYMENTS_SHIPPING: 223,       // Payments & shipping issues
  ORDER_MANAGEMENT: 217,        // Order fulfillment questions
  MARKETING: 303,               // Marketing & advertising questions
};

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch topics from a category
 */
async function fetchCategoryTopics(categoryId, limit = 15) {
  try {
    const url = `${SHOPIFY_COMMUNITY_BASE}/c/${categoryId}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const topics = data.topic_list?.topics || [];

    return topics.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error.message);
    return [];
  }
}

/**
 * Determine category from title
 */
function determineCategoryFromTitle(title) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('app') || lowerTitle.includes('plugin')) return 'Apps';
  if (lowerTitle.includes('theme') || lowerTitle.includes('design')) return 'Themes';
  if (lowerTitle.includes('shipping') || lowerTitle.includes('delivery')) return 'Shipping';
  if (lowerTitle.includes('payment') || lowerTitle.includes('checkout')) return 'Payments';
  if (lowerTitle.includes('product') || lowerTitle.includes('inventory')) return 'Products';
  if (lowerTitle.includes('order') || lowerTitle.includes('fulfillment')) return 'Orders';
  if (lowerTitle.includes('marketing') || lowerTitle.includes('seo')) return 'Marketing';

  return 'General';
}

/**
 * Determine priority based on engagement
 */
function determinePriority(topic) {
  const views = topic.views || 0;
  const replies = topic.posts_count || 0;
  const likes = topic.like_count || 0;

  if (views > 1000 || replies > 20 || likes > 10) return 'high';
  if (views > 500 || replies > 10 || likes > 5) return 'normal';

  const urgentKeywords = ['urgent', 'emergency', 'critical', 'down', 'broken', 'not working'];
  const titleLower = (topic.title || '').toLowerCase();

  if (urgentKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'urgent';
  }

  return 'normal';
}

/**
 * Calculate relevance score - how likely this is a solvable problem
 * Returns a score from 0-100
 */
function calculateRelevanceScore(topic) {
  let score = 50; // Base score
  const title = (topic.title || '').toLowerCase();
  const excerpt = (topic.excerpt || '').toLowerCase();
  const combined = title + ' ' + excerpt;

  // HIGH VALUE INDICATORS (+points)
  const solutionKeywords = [
    'looking for', 'need', 'help', 'how to', 'how do i', 'how can', 'find an app',
    'recommend', 'suggestion', 'which app', 'best app', 'app for', 'problem with',
    'issue with', 'trying to', 'want to', 'need to', 'is there', 'does anyone know',
    'can someone', 'pls help', 'please help', 'stuck', 'having trouble'
  ];

  // Problem/solution seeking language
  solutionKeywords.forEach(keyword => {
    if (combined.includes(keyword)) score += 15;
  });

  // Question marks indicate genuine questions
  if (title.includes('?')) score += 10;

  // App-specific mentions
  const appKeywords = ['app', 'plugin', 'integration', 'tool', 'solution', 'software'];
  appKeywords.forEach(keyword => {
    if (combined.includes(keyword)) score += 8;
  });

  // Business problem indicators
  const businessKeywords = [
    'subscription', 'shipping', 'payment', 'checkout', 'cart', 'discount',
    'upsell', 'inventory', 'order', 'customer', 'email', 'seo', 'marketing'
  ];
  businessKeywords.forEach(keyword => {
    if (combined.includes(keyword)) score += 5;
  });

  // LOW VALUE INDICATORS (-points)
  const excludeKeywords = [
    'about the', 'announcement', 'celebrating', 'welcome to', 'introducing',
    'community read-only', 'maintenance', 'office hours', 'ama:', 'webinar'
  ];

  excludeKeywords.forEach(keyword => {
    if (combined.includes(keyword)) score -= 30;
  });

  // Engagement boosts relevance
  if (topic.views > 50) score += 5;
  if (topic.posts_count > 2) score += 10;

  // Cap score between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Check if topic should be imported based on relevance
 */
function shouldImportTopic(topic) {
  const score = calculateRelevanceScore(topic);
  // Only import topics with relevance score > 40
  return score > 40;
}

/**
 * Transform topic to inquiry format
 */
function transformTopic(topic) {
  return {
    title: topic.title || 'Untitled',
    content: topic.excerpt || topic.fancy_title || '',
    category: determineCategoryFromTitle(topic.title),
    link: `${SHOPIFY_COMMUNITY_BASE}/t/${topic.slug}/${topic.id}`,
    bandwidth_minutes: 240,
    priority: determinePriority(topic),
  };
}

/**
 * Check if inquiry already exists
 */
async function inquiryExists(link) {
  const { data } = await supabase
    .from('inquiries')
    .select('id')
    .eq('link', link)
    .single();

  return !!data;
}

/**
 * Import inquiry to database using RPC function
 * This bypasses RLS policies via SECURITY DEFINER function
 */
async function importInquiry(inquiry) {
  try {
    const { data, error } = await supabase.rpc('scraper_import_inquiry', {
      p_title: inquiry.title,
      p_content: inquiry.content,
      p_category: inquiry.category,
      p_link: inquiry.link,
      p_bandwidth_minutes: inquiry.bandwidth_minutes,
      p_priority: inquiry.priority,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Data is a jsonb response from the function
    if (data.success) {
      return { success: true, data: data };
    } else if (data.duplicate) {
      return { success: false, duplicate: true };
    } else {
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main scrape function
 */
async function scrape() {
  console.log('🚀 Starting Shopify Community scrape...');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log('');

  const stats = {
    total: 0,
    success: 0,
    duplicates: 0,
    failed: 0,
    errors: []
  };

  // Fetch from categories where merchants ask real questions
  const categoryIds = [
    CATEGORIES.SHOPIFY_APPS,      // #1 priority - people looking for apps
    CATEGORIES.SHOPIFY_DISCUSSION, // General problems
    CATEGORIES.TECHNICAL_QA,       // Technical issues
  ];

  for (const categoryId of categoryIds) {
    console.log(`📥 Fetching category ${categoryId}...`);
    const topics = await fetchCategoryTopics(categoryId, 10);  // 10 per category = 30 total
    console.log(`   Found ${topics.length} topics`);

    stats.total += topics.length;

    // Process each topic
    for (const topic of topics) {
      // Calculate relevance score
      const relevanceScore = calculateRelevanceScore(topic);

      // Skip low-relevance topics
      if (!shouldImportTopic(topic)) {
        console.log(`   ⏭️  Skipped (low relevance ${relevanceScore}): ${topic.title.substring(0, 50)}...`);
        stats.total--;  // Don't count skipped topics
        continue;
      }

      const inquiry = transformTopic(topic);
      const result = await importInquiry(inquiry);

      if (result.success) {
        stats.success++;
        console.log(`   ✅ Imported (score ${relevanceScore}): ${inquiry.title.substring(0, 50)}...`);
      } else if (result.duplicate) {
        stats.duplicates++;
      } else {
        stats.failed++;
        stats.errors.push({ title: inquiry.title, error: result.error });
        console.log(`   ❌ Failed: ${inquiry.title.substring(0, 50)}...`);
      }
    }

    console.log('');
  }

  // Print summary
  console.log('📊 Scrape Summary:');
  console.log(`   Total topics found: ${stats.total}`);
  console.log(`   ✅ Successfully imported: ${stats.success}`);
  console.log(`   ⏭️  Skipped (duplicates): ${stats.duplicates}`);
  console.log(`   ❌ Failed: ${stats.failed}`);

  if (stats.errors.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    stats.errors.forEach(err => {
      console.log(`   - ${err.title}: ${err.error}`);
    });
  }

  console.log('');
  console.log('✨ Scrape complete!');

  return stats;
}

// Run the scraper
scrape()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
