import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersModel } from '@/models';
import { toast } from 'sonner';

/**
 * React Query hooks for Users
 */

// Fetch all users
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersModel.getAll(filters),
  });
}

// Fetch single user
export function useUser(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersModel.getById(id),
    enabled: !!id,
  });
}

// Fetch user with stats
export function useUserWithStats(id) {
  return useQuery({
    queryKey: ['userWithStats', id],
    queryFn: () => usersModel.getWithStats(id),
    enabled: !!id,
  });
}

// Fetch leaderboard
export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => usersModel.getLeaderboard(limit),
  });
}

// Fetch users with workload
export function useUsersWithWorkload() {
  return useQuery({
    queryKey: ['usersWithWorkload'],
    queryFn: () => usersModel.getUsersWithWorkload(),
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => usersModel.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['usersWithWorkload'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
}

// Toggle user active status mutation
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => usersModel.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['usersWithWorkload'] });
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });
}
