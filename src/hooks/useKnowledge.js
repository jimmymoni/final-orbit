import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeModel } from '@/models';
import { toast } from 'sonner';

/**
 * React Query hooks for Knowledge Base
 */

// Fetch all knowledge base articles
export function useKnowledgeBase(filters = {}) {
  return useQuery({
    queryKey: ['knowledge', filters],
    queryFn: () => knowledgeModel.getAll(filters),
  });
}

// Fetch single article
export function useKnowledgeArticle(id) {
  return useQuery({
    queryKey: ['knowledgeArticle', id],
    queryFn: () => knowledgeModel.getById(id),
    enabled: !!id,
  });
}

// Fetch categories
export function useKnowledgeCategories() {
  return useQuery({
    queryKey: ['knowledgeCategories'],
    queryFn: () => knowledgeModel.getCategories(),
  });
}

// Search knowledge base
export function useSearchKnowledge(query) {
  return useQuery({
    queryKey: ['knowledgeSearch', query],
    queryFn: () => knowledgeModel.search(query),
    enabled: query.length > 0,
  });
}

// Create article mutation
export function useCreateKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleData) => knowledgeModel.create(articleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategories'] });
      toast.success('Article created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create article: ${error.message}`);
    },
  });
}

// Update article mutation
export function useUpdateKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => knowledgeModel.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticle', variables.id] });
      toast.success('Article updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });
}

// Delete article mutation
export function useDeleteKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => knowledgeModel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategories'] });
      toast.success('Article deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });
}
