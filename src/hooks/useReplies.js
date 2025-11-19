import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repliesModel } from '@/models';
import { toast } from 'sonner';

/**
 * React Query hooks for Replies
 */

// Fetch replies for an inquiry
export function useInquiryReplies(inquiryId) {
  return useQuery({
    queryKey: ['replies', 'inquiry', inquiryId],
    queryFn: () => repliesModel.getByInquiryId(inquiryId),
    enabled: !!inquiryId,
  });
}

// Fetch replies by user
export function useUserReplies(userId) {
  return useQuery({
    queryKey: ['replies', 'user', userId],
    queryFn: () => repliesModel.getByUserId(userId),
    enabled: !!userId,
  });
}

// Create reply mutation
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyData) => repliesModel.create(replyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['replies', 'inquiry', variables.inquiry_id] });
      queryClient.invalidateQueries({ queryKey: ['inquiry', variables.inquiry_id] });
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Reply submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit reply: ${error.message}`);
    },
  });
}
