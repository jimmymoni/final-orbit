import { supabase } from '@/config/supabase';

/**
 * Model layer for Replies - handles all Supabase API calls
 */

export const repliesModel = {
  // Fetch replies for an inquiry
  async getByInquiryId(inquiryId) {
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        user:users (
          id,
          name,
          email
        )
      `)
      .eq('inquiry_id', inquiryId)
      .order('replied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch replies by user
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        inquiry:inquiries (
          id,
          title,
          category
        )
      `)
      .eq('user_id', userId)
      .order('replied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create new reply
  async create(replyData) {
    const { data, error } = await supabase
      .from('replies')
      .insert(replyData)
      .select()
      .single();

    if (error) throw error;

    // Calculate score
    if (data.id && replyData.inquiry_id) {
      await this.calculateScore(replyData.inquiry_id, data.id);
    }

    // Update user stats
    if (replyData.user_id) {
      await this.updateUserStats(replyData.user_id);
    }

    return data;
  },

  // Calculate reply score
  async calculateScore(inquiryId, replyId) {
    const { data, error } = await supabase
      .rpc('calculate_reply_score', {
        p_inquiry_id: inquiryId,
        p_reply_id: replyId,
      });

    if (error) throw error;
    return data;
  },

  // Update user stats
  async updateUserStats(userId) {
    const { error } = await supabase
      .rpc('update_user_stats', {
        p_user_id: userId,
      });

    if (error) throw error;
    return true;
  },
};
