import { supabase } from '@/config/supabase';

/**
 * Model layer for Inquiries - handles all Supabase API calls
 */

export const inquiriesModel = {
  // Fetch all inquiries with user assignments
  async getAll(filters = {}) {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Fetch single inquiry by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          name,
          email,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new inquiry
  async create(inquiryData) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update inquiry
  async update(id, updates) {
    const { data, error } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete inquiry
  async delete(id) {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Get inquiries assigned to a specific user
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          name,
          email,
          role
        )
      `)
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get inquiry statistics
  async getStats(filters = {}) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('status, priority, category, created_at');

    if (error) throw error;

    // Calculate stats
    const total = data.length;
    const byStatus = data.reduce((acc, inquiry) => {
      acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = data.reduce((acc, inquiry) => {
      acc[inquiry.priority] = (acc[inquiry.priority] || 0) + 1;
      return acc;
    }, {});

    const byCategory = data.reduce((acc, inquiry) => {
      const cat = inquiry.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
    };
  },

  // Subscribe to real-time changes
  subscribe(callback) {
    const subscription = supabase
      .channel('inquiries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inquiries',
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};
