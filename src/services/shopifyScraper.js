/**
 * Shopify Community Scraper
 * Fetches data from community.shopify.com using Discourse API
 */

const SHOPIFY_COMMUNITY_BASE = 'https://community.shopify.com';

// Category IDs from Shopify Community - where merchants ask real questions
const CATEGORIES = {
  SHOPIFY_APPS: 186,           // App recommendations & questions
  SHOPIFY_DISCUSSION: 95,      // General merchant discussions & problems
  TECHNICAL_QA: 133,           // Technical questions & troubleshooting
  PAYMENTS_SHIPPING: 223,      // Payments & shipping issues
  ORDER_MANAGEMENT: 217,       // Order fulfillment questions
  MARKETING: 303,              // Marketing & advertising questions
};

/**
 * Fetch latest topics from Shopify Community
 * @param {Object} options - Scraping options
 * @param {number} options.limit - Number of topics to fetch (default: 30)
 * @param {number} options.categoryId - Filter by category ID (optional)
 * @returns {Promise<Array>} Array of topics
 */
export async function fetchLatestTopics(options = {}) {
  const { limit = 30, categoryId } = options;

  try {
    let url = categoryId
      ? `${SHOPIFY_COMMUNITY_BASE}/c/${categoryId}.json`
      : `${SHOPIFY_COMMUNITY_BASE}/latest.json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract topics from response
    const topics = data.topic_list?.topics || [];

    // Limit results
    return topics.slice(0, limit);
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
}

/**
 * Fetch a single topic with all its posts
 * @param {number} topicId - The topic ID
 * @returns {Promise<Object>} Topic with posts
 */
export async function fetchTopicDetails(topicId) {
  try {
    const url = `${SHOPIFY_COMMUNITY_BASE}/t/${topicId}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch topic ${topicId}: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Search for topics containing specific keywords
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching topics
 */
export async function searchTopics(query, options = {}) {
  const { limit = 30 } = options;

  try {
    const url = `${SHOPIFY_COMMUNITY_BASE}/search.json?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const topics = data.topics || [];

    return topics.slice(0, limit);
  } catch (error) {
    console.error('Error searching topics:', error);
    throw error;
  }
}

/**
 * Transform Discourse topic to inquiry format
 * @param {Object} topic - Discourse topic object
 * @param {Object} options - Transform options
 * @returns {Object} Inquiry data ready for database
 */
export function transformTopicToInquiry(topic, options = {}) {
  const {
    defaultPriority = 'normal',
    defaultBandwidthMinutes = 240,
    categoryMap = {}
  } = options;

  // Map Discourse category ID to your app categories
  const category = categoryMap[topic.category_id] || determineCategoryFromTitle(topic.title);

  // Determine priority based on views, replies, or keywords
  const priority = determinePriority(topic);

  return {
    title: topic.title || 'Untitled',
    content: topic.excerpt || topic.fancy_title || '',
    category: category,
    link: `${SHOPIFY_COMMUNITY_BASE}/t/${topic.slug}/${topic.id}`,
    bandwidth_minutes: defaultBandwidthMinutes,
    priority: priority,
    // Don't set assigned_to here - let database trigger handle it
    // Don't set deadline_at - database trigger will calculate it
  };
}

/**
 * Determine category from topic title using keywords
 * @param {string} title - Topic title
 * @returns {string} Category name
 */
function determineCategoryFromTitle(title) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('app') || lowerTitle.includes('plugin')) {
    return 'Apps';
  }
  if (lowerTitle.includes('theme') || lowerTitle.includes('design')) {
    return 'Themes';
  }
  if (lowerTitle.includes('shipping') || lowerTitle.includes('delivery')) {
    return 'Shipping';
  }
  if (lowerTitle.includes('payment') || lowerTitle.includes('checkout')) {
    return 'Payments';
  }
  if (lowerTitle.includes('product') || lowerTitle.includes('inventory')) {
    return 'Products';
  }
  if (lowerTitle.includes('order') || lowerTitle.includes('fulfillment')) {
    return 'Orders';
  }
  if (lowerTitle.includes('marketing') || lowerTitle.includes('seo')) {
    return 'Marketing';
  }

  return 'General';
}

/**
 * Determine priority based on topic metrics
 * @param {Object} topic - Discourse topic
 * @returns {string} Priority level
 */
function determinePriority(topic) {
  const views = topic.views || 0;
  const replies = topic.posts_count || 0;
  const likes = topic.like_count || 0;

  // High engagement = higher priority
  if (views > 1000 || replies > 20 || likes > 10) {
    return 'high';
  }

  if (views > 500 || replies > 10 || likes > 5) {
    return 'normal';
  }

  // Check for urgent keywords in title
  const urgentKeywords = ['urgent', 'emergency', 'critical', 'down', 'broken', 'not working'];
  const titleLower = (topic.title || '').toLowerCase();

  if (urgentKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'urgent';
  }

  return 'normal';
}

/**
 * Fetch topics created after a specific date
 * @param {Date} sinceDate - Only fetch topics after this date
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} Array of new topics
 */
export async function fetchNewTopicsSince(sinceDate, options = {}) {
  const topics = await fetchLatestTopics(options);

  const sinceTimestamp = new Date(sinceDate).getTime();

  // Filter topics created after sinceDate
  return topics.filter(topic => {
    const topicDate = new Date(topic.created_at).getTime();
    return topicDate > sinceTimestamp;
  });
}

/**
 * Fetch topics from specific categories (e.g., app-related)
 * @param {Array<number>} categoryIds - Array of category IDs to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} Combined array of topics from all categories
 */
export async function fetchFromMultipleCategories(categoryIds, options = {}) {
  const { limit = 30 } = options;

  // Fetch from each category in parallel
  const promises = categoryIds.map(categoryId =>
    fetchLatestTopics({ ...options, categoryId, limit: Math.ceil(limit / categoryIds.length) })
  );

  const results = await Promise.all(promises);

  // Flatten and combine
  const allTopics = results.flat();

  // Sort by created_at descending
  allTopics.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allTopics.slice(0, limit);
}

/**
 * Get app-related categories (convenience function)
 */
export function getAppRelatedCategories() {
  return [
    CATEGORIES.SHOPIFY_APPS,      // #1 priority - people looking for apps
    CATEGORIES.SHOPIFY_DISCUSSION, // General problems & solutions
    CATEGORIES.TECHNICAL_QA,       // Technical questions
  ];
}

/**
 * Scrape and transform topics ready for database import
 * @param {Object} options - Scraping options
 * @returns {Promise<Array>} Array of inquiry objects ready for insert
 */
export async function scrapeAndTransform(options = {}) {
  const {
    categoryIds = getAppRelatedCategories(),
    limit = 30,
    sinceDate = null,
    ...transformOptions
  } = options;

  // Fetch topics
  let topics;
  if (sinceDate) {
    topics = await fetchNewTopicsSince(sinceDate, { limit, categoryIds });
  } else if (categoryIds) {
    topics = await fetchFromMultipleCategories(categoryIds, { limit });
  } else {
    topics = await fetchLatestTopics({ limit });
  }

  // Transform to inquiry format
  const inquiries = topics.map(topic =>
    transformTopicToInquiry(topic, transformOptions)
  );

  return inquiries;
}

/**
 * Export categories for easy access
 */
export { CATEGORIES };
