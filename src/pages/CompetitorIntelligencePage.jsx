import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Search,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Eye,
  ExternalLink,
  Star,
  Users,
  DollarSign,
  Package,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { findCompetitors } from '../services/shopifyAppStoreScraper';

export default function CompetitorIntelligencePage() {
  const [view, setView] = useState('overview'); // 'overview' | 'app-detail'
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    fetchApps();
    fetchInquiries();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    setView('app-detail');
    setLoading(true);

    try {
      // Fetch competitors from Shopify App Store
      const category = app.name.toLowerCase();
      const competitorData = await findCompetitors(category, { limit: 10 });

      setCompetitors(competitorData);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAppMentions = (appName) => {
    return inquiries.filter(inq => {
      const text = `${inq.title} ${inq.content}`.toLowerCase();
      return text.includes(appName.toLowerCase());
    });
  };

  const getCompetitorMentions = (competitorName) => {
    return inquiries.filter(inq => {
      const text = `${inq.title} ${inq.content}`.toLowerCase();
      return text.includes(competitorName.toLowerCase());
    });
  };

  const getSentimentForMentions = (mentions) => {
    let complaints = 0;
    let praises = 0;

    mentions.forEach(mention => {
      const text = `${mention.title} ${mention.content}`.toLowerCase();

      if (
        text.includes('problem') ||
        text.includes('issue') ||
        text.includes('bug') ||
        text.includes('slow') ||
        text.includes('expensive')
      ) {
        complaints++;
      } else if (
        text.includes('great') ||
        text.includes('love') ||
        text.includes('excellent') ||
        text.includes('recommend')
      ) {
        praises++;
      }
    });

    return { complaints, praises };
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && apps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Overview View
  if (view === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitor Intelligence</h1>
          <p className="text-gray-600 mt-2">
            Analyze your apps against competitors in the Shopify App Store
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search your apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Your Apps Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const mentions = getAppMentions(app.name);
              const { complaints, praises } = getSentimentForMentions(mentions);

              return (
                <Card
                  key={app.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-finalapps-blue"
                  onClick={() => handleSelectApp(app)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {app.logo_url ? (
                          <img
                            src={app.logo_url}
                            alt={app.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-finalapps-blue to-blue-700 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{app.name}</CardTitle>
                          <p className="text-sm text-gray-500">{app.pricing || 'View pricing'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Status */}
                      <Badge variant={app.status === 'active' ? 'success' : 'default'}>
                        {app.status}
                      </Badge>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Eye className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                          <p className="font-semibold text-gray-900">{mentions.length}</p>
                          <p className="text-xs text-gray-500">Mentions</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
                          <p className="font-semibold text-red-600">{complaints}</p>
                          <p className="text-xs text-gray-500">Issues</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <p className="font-semibold text-green-600">{praises}</p>
                          <p className="text-xs text-gray-500">Praises</p>
                        </div>
                      </div>

                      {/* Description */}
                      {app.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // App Detail View with Competitors
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => setView('overview')}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Apps
      </Button>

      {/* App Header */}
      <Card className="border-2 border-finalapps-blue">
        <CardHeader>
          <div className="flex items-start gap-4">
            {selectedApp.logo_url ? (
              <img
                src={selectedApp.logo_url}
                alt={selectedApp.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-finalapps-blue to-blue-700 flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl">{selectedApp.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {selectedApp.description || 'Analyze against competitors'}
              </CardDescription>
              {selectedApp.shopify_url && (
                <a
                  href={selectedApp.shopify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-finalapps-blue hover:underline flex items-center gap-1 mt-2"
                >
                  View on Shopify App Store
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Competitors Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Competitors ({competitors.length})
          </h2>
          <Badge variant="outline" className="text-sm">
            From Shopify App Store
          </Badge>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading competitors from Shopify App Store...
            </CardContent>
          </Card>
        ) : competitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No competitors found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {competitors.map((competitor, index) => {
              const mentions = getCompetitorMentions(competitor.name);
              const { complaints, praises } = getSentimentForMentions(mentions);

              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {competitor.name}
                          {competitor.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-normal text-gray-600">
                                {competitor.rating}
                              </span>
                            </div>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          by {competitor.developer}
                        </p>
                      </div>
                      {competitor.url && (
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-finalapps-blue hover:text-blue-700"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{competitor.reviewCount} reviews</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{competitor.pricing}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{mentions.length} mentions</span>
                        </div>
                      </div>

                      {/* Features */}
                      {competitor.features && competitor.features.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {competitor.features.slice(0, 3).map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Community Sentiment */}
                      {mentions.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Community Sentiment:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-medium">{complaints}</span>
                              <span className="text-gray-500">complaints</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 font-medium">{praises}</span>
                              <span className="text-gray-500">praises</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
