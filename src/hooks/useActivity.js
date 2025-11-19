import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityModel } from '@/models';

/**
 * React Query hooks for Activity Log
 */

// Fetch activity for an inquiry
export function useInquiryActivity(inquiryId) {
  return useQuery({
    queryKey: ['activity', 'inquiry', inquiryId],
    queryFn: () => activityModel.getByInquiryId(inquiryId),
    enabled: !!inquiryId,
  });
}

// Fetch recent activity
export function useRecentActivity(limit = 50) {
  return useQuery({
    queryKey: ['activity', 'recent', limit],
    queryFn: () => activityModel.getRecent(limit),
  });
}

// Create activity log entry mutation
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityData) => activityModel.create(activityData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activity', 'inquiry', variables.inquiry_id] });
      queryClient.invalidateQueries({ queryKey: ['activity', 'recent'] });
    },
  });
}
