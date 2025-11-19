import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appsModel } from '@/models';
import { toast } from 'sonner';

/**
 * React Query hooks for Apps
 */

// Fetch all apps
export function useApps(filters = {}) {
  return useQuery({
    queryKey: ['apps', filters],
    queryFn: () => appsModel.getAll(filters),
  });
}

// Fetch single app
export function useApp(id) {
  return useQuery({
    queryKey: ['app', id],
    queryFn: () => appsModel.getById(id),
    enabled: !!id,
  });
}

// Search apps
export function useSearchApps(query) {
  return useQuery({
    queryKey: ['appsSearch', query],
    queryFn: () => appsModel.search(query),
    enabled: query.length > 0,
  });
}

// Create app mutation
export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appData) => appsModel.create(appData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success('App created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create app: ${error.message}`);
    },
  });
}

// Update app mutation
export function useUpdateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => appsModel.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['app', variables.id] });
      toast.success('App updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update app: ${error.message}`);
    },
  });
}

// Delete app mutation
export function useDeleteApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => appsModel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success('App deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete app: ${error.message}`);
    },
  });
}
