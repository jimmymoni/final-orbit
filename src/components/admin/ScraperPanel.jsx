import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useScrapingStats, useScrapeNewTopics } from '@/hooks/useScraper';
import { toast } from 'sonner';

export default function ScraperPanel() {
  const { data: stats, isLoading: statsLoading } = useScrapingStats();
  const scrapeMutation = useScrapeNewTopics();
  const [lastResult, setLastResult] = useState(null);

  const handleScrape = async () => {
    try {
      toast.info('Starting scrape...');

      const result = await scrapeMutation.mutateAsync({
        limit: 30,
      });

      setLastResult(result);

      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} new inquiries!`);
      } else {
        toast.info(result.message || 'No new inquiries found');
      }

      if (result.errors && result.errors.length > 0) {
        console.error('Scrape errors:', result.errors);
        toast.warning(`${result.errors.length} inquiries failed to import`);
      }
    } catch (error) {
      console.error('Scrape failed:', error);
      toast.error('Failed to scrape: ' + error.message);
    }
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Inquiries</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalInquiries || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className="text-3xl">{stats?.todayInquiries || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last Scrape</CardDescription>
            <CardTitle className="text-sm">
              {stats?.lastScrapeDate ? (
                new Date(stats.lastScrapeDate).toLocaleString()
              ) : (
                'Never'
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Scraper Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Shopify Community Scraper
          </CardTitle>
          <CardDescription>
            Import new topics from Shopify Community forums using the Discourse API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Fetches real merchant questions from community.shopify.com</li>
              <li>• Targets: Shopify Apps, Discussions, Technical Q&A</li>
              <li>• Automatically categorizes and prioritizes</li>
              <li>• Skips duplicates based on topic URL</li>
              <li>• Auto-assigns to team members via round-robin</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleScrape}
              disabled={scrapeMutation.isPending}
              className="gap-2"
            >
              {scrapeMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Scrape New Topics
                </>
              )}
            </Button>
          </div>

          {/* Last Scrape Result */}
          {lastResult && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Scrape Result
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Success:</span>
                  <Badge variant="outline" className="text-green-700 border-green-700">
                    {lastResult.success}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-gray-600">Failed:</span>
                  <Badge variant="outline" className="text-red-700 border-red-700">
                    {lastResult.failed}
                  </Badge>
                </div>
              </div>
              {lastResult.message && (
                <p className="mt-3 text-sm text-gray-600">{lastResult.message}</p>
              )}
              {lastResult.errors && lastResult.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="text-sm text-red-600 cursor-pointer">
                    View Errors ({lastResult.errors.length})
                  </summary>
                  <ul className="mt-2 text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {lastResult.errors.map((err, i) => (
                      <li key={i}>
                        {err.inquiry}: {err.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Configuration</h4>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Source:</dt>
                <dd className="font-medium">community.shopify.com</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Categories:</dt>
                <dd className="font-medium">Apps (186), Discussion (95), Tech Q&A (133)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Default Bandwidth:</dt>
                <dd className="font-medium">240 minutes (4 hours)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Auto-Assignment:</dt>
                <dd className="font-medium">Round-robin</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Used</CardTitle>
          <CardDescription>Discourse REST API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div className="bg-gray-100 p-2 rounded">
              GET /c/&#123;category_id&#125;.json
            </div>
            <div className="bg-gray-100 p-2 rounded">
              GET /latest.json
            </div>
            <div className="bg-gray-100 p-2 rounded">
              GET /t/&#123;topic_id&#125;.json
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            All endpoints are publicly accessible without authentication
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
