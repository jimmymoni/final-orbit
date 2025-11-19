import { supabase } from '@/config/supabase';

/**
 * Model layer for Activity Log - handles all Supabase API calls
 */

export const activityModel = {
  // Fetch activity for an inquiry
  async getByInquiryId(inquiryId) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users (
          id,
          name,
          email
        )
      `)
      .eq('inquiry_id', inquiryId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch recent activity (for dashboard timeline)
  async getRecent(limit = 50) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users (
          id,
          name,
          email
        ),
        inquiry:inquiries (
          id,
          title
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Create activity log entry
  async create(activityData) {
    const { data, error } = await supabase
      .from('activity_log')
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to real-time activity
  subscribe(callback) {
    const subscription = supabase
      .channel('activity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};
