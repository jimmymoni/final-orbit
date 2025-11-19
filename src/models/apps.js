import { supabase } from '@/config/supabase';

/**
 * Model layer for Apps - handles all Supabase API calls
 */

export const appsModel = {
  // Fetch all apps
  async getAll(filters = {}) {
    let query = supabase
      .from('apps')
      .select('*')
      .order('name');

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Fetch single app by ID
  async getById(id) {
    const { data, error} = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new app
  async create(appData) {
    const { data, error } = await supabase
      .from('apps')
      .insert(appData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update app
  async update(id, updates) {
    const { data, error } = await supabase
      .from('apps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete app
  async delete(id) {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Search apps by query
  async search(query) {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data;
  },
};
