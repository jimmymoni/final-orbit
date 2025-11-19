import { supabase } from '@/config/supabase';

/**
 * Model layer for Knowledge Base - handles all Supabase API calls
 */

export const knowledgeModel = {
  // Fetch all knowledge base articles
  async getAll(filters = {}) {
    let query = supabase
      .from('knowledge_base')
      .select('*')
      .order('category')
      .order('title');

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Fetch single article by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new article
  async create(articleData) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(articleData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update article
  async update(id, updates) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete article
  async delete(id) {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Search articles
  async search(query) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .or(`title.ilike.%${query}%,markdown_content.ilike.%${query}%`)
      .order('category')
      .order('title');

    if (error) throw error;
    return data;
  },

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('category')
      .order('category');

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  },
};
