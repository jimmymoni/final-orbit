import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiriesModel } from '@/models';
import { toast } from 'sonner';

/**
 * React Query hooks for Inquiries
 */

// Fetch all inquiries
export function useInquiries(filters = {}) {
  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => inquiriesModel.getAll(filters),
  });
}

// Fetch single inquiry
export function useInquiry(id) {
  return useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => inquiriesModel.getById(id),
    enabled: !!id,
  });
}

// Fetch inquiry statistics
export function useInquiryStats(filters = {}) {
  return useQuery({
    queryKey: ['inquiryStats', filters],
    queryFn: () => inquiriesModel.getStats(filters),
  });
}

// Create inquiry mutation
export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryData) => inquiriesModel.create(inquiryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create inquiry: ${error.message}`);
    },
  });
}

// Update inquiry mutation
export function useUpdateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => inquiriesModel.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry', variables.id] });
      toast.success('Inquiry updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update inquiry: ${error.message}`);
    },
  });
}

// Delete inquiry mutation
export function useDeleteInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => inquiriesModel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete inquiry: ${error.message}`);
    },
  });
}
