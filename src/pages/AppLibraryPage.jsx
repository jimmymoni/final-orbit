import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import AppKnowledgeBase from '../components/apps/AppKnowledgeBase';
import AppFavorites from '../components/apps/AppFavorites';
import { ExternalLink, Search, BookOpen, Star, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function AppLibraryPage() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = ['All', 'Sales', 'Marketing', 'Support', 'Dev', 'Analytics', 'General'];

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (id && apps.length > 0) {
      const app = apps.find(a => a.id === id);
      if (app) {
        setSelectedApp(app);
        trackAppUsage(id);
      }
    } else {
      setSelectedApp(null);
    }
  }, [id, apps]);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('name');

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackAppUsage = async (appId) => {
    if (!userProfile) return;

    try {
      await supabase
        .from('app_usage_tracking')
        .insert({
          user_id: userProfile.id,
          app_id: appId,
          action: 'view'
        });
    } catch (error) {
      console.error('Error tracking app usage:', error);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || app.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStatusBadgeVariant = (statusBadge) => {
    switch (statusBadge) {
      case 'Active':
        return 'success';
      case 'Beta':
        return 'warning';
      case 'In Development':
        return 'outline';
      case 'Deprecated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Detail View
  if (selectedApp) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/apps')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to App Library
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                      <img
                        src="/orbit-logo.png"
                        alt="Orbit Logo"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{selectedApp.name}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(selectedApp.status_badge || 'Active')}>
                          {selectedApp.status_badge || 'Active'}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {selectedApp.description || 'No description available'}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {selectedApp.shopify_url && (
                    <a
                      href={selectedApp.shopify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Shopify
                      </Button>
                    </a>
                  )}
                  <AppFavorites currentAppId={selectedApp.id} compact />
                </div>

                {selectedApp.pricing && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Pricing:</span>
                    <span className="text-gray-900">{selectedApp.pricing}</span>
                  </div>
                )}

                {selectedApp.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Category:</span>
                    <Badge variant="outline">{selectedApp.category}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {selectedApp.features && selectedApp.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedApp.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Base */}
            <AppKnowledgeBase app={selectedApp} />

            {/* Known Issues */}
            {selectedApp.known_issues && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-900">Known Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-800">{selectedApp.known_issues}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Use Cases */}
            {selectedApp.use_cases && selectedApp.use_cases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedApp.use_cases.map((useCase, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {useCase}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Competitors */}
            {selectedApp.competitors && selectedApp.competitors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Competitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedApp.competitors.map((competitor, index) => (
                      <li key={index} className="text-sm">
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {competitor.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Library Grid View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">App Library</h1>
        <p className="text-gray-600 mt-2">
          Complete documentation for all FinalApps Shopify apps with embedded Knowledge Base
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Apps Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading apps...</div>
      ) : filteredApps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {apps.length === 0 ? (
              <div>
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No apps added yet</p>
                <p className="text-sm mt-2">Apps will appear here once added by admins</p>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No apps match your search</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer overflow-hidden group flex flex-col h-full"
              onClick={() => {
                navigate(`/apps/${app.id}`);
                trackAppUsage(app.id);
              }}
            >
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                    <img
                      src="/orbit-logo.png"
                      alt="Orbit Logo"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {app.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant={getStatusBadgeVariant(app.status_badge || 'Active')}
                        className="text-xs"
                      >
                        {app.status_badge || 'Active'}
                      </Badge>
                      {app.category && (
                        <Badge variant="outline" className="text-xs">
                          {app.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[40px]">
                  {app.description || 'No description available'}
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 flex-grow flex flex-col">
                <Separator />
                <div className="space-y-3 flex-grow">
                  {app.pricing && (
                    <div className="text-sm">
                      <p className="text-xs text-gray-500 mb-1">Pricing</p>
                      <p className="font-medium text-gray-900 line-clamp-1">{app.pricing}</p>
                    </div>
                  )}
                  {app.kb_sections && app.kb_sections.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium">{app.kb_sections.length} KB article{app.kb_sections.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all mt-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/apps/${app.id}`);
                    trackAppUsage(app.id);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
