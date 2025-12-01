import { supabase } from '@/config/supabase';
import { scrapeAndTransform } from '@/services/shopifyScraper';

/**
 * Model layer for scraper operations
 */

export const scraperModel = {
  /**
   * Import inquiries from scraped data
   * @param {Array} inquiries - Array of inquiry objects
   * @returns {Promise<Object>} Result with success count and errors
   */
  async importInquiries(inquiries) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
      inserted: []
    };

    for (const inquiry of inquiries) {
      try {
        // Check if inquiry with this link already exists
        const { data: existing } = await supabase
          .from('inquiries')
          .select('id, link')
          .eq('link', inquiry.link)
          .single();

        if (existing) {
          console.log(`Skipping duplicate: ${inquiry.title}`);
          continue;
        }

        // Insert new inquiry
        const { data, error } = await supabase
          .from('inquiries')
          .insert(inquiry)
          .select()
          .single();

        if (error) {
          results.failed++;
          results.errors.push({
            inquiry: inquiry.title,
            error: error.message
          });
        } else {
          results.success++;
          results.inserted.push(data);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          inquiry: inquiry.title,
          error: error.message
        });
      }
    }

    return results;
  },

  /**
   * Scrape and import in one operation
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Import results
   */
  async scrapeAndImport(options = {}) {
    try {
      console.log('Starting scrape with options:', options);

      // Scrape and transform
      const inquiries = await scrapeAndTransform(options);

      console.log(`Scraped ${inquiries.length} topics`);

      if (inquiries.length === 0) {
        return {
          success: 0,
          failed: 0,
          errors: [],
          inserted: [],
          message: 'No new topics found'
        };
      }

      // Import into database
      const results = await this.importInquiries(inquiries);

      return {
        ...results,
        message: `Imported ${results.success} of ${inquiries.length} topics`
      };
    } catch (error) {
      console.error('Scrape and import failed:', error);
      throw error;
    }
  },

  /**
   * Get last scrape timestamp (from most recent inquiry created_at)
   * @returns {Promise<Date|null>} Last scrape date or null
   */
  async getLastScrapeDate() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return new Date(data.created_at);
  },

  /**
   * Scrape only new topics since last import
   * @param {Object} options - Additional scraping options
   * @returns {Promise<Object>} Import results
   */
  async scrapeNewTopics(options = {}) {
    const lastScrapeDate = await this.getLastScrapeDate();

    // If no previous scrape, get topics from last 24 hours
    const sinceDate = lastScrapeDate || new Date(Date.now() - 24 * 60 * 60 * 1000);

    console.log(`Scraping topics since ${sinceDate.toISOString()}`);

    return this.scrapeAndImport({
      ...options,
      sinceDate
    });
  },

  /**
   * Get scraping statistics
   * @returns {Promise<Object>} Scraping stats
   */
  async getScrapingStats() {
    const { data: totalInquiries } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true });

    const { data: todayInquiries } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const lastScrapeDate = await this.getLastScrapeDate();

    return {
      totalInquiries: totalInquiries?.length || 0,
      todayInquiries: todayInquiries?.length || 0,
      lastScrapeDate: lastScrapeDate?.toISOString() || null
    };
  }
};
