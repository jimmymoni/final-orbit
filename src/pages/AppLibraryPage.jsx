import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ExternalLink, Search, BookOpen } from 'lucide-react';

export default function AppLibraryPage() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

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

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'updating':
        return 'warning';
      case 'deprecated':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">App Library</h1>
        <p className="text-gray-600 mt-2">
          Complete documentation for all FinalApps Shopify apps
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
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No apps added yet</p>
                <p className="text-sm mt-2">Apps will appear here once added by admins</p>
              </div>
            ) : (
              <p>No apps match your search</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/apps/${app.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-finalapps-blue rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {app.name.charAt(0)}
                    </span>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{app.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {app.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {app.pricing && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pricing:</span>
                      <span className="font-medium">{app.pricing}</span>
                    </div>
                  )}
                  {app.shopify_url && (
                    <a
                      href={app.shopify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-finalapps-blue hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on Shopify
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/apps/${app.id}`);
                    }}
                  >
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
