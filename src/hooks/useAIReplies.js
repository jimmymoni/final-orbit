import { useMutation } from '@tanstack/react-query';
import { generateReplySuggestions, getFallbackReplies } from '@/services/aiReply';
import { isReplicateConfigured } from '@/services/replicate';
import { toast } from 'sonner';

/**
 * React Query hook for AI reply generation
 */

export function useGenerateReplies() {
  return useMutation({
    mutationFn: async (inquiry) => {
      // Check if Replicate is configured
      if (!isReplicateConfigured()) {
        toast.warning('AI replies not configured. Using fallback replies.');
        return getFallbackReplies();
      }

      // Generate AI replies
      return await generateReplySuggestions(inquiry);
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.suggestions.length} reply suggestions!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate replies');
    },
  });
}
