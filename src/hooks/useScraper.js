import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scraperModel } from '@/models';

/**
 * Hook to scrape and import new topics
 */
export function useScrapeTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options) => scraperModel.scrapeAndImport(options),
    onSuccess: (data) => {
      // Invalidate inquiries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry-stats'] });
    }
  });
}

/**
 * Hook to scrape only new topics since last scrape
 */
export function useScrapeNewTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options) => scraperModel.scrapeNewTopics(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-stats'] });
    }
  });
}

/**
 * Hook to get scraping statistics
 */
export function useScrapingStats() {
  return useQuery({
    queryKey: ['scraping-stats'],
    queryFn: () => scraperModel.getScrapingStats(),
    refetchInterval: 60000, // Refetch every minute
  });
}
