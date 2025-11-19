import { supabase } from '@/config/supabase';

/**
 * Model layer for Users - handles all Supabase API calls
 */

export const usersModel = {
  // Fetch all users
  async getAll(filters = {}) {
    let query = supabase
      .from('users')
      .select('*')
      .order('name');

    // Apply filters
    if (filters.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Fetch single user by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user with their stats
  async getWithStats(id) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        assigned_inquiries:inquiries(count),
        replies(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle user active status
  async toggleActive(id, active) {
    return this.update(id, { active });
  },

  // Get leaderboard (top users by score)
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('active', true)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get users with current workload
  async getUsersWithWorkload() {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('active', true)
      .order('name');

    if (usersError) throw usersError;

    // Get inquiry counts for each user
    const usersWithWorkload = await Promise.all(
      users.map(async (user) => {
        const { count, error } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .in('status', ['assigned', 'escalated']);

        return {
          ...user,
          current_workload: count || 0,
        };
      })
    );

    return usersWithWorkload;
  },
};
